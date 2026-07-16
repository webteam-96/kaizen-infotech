import type { Metadata } from 'next';
import { JsonLd } from '@/components/seo/JsonLd';
import { breadcrumbSchema } from '@/lib/seo/jsonld';
import { pageMetadata } from '@/lib/seo/config';

// The /about page is a client component and can't export metadata itself, so this
// server layout supplies its unique title/description/canonical + breadcrumb
// schema. It returns children directly (no wrapper element) — zero DOM impact.
export const metadata: Metadata = pageMetadata({
  title: 'About Us',
  description:
    'Kaizen Infotech Solutions builds custom software, mobile apps, and enterprise platforms trusted by government organisations, enterprises, and global communities. Discover our story, values, and delivery process.',
  path: '/about',
});

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'About', path: '/about' },
        ])}
      />
      {children}
    </>
  );
}
