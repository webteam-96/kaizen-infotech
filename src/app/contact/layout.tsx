import type { Metadata } from 'next';
import { JsonLd } from '@/components/seo/JsonLd';
import { breadcrumbSchema } from '@/lib/seo/jsonld';
import { pageMetadata } from '@/lib/seo/config';

// /contact is a client component — this server layout supplies its metadata.
export const metadata: Metadata = pageMetadata({
  title: 'Contact Us',
  description:
    'Get in touch with Kaizen Infotech Solutions. Tell us about your custom software, mobile app, or digital project. Based in Thane, Maharashtra — serving clients across India and beyond.',
  path: '/contact',
});

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Contact', path: '/contact' },
        ])}
      />
      {children}
    </>
  );
}
