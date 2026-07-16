import type { Metadata } from 'next';
import { JsonLd } from '@/components/seo/JsonLd';
import { breadcrumbSchema } from '@/lib/seo/jsonld';
import { pageMetadata } from '@/lib/seo/config';

// /careers is a client component — this server layout supplies its metadata.
export const metadata: Metadata = pageMetadata({
  title: 'Careers',
  description:
    'Join Kaizen Infotech Solutions and build platforms used by government organisations, enterprises, and global communities. Explore our culture, benefits, and opportunities to grow.',
  path: '/careers',
});

export default function CareersLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Careers', path: '/careers' },
        ])}
      />
      {children}
    </>
  );
}
