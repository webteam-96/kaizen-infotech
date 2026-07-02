import type { ManagedBlog } from '@/types';

// Pure ordering helper shared by the server store, the public hook, and the
// admin list — no node/browser APIs, safe to import anywhere.

/** A sortable timestamp: the display `publishedAt` if parseable, else `createdAt`. */
function timeOf(b: ManagedBlog): number {
  const p = Date.parse(b.publishedAt);
  if (!Number.isNaN(p)) return p;
  const c = Date.parse(b.createdAt);
  return Number.isNaN(c) ? 0 : c;
}

/**
 * Canonical blog order for the public site: the single FEATURED post first, then
 * every other post newest → oldest. Idempotent and stable. Only one post is ever
 * featured (enforced by `setFeatured` in adminStore); if two ever carried the
 * flag this still lists them ahead of the rest.
 */
export function sortBlogs(blogs: ManagedBlog[]): ManagedBlog[] {
  return [...blogs].sort((a, b) => {
    const af = a.featured ? 1 : 0;
    const bf = b.featured ? 1 : 0;
    if (af !== bf) return bf - af; // featured pinned first
    return timeOf(b) - timeOf(a); // then newest first
  });
}
