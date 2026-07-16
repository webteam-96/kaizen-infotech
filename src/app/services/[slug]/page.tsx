import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { services } from '@/content/services';
import ServiceDetailClient from './ServiceDetailClient';
import { JsonLd } from '@/components/seo/JsonLd';
import { serviceSchema, breadcrumbSchema, faqSchema } from '@/lib/seo/jsonld';
import { pageMetadata } from '@/lib/seo/config';

// ---------------------------------------------------------------------------
// Static params generation
// ---------------------------------------------------------------------------

export function generateStaticParams() {
  return services.map((service) => ({
    slug: service.slug,
  }));
}

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = services.find((s) => s.slug === slug);

  if (!service) {
    return { title: 'Service Not Found' };
  }

  return pageMetadata({
    title: service.title,
    description: service.description,
    path: `/services/${service.slug}`,
  });
}

// ---------------------------------------------------------------------------
// Page (Server Component)
// ---------------------------------------------------------------------------

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = services.find((s) => s.slug === slug);

  if (!service) {
    notFound();
  }

  // Find related services (exclude current)
  const relatedServices = services.filter((s) => s.id !== service.id).slice(0, 3);

  return (
    <>
      <JsonLd
        data={[
          serviceSchema(service),
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Services', path: '/services' },
            { name: service.title, path: `/services/${service.slug}` },
          ]),
          ...(service.faqs && service.faqs.length > 0 ? [faqSchema(service.faqs)] : []),
        ]}
      />
      <ServiceDetailClient service={service} relatedServices={relatedServices} />
    </>
  );
}
