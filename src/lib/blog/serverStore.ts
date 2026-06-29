import { promises as fs } from 'node:fs';
import path from 'node:path';
import type { ManagedBlog } from '@/types';
import { cloneSeed } from './seed';

// ---------------------------------------------------------------------------
// Server-side persistence for public/data/blogs.json. This is the CANONICAL
// store the public blog pages read from. The admin panel writes it through the
// /api/admin/blogs route. NOTE: writing requires a persistent filesystem
// (works on a Node server incl. `next dev` / self-host; NOT on serverless
// read-only FS — there reads still work and the Export button is the fallback).
// Do NOT import this file from client components — it uses `node:fs`.
// ---------------------------------------------------------------------------

const FILE_PATH = path.join(process.cwd(), 'public', 'data', 'blogs.json');

function isValid(data: unknown): data is ManagedBlog[] {
  return Array.isArray(data) && data.every((b) => b && typeof b === 'object' && 'id' in b && 'slug' in b);
}

/** Read the JSON file. If missing/invalid, lazily seed it from SEED_BLOGS. */
export async function getBlogsFromFile(): Promise<ManagedBlog[]> {
  try {
    const raw = await fs.readFile(FILE_PATH, 'utf8');
    const parsed = JSON.parse(raw);
    if (isValid(parsed)) return parsed;
  } catch {
    // file missing or unreadable → fall through to seed
  }

  const seed = cloneSeed();
  // Best-effort: create the file so subsequent reads/visitors are served from it.
  try {
    await saveBlogsToFile(seed);
  } catch {
    // read-only FS (e.g. serverless) — fine, callers still get the seed
  }
  return seed;
}

/** Overwrite the JSON file with the full blog set (admin save). */
export async function saveBlogsToFile(blogs: ManagedBlog[]): Promise<void> {
  await fs.mkdir(path.dirname(FILE_PATH), { recursive: true });
  await fs.writeFile(FILE_PATH, JSON.stringify(blogs, null, 2), 'utf8');
}

/** Published, public-facing posts (hidden/draft filtered out). */
export async function getPublishedFromFile(): Promise<ManagedBlog[]> {
  const all = await getBlogsFromFile();
  return all.filter((b) => b.status === 'published');
}
