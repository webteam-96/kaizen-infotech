import type { Metadata } from 'next';
import { sectionLayoutMetadata } from '@/lib/seo/config';

// /services (list) is a client component — this server layout gives it metadata.
// /services/[slug] provides its own title/canonical via generateMetadata, which
// overrides these for the detail pages, so no breadcrumb schema goes here.
// sectionLayoutMetadata re-declares title.template so the detail pages keep the
// brand suffix (a plain title here would break that inheritance).
export const metadata: Metadata = sectionLayoutMetadata({
  title: 'Services',
  description:
    'Explore Kaizen Infotech services: custom software development, mobile app development, event registration & management systems, enterprise web portals, and digital marketing.',
  path: '/services',
});

export default function ServicesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
