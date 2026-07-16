import type { Metadata } from 'next';
import { SITE_CONFIG } from '@/lib/utils/constants';

// ---------------------------------------------------------------------------
// Central SEO configuration — the single source of truth for canonical URL,
// site name, and the default social-share image. Everything else (per-page
// metadata, JSON-LD graphs) is derived from here so the site can never drift
// out of sync with itself.
//
// NOTE: the canonical host is the NON-www apex (matches sitemap.ts + robots.ts).
// The server MUST 301-redirect www -> apex so both don't index as duplicates.
// ---------------------------------------------------------------------------

export const SITE_URL = SITE_CONFIG.url; // https://kaizeninfotech.com
export const SITE_NAME = SITE_CONFIG.name;

/** 1200x630 branded card used for Open Graph + Twitter when a page has no image
 *  of its own. Regenerate with `node scripts/make-og-image.mjs`. */
export const DEFAULT_OG_IMAGE = {
  url: '/images/og/og-default.png',
  width: 1200,
  height: 630,
  alt: `${SITE_NAME} — Custom Software & Digital Solutions`,
} as const;

interface PageMetaInput {
  title: string;
  description: string;
  /** Root-relative path, e.g. "/about". Used for the canonical + og:url. */
  path: string;
  /** Override the default social image (e.g. a case-study cover). */
  image?: { url: string; width?: number; height?: number; alt?: string };
}

/**
 * Build a complete, self-consistent `Metadata` object for a standard (website)
 * page: unique title + description, a canonical URL, and matching Open Graph /
 * Twitter cards. All URLs are root-relative and resolved against `metadataBase`
 * (set in the root layout), so this stays correct across environments.
 *
 * Article pages (the blog) build their own OpenGraph inline so they can add
 * article-specific tags (publishedTime, author, tags).
 */
export function pageMetadata({ title, description, path, image }: PageMetaInput): Metadata {
  const ogImage = image ?? DEFAULT_OG_IMAGE;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: 'website',
      url: path,
      siteName: SITE_NAME,
      title,
      description,
      images: [ogImage],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage.url],
    },
  };
}

/**
 * Metadata for a *section layout* that wraps a list page AND `[slug]` children
 * (services, blog). It re-declares `title.template` so the child detail pages
 * inherit the "… | Kaizen Infotech Solutions" suffix — a plain-string title on
 * an intermediate layout otherwise breaks that inheritance for grandchildren —
 * and supplies the list page's own resolved title via `title.default`.
 */
export function sectionLayoutMetadata({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  const branded = `${title} | ${SITE_NAME}`;
  return {
    // `default` is the BARE title — Next applies this segment's own template to
    // it for the list page, producing "<title> | Kaizen Infotech Solutions".
    // (A pre-branded default would get the suffix appended twice.)
    title: { default: title, template: `%s | ${SITE_NAME}` },
    description,
    alternates: { canonical: path },
    openGraph: {
      type: 'website',
      url: path,
      siteName: SITE_NAME,
      title: branded,
      description,
      images: [DEFAULT_OG_IMAGE],
    },
    twitter: {
      card: 'summary_large_image',
      title: branded,
      description,
      images: [DEFAULT_OG_IMAGE.url],
    },
  };
}
