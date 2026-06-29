import type { ManagedBlog } from '@/types';
import { IMPORTED_BLOGS } from '@/content/importedBlogs';

// ---------------------------------------------------------------------------
// SEED — the canonical default blog set. These are the posts imported from the
// live kaizeninfotech.com blog (see src/content/importedBlogs.ts). Used to
// auto-populate public/data/blogs.json on first run and as a fallback whenever
// the JSON file / localStorage is empty, so the blog is never blank.
// ---------------------------------------------------------------------------

export const SEED_BLOGS: ManagedBlog[] = IMPORTED_BLOGS;

/** Deep clone so callers can't mutate the shared SEED reference. */
export function cloneSeed(): ManagedBlog[] {
  return SEED_BLOGS.map((b) => ({
    ...b,
    tags: [...b.tags],
    gallery: b.gallery.map((g) => ({ ...g })),
    seo: b.seo ? { ...b.seo } : undefined,
    mainImage: b.mainImage ? { ...b.mainImage } : undefined,
  }));
}
