import type { ManagedBlog, BlogStatus } from '@/types';
import { ADMIN_PASSWORD, ADMIN_STORAGE_KEY } from './config';

// ---------------------------------------------------------------------------
// Admin working store. Blogs live in localStorage for instant, offline GUI
// editing; every mutation is ALSO pushed to public/data/blogs.json via the API
// so the public site (which reads that file) reflects the change. localStorage
// is the working copy keyed by id; the JSON file is the published source.
// ---------------------------------------------------------------------------

const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((cb) => cb());
}

export function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  if (typeof window !== 'undefined') {
    const onStorage = (e: StorageEvent) => {
      if (e.key === ADMIN_STORAGE_KEY) cb();
    };
    window.addEventListener('storage', onStorage);
    return () => {
      listeners.delete(cb);
      window.removeEventListener('storage', onStorage);
    };
  }
  return () => listeners.delete(cb);
}

export function getLocal(): ManagedBlog[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(ADMIN_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function setLocal(blogs: ManagedBlog[]) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(blogs));
  } catch (err) {
    // Most likely the ~5MB quota (large base64 images). Surface it to the caller.
    throw new Error(
      'Could not save to localStorage (storage full?). Try smaller images. ' +
        String(err instanceof Error ? err.message : err),
    );
  }
  notify();
}

export interface PersistResult {
  localOk: boolean;
  fileOk: boolean;
  error?: string;
}

/** Push the full set to public/data/blogs.json (server write). */
async function persistToFile(blogs: ManagedBlog[]): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch('/api/admin/blogs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-token': ADMIN_PASSWORD },
      body: JSON.stringify({ blogs }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return { ok: false, error: data.error || `HTTP ${res.status}` };
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, error: String(err instanceof Error ? err.message : err) };
  }
}

/** Write localStorage + file together. */
async function commit(blogs: ManagedBlog[]): Promise<PersistResult> {
  let localOk = true;
  let localErr: string | undefined;
  try {
    setLocal(blogs);
  } catch (err) {
    localOk = false;
    localErr = String(err instanceof Error ? err.message : err);
  }
  const file = await persistToFile(blogs);
  return { localOk, fileOk: file.ok, error: localErr ?? file.error };
}

/**
 * Load the admin set. Prefers localStorage; if empty, pulls the canonical file
 * (which the server lazily seeds), mirrors it locally, and returns it.
 */
export async function loadAdminBlogs(): Promise<ManagedBlog[]> {
  const local = getLocal();
  if (local.length) return local;
  try {
    const res = await fetch('/api/admin/blogs', { cache: 'no-store' });
    const data = await res.json();
    const blogs: ManagedBlog[] = Array.isArray(data.blogs) ? data.blogs : [];
    setLocal(blogs);
    return blogs;
  } catch {
    return [];
  }
}

export function getById(id: string): ManagedBlog | undefined {
  return getLocal().find((b) => b.id === id);
}

export async function saveBlog(blog: ManagedBlog): Promise<PersistResult> {
  const all = getLocal();
  const idx = all.findIndex((b) => b.id === blog.id);
  const next = { ...blog, updatedAt: new Date().toISOString() };
  if (idx >= 0) all[idx] = next;
  else all.unshift(next);
  return commit(all);
}

export async function deleteBlog(id: string): Promise<PersistResult> {
  return commit(getLocal().filter((b) => b.id !== id));
}

export async function setStatus(id: string, status: BlogStatus): Promise<PersistResult> {
  const all = getLocal().map((b) =>
    b.id === id ? { ...b, status, updatedAt: new Date().toISOString() } : b,
  );
  return commit(all);
}

/** Replace the whole set (JSON import). */
export async function replaceAll(blogs: ManagedBlog[]): Promise<PersistResult> {
  return commit(blogs);
}

// ── helpers ────────────────────────────────────────────────────────────────

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function uid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `blog-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
}

export function estimateReadingTime(html: string): string {
  const text = html.replace(/<[^>]+>/g, ' ');
  const words = text.split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.round(words / 200))} min read`;
}

export function emptyBlog(): ManagedBlog {
  const now = new Date().toISOString();
  return {
    id: uid(),
    slug: '',
    title: '',
    excerpt: '',
    bodyHtml: '',
    category: 'Enterprise Software',
    tags: [],
    authorName: 'Kaizen Infotech Team',
    authorRole: 'Kaizen Infotech Solutions',
    authorBio:
      'Insights from the engineering, design, and strategy team at Kaizen Infotech Solutions.',
    readingTime: '5 min read',
    publishedAt: new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }),
    mainImage: undefined,
    gallery: [],
    // Default to published so a newly added blog appears on /blog immediately.
    // Authors can switch to Draft / Hidden in the form when they don't want it live.
    status: 'published',
    seo: {},
    createdAt: now,
    updatedAt: now,
  };
}
