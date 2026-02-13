import { notFound } from 'next/navigation';
import { services } from '@/content/services';
import ServiceDetailClient from './ServiceDetailClient';

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
}) {
  const { slug } = await params;
  const service = services.find((s) => s.slug === slug);

  if (!service) {
    return { title: 'Service Not Found | Kaizen Infotech Solutions' };
  }

  return {
    title: `${service.title} | Kaizen Infotech Solutions`,
    description: service.description,
  };
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

  return <ServiceDetailClient service={service} relatedServices={relatedServices} />;
}
