import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPublished } from '@/lib/blog/serverStore';
import { sanitizeHtml } from '@/lib/blog/markdown';
import { BlogPostDetail } from './BlogPostDetail';
import { JsonLd } from '@/components/seo/JsonLd';
import { blogPostingSchema, breadcrumbSchema } from '@/lib/seo/jsonld';
import { DEFAULT_OG_IMAGE, SITE_NAME } from '@/lib/seo/config';

// Read the canonical store (KV or file) on every request so admin edits appear
// without a rebuild, on any host.
export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const posts = await getPublished();
  const post = posts.find((p) => p.slug === slug);
  if (!post) return { title: 'Post Not Found' };

  const path = `/blog/${post.slug}`;
  const title = post.seo?.metaTitle || post.title;
  const description = post.seo?.metaDescription || post.excerpt;
  const ogImage = post.mainImage?.url
    ? { url: post.mainImage.url, alt: post.mainImage.alt || post.title }
    : DEFAULT_OG_IMAGE;

  return {
    // A custom metaTitle is treated as the full title (absolute); otherwise the
    // post title gets the sitewide "| Kaizen Infotech Solutions" template suffix.
    title: post.seo?.metaTitle ? { absolute: post.seo.metaTitle } : title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: 'article',
      url: path,
      siteName: SITE_NAME,
      title,
      description,
      images: [ogImage],
      publishedTime: post.createdAt,
      modifiedTime: post.updatedAt,
      authors: [post.authorName],
      section: post.category,
      tags: post.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage.url],
    },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const posts = await getPublished();
  const post = posts.find((p) => p.slug === slug);
  if (!post) notFound();

  const relatedPosts = posts
    .filter((p) => p.slug !== slug)
    .filter((p) => p.category === post.category || p.tags.some((t) => post.tags.includes(t)))
    .slice(0, 2);

  // Sanitise server-side so the injected HTML is identical on SSR + hydration.
  const safePost = { ...post, bodyHtml: sanitizeHtml(post.bodyHtml) };
  return (
    <>
      <JsonLd
        data={[
          blogPostingSchema(post),
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Blog', path: '/blog' },
            { name: post.title, path: `/blog/${post.slug}` },
          ]),
        ]}
      />
      <BlogPostDetail post={safePost} relatedPosts={relatedPosts} />
    </>
  );
}
