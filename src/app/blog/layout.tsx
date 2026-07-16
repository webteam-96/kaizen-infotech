import type { Metadata } from 'next';
import { sectionLayoutMetadata } from '@/lib/seo/config';

// /blog (list) is a client component — this server layout gives it metadata.
// /blog/[slug] provides its own title/canonical + Article schema, overriding
// these for post pages. sectionLayoutMetadata re-declares title.template so post
// titles keep the brand suffix.
export const metadata: Metadata = sectionLayoutMetadata({
  title: 'Blog',
  description:
    'Insights on custom software, mobile apps, digital transformation, and technology trends from the Kaizen Infotech Solutions team.',
  path: '/blog',
});

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return children;
}
