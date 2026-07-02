import { promises as fs } from 'node:fs';
import path from 'node:path';
import type { ManagedBlog } from '@/types';
import { cloneSeed } from './seed';
import { sortBlogs } from './order';

// ---------------------------------------------------------------------------
// CANONICAL blog store — the single source of truth the public blog pages and
// the admin API read/write. Two interchangeable backends, chosen at runtime so
// the rest of the app is host-agnostic:
//
//   • KV (network)  — used when KV_REST_API_URL + KV_REST_API_TOKEN (Vercel KV)
//     OR UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN (Upstash) are set.
//     REQUIRED on serverless / read-only hosts (e.g. Vercel): there the
//     filesystem is read-only AND ephemeral, so file writes never persist — that
//     is exactly why admin changes weren't showing up on the public /blog page.
//   • File          — public/data/blogs.json (default, no setup). Works on any
//     host with a persistent, writable filesystem: local `next dev`, and a
//     self-hosted Node server incl. a WINDOWS SERVER running `next start`.
//
// Do NOT import this file from client components — it uses node:fs.
// ---------------------------------------------------------------------------

// Trailing slash stripped so `${KV_URL}` + endpoint never double-slashes.
const KV_URL = (process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL ?? '').replace(/\/+$/, '');
const KV_TOKEN = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN ?? '';
const USE_KV = Boolean(KV_URL && KV_TOKEN);
const KV_KEY = 'kaizen_blogs_v2';

const FILE_PATH = path.join(process.cwd(), 'public', 'data', 'blogs.json');

function isValid(data: unknown): data is ManagedBlog[] {
  return Array.isArray(data) && data.every((b) => b && typeof b === 'object' && 'id' in b && 'slug' in b);
}

// ── KV backend (Upstash Redis REST — the same endpoint Vercel KV uses) ────────
// Single-command REST format: POST the endpoint with a `["CMD", ...args]` body.
async function kvCommand<T>(command: unknown[]): Promise<T> {
  const res = await fetch(KV_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${KV_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(command),
    cache: 'no-store',
  });
  const json = (await res.json().catch(() => ({}))) as { result?: T; error?: string };
  if (!res.ok || json.error) throw new Error(json.error || `KV HTTP ${res.status}`);
  return json.result as T;
}

async function kvRead(): Promise<ManagedBlog[] | null> {
  const raw = await kvCommand<string | null>(['GET', KV_KEY]);
  if (!raw) return null;
  const parsed = JSON.parse(raw);
  return isValid(parsed) ? parsed : null;
}

async function kvWrite(blogs: ManagedBlog[]): Promise<void> {
  await kvCommand<'OK'>(['SET', KV_KEY, JSON.stringify(blogs)]);
}

// ── File backend ──────────────────────────────────────────────────────────────
async function fileRead(): Promise<ManagedBlog[] | null> {
  try {
    const parsed = JSON.parse(await fs.readFile(FILE_PATH, 'utf8'));
    return isValid(parsed) ? parsed : null;
  } catch {
    return null; // missing / unreadable / invalid → caller seeds
  }
}

async function fileWrite(blogs: ManagedBlog[]): Promise<void> {
  await fs.mkdir(path.dirname(FILE_PATH), { recursive: true });
  await fs.writeFile(FILE_PATH, JSON.stringify(blogs, null, 2), 'utf8');
}

// ── Backend-agnostic public API ───────────────────────────────────────────────

/** Read the full blog set. Lazily seeds the store (KV or file) when empty. */
export async function getBlogs(): Promise<ManagedBlog[]> {
  try {
    const existing = USE_KV ? await kvRead() : await fileRead();
    if (existing) return existing;
  } catch (err) {
    // Store unreachable — serve the seed so the public blog is never blank.
    console.error('[blog store] read failed:', err instanceof Error ? err.message : err);
    return cloneSeed();
  }
  // Empty store → seed it (best effort) so future reads/visitors are served from it.
  const seed = cloneSeed();
  try {
    await saveBlogs(seed);
  } catch {
    // read-only FS with no KV configured — callers still get the seed.
  }
  return seed;
}

/** Overwrite the whole blog set (admin save). Throws if the backend rejects. */
export async function saveBlogs(blogs: ManagedBlog[]): Promise<void> {
  if (USE_KV) await kvWrite(blogs);
  else await fileWrite(blogs);
}

/**
 * Published, public-facing posts — hidden/draft filtered out and ordered for the
 * site: the single Featured post first, then newest → oldest.
 */
export async function getPublished(): Promise<ManagedBlog[]> {
  return sortBlogs((await getBlogs()).filter((b) => b.status === 'published'));
}

/** Which backend is active — handy for the admin UI / diagnostics. */
export const STORE_BACKEND: 'kv' | 'file' = USE_KV ? 'kv' : 'file';
