import type { MetadataRoute } from 'next';
import { services } from '@/content/services';
import { projects } from '@/content/projects';
import { getPublished } from '@/lib/blog/serverStore';

// Regenerate on every request so newly published blog posts appear without a
// rebuild — the same reasoning /blog/[slug] is dynamic (both read the canonical
// public/data/blogs.json). The service/work slugs come straight from the content
// that drives their generateStaticParams, so the sitemap can never drift out of
// sync with the pages that actually exist.
export const dynamic = 'force-dynamic';

const BASE_URL = 'https://kaizeninfotech.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // Top-level marketing pages.
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE_URL}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/services`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE_URL}/work`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE_URL}/blog`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/contact`, lastModified: now, changeFrequency: 'yearly', priority: 0.6 },
    { url: `${BASE_URL}/careers`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/privacy-policy`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE_URL}/terms`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
  ];

  // Service detail pages — derived from the real content, not hardcoded.
  const servicePages: MetadataRoute.Sitemap = services.map((s) => ({
    url: `${BASE_URL}/services/${s.slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  // Work / case-study detail pages.
  const workPages: MetadataRoute.Sitemap = projects.map((p) => ({
    url: `${BASE_URL}/work/${p.slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  // Published blog posts (admin-managed via public/data/blogs.json).
  let blogPages: MetadataRoute.Sitemap = [];
  try {
    const posts = await getPublished();
    blogPages = posts.map((post) => ({
      url: `${BASE_URL}/blog/${post.slug}`,
      lastModified: post.updatedAt ? new Date(post.updatedAt) : now,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }));
  } catch {
    // A blog-store read failure must never break the rest of the sitemap.
  }

  return [...staticPages, ...servicePages, ...workPages, ...blogPages];
}
