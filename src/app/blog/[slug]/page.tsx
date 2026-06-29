import { notFound } from 'next/navigation';
import { getPublishedFromFile } from '@/lib/blog/serverStore';
import { sanitizeHtml } from '@/lib/blog/markdown';
import { BlogPostDetail } from './BlogPostDetail';

// Read public/data/blogs.json on every request so admin edits appear without a
// rebuild. (Reads work on any host; the admin write needs a persistent FS.)
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const posts = await getPublishedFromFile();
  const post = posts.find((p) => p.slug === slug);
  if (!post) return { title: 'Post Not Found' };
  return {
    title: post.seo?.metaTitle || `${post.title} | Kaizen Infotech Blog`,
    description: post.seo?.metaDescription || post.excerpt,
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const posts = await getPublishedFromFile();
  const post = posts.find((p) => p.slug === slug);
  if (!post) notFound();

  const relatedPosts = posts
    .filter((p) => p.slug !== slug)
    .filter((p) => p.category === post.category || p.tags.some((t) => post.tags.includes(t)))
    .slice(0, 2);

  // Sanitise server-side so the injected HTML is identical on SSR + hydration.
  const safePost = { ...post, bodyHtml: sanitizeHtml(post.bodyHtml) };
  return <BlogPostDetail post={safePost} relatedPosts={relatedPosts} />;
}
