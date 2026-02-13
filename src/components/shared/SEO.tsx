import type { Metadata } from 'next';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SEOProps {
  title: string;
  description: string;
  image?: string;
  path?: string;
}

// ---------------------------------------------------------------------------
// Default site metadata
// ---------------------------------------------------------------------------

export const defaultMeta = {
  siteName: 'Kaizen Infotech Solutions',
  siteUrl: 'https://kaizeninfotech.com',
  defaultDescription:
    'We craft digital experiences that drive growth through innovative web development, design, and technology solutions.',
  defaultImage: '/og-image.jpg',
} as const;

// ---------------------------------------------------------------------------
// generatePageMetadata — helper for Next.js App Router metadata exports
// ---------------------------------------------------------------------------

export function generatePageMetadata({
  title,
  description,
  image,
  path,
}: SEOProps): Metadata {
  const url = `${defaultMeta.siteUrl}${path || ''}`;
  const ogImage = image || defaultMeta.defaultImage;

  return {
    title: `${title} | ${defaultMeta.siteName}`,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: defaultMeta.siteName,
      images: [{ url: ogImage, width: 1200, height: 630 }],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
    alternates: { canonical: url },
  };
}
