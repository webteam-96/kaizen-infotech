import { SITE_CONFIG } from '@/lib/utils/constants';
import { socialLinks } from '@/content/navigation';
import { SITE_URL, SITE_NAME } from './config';

// ---------------------------------------------------------------------------
// schema.org JSON-LD builders.
//
// Facts only — every value traces back to real content (SITE_CONFIG, services,
// projects, the blog store). Nothing here is invented. Graphs are stitched
// together with stable @id anchors so Google / AI engines resolve one entity.
// ---------------------------------------------------------------------------

const ORG_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;

/** Only real, non-placeholder social profiles (the repo ships '#' stubs). */
const sameAs = socialLinks
  .map((s) => s.href)
  .filter((href) => href && href !== '#' && href.startsWith('http'));

/** The company's postal address, structured from SITE_CONFIG.address. */
const postalAddress = {
  '@type': 'PostalAddress',
  streetAddress:
    'Centrum Business Square, A 406, Road No. 16, Nehru Nagar, Wagle Industrial Estate',
  addressLocality: 'Thane West',
  addressRegion: 'Maharashtra',
  postalCode: '400604',
  addressCountry: 'IN',
} as const;

/** Organization — the anchor entity every other node points back to. */
export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': ORG_ID,
    name: SITE_NAME,
    legalName: SITE_NAME,
    url: SITE_URL,
    slogan: 'Business First. Technology Second.',
    logo: {
      '@type': 'ImageObject',
      url: `${SITE_URL}/images/logos/kaizen-logo.png`,
    },
    image: `${SITE_URL}/images/og/og-default.png`,
    description:
      'Kaizen Infotech Solutions delivers custom software, mobile apps, event management systems, enterprise web portals, and digital marketing for enterprises, government bodies, and global communities.',
    // Entity-expertise topics — helps AI/generative search associate the brand
    // with what it actually does. Facts, mirroring the real service catalogue.
    knowsAbout: [
      'Custom Software Development',
      'Mobile App Development',
      'Event Registration & Management Systems',
      'Enterprise Web Portals',
      'Digital Marketing',
      'Business Process Automation',
      'Digital Transformation',
    ],
    email: SITE_CONFIG.contactEmail,
    telephone: SITE_CONFIG.phone,
    address: postalAddress,
    areaServed: [
      { '@type': 'Country', name: 'India' },
      { '@type': 'AdministrativeArea', name: 'Maharashtra' },
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'sales',
      email: SITE_CONFIG.contactEmail,
      telephone: SITE_CONFIG.phone,
      areaServed: 'IN',
      availableLanguage: ['en', 'hi', 'mr'],
    },
    ...(sameAs.length > 0 ? { sameAs } : {}),
  };
}

/** WebSite — enables sitelinks and ties the domain to the Organization. */
export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    url: SITE_URL,
    name: SITE_NAME,
    inLanguage: 'en',
    publisher: { '@id': ORG_ID },
  };
}

/** BreadcrumbList from an ordered list of { name, path } crumbs. */
export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}

interface ServiceLike {
  slug: string;
  title: string;
  description: string;
  features?: string[];
}

/** Service offered by the Organization (for /services/[slug]). */
export function serviceSchema(service: ServiceLike) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${SITE_URL}/services/${service.slug}/#service`,
    name: service.title,
    serviceType: service.title,
    description: service.description,
    url: `${SITE_URL}/services/${service.slug}`,
    provider: { '@id': ORG_ID },
    areaServed: { '@type': 'Country', name: 'India' },
    ...(service.features && service.features.length > 0
      ? {
          hasOfferCatalog: {
            '@type': 'OfferCatalog',
            name: `${service.title} capabilities`,
            itemListElement: service.features.map((f) => ({
              '@type': 'Offer',
              itemOffered: { '@type': 'Service', name: f },
            })),
          },
        }
      : {}),
  };
}

/** FAQPage from a service's Q&A list (rich-result eligible). */
export function faqSchema(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };
}

interface ProjectLike {
  slug: string;
  title: string;
  client: string;
  category: string;
  description: string;
  image: string;
}

/** CreativeWork for a portfolio case study (/work/[slug]). No dates — projects
 *  only carry a display year, not a precise publish date, so none is invented. */
export function caseStudySchema(project: ProjectLike) {
  const url = `${SITE_URL}/work/${project.slug}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    '@id': `${url}/#project`,
    name: project.title,
    headline: project.title,
    description: project.description,
    ...(project.image
      ? {
          image: project.image.startsWith('http')
            ? project.image
            : `${SITE_URL}${project.image}`,
        }
      : {}),
    url,
    creator: { '@id': ORG_ID },
    about: project.client,
    genre: project.category,
    inLanguage: 'en',
  };
}

interface BlogPostLike {
  slug: string;
  title: string;
  excerpt: string;
  authorName: string;
  category: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  mainImage?: { url: string };
  seo?: { metaTitle?: string; metaDescription?: string };
}

/** BlogPosting for /blog/[slug]. Dates use the ISO create/update timestamps
 *  (publishedAt is free-text like "29 Jun 2026", unusable as a date). */
export function blogPostingSchema(post: BlogPostLike) {
  const url = `${SITE_URL}/blog/${post.slug}`;
  const image = post.mainImage?.url
    ? post.mainImage.url.startsWith('http')
      ? post.mainImage.url
      : `${SITE_URL}${post.mainImage.url}`
    : `${SITE_URL}/images/og/og-default.png`;
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': `${url}/#article`,
    headline: post.seo?.metaTitle || post.title,
    description: post.seo?.metaDescription || post.excerpt,
    image,
    url,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    datePublished: post.createdAt,
    dateModified: post.updatedAt,
    author: { '@type': 'Person', name: post.authorName },
    publisher: { '@id': ORG_ID },
    articleSection: post.category,
    ...(post.tags.length > 0 ? { keywords: post.tags.join(', ') } : {}),
    inLanguage: 'en',
  };
}
