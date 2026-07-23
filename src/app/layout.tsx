import type { Metadata, Viewport } from 'next';
import { Jost, Lato, JetBrains_Mono, Bricolage_Grotesque, Anton, Great_Vibes } from 'next/font/google';
import './globals.css';
import { AppFrame } from '@/components/layout/AppFrame';
import { JsonLd } from '@/components/seo/JsonLd';
import { organizationSchema, websiteSchema } from '@/lib/seo/jsonld';
import { SITE_URL, DEFAULT_OG_IMAGE } from '@/lib/seo/config';

const jost = Jost({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const lato = Lato({
  subsets: ['latin'],
  // 900 was never used anywhere (globals.css maxes at 700; no font-black); 300 IS
  // used (MagicBento card descriptions). Dropping 900 trims a woff2 off the
  // critical path with zero visual change.
  weight: ['300', '400', '700'],
  variable: '--font-body',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
  // Mono only appears below the fold — don't race it onto the cold critical path.
  preload: false,
});

const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-card-heading',
  display: 'swap',
  // Card headings are below the fold on every route (hero uses --font-display /
  // --font-poster). Don't race these four weights onto the critical path against
  // the CSS/JS — they swap in smoothly via display:swap + next/font's size-adjusted
  // fallback when the cards scroll into view.
  preload: false,
});

// Heavy condensed poster display (for the "YOUR VISION" line — bold uppercase).
const anton = Anton({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-poster',
  display: 'swap',
});

// Elegant flowing script (for the gold "Our Code" line).
const greatVibes = Great_Vibes({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-script',
  display: 'swap',
  // Only used by the hero hook line, which first paints ~8s into a first visit
  // (after the countdown loader) — never on the cold critical path. Repeat
  // visits have it cached; display:swap covers the gap either way.
  preload: false,
});

export const metadata: Metadata = {
  // Resolves every relative canonical / og:image URL to an absolute one. Without
  // this, Next emits path-only social + canonical URLs that crawlers ignore.
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Kaizen Infotech Solutions | Custom Software & Digital Solutions',
    template: '%s | Kaizen Infotech Solutions',
  },
  description:
    'Kaizen Infotech Solutions delivers custom software, mobile apps, event management systems, and digital marketing solutions that help organisations operate smarter and scale faster.',
  keywords: [
    'custom software development',
    'mobile app development',
    'event management systems',
    'enterprise web portals',
    'digital marketing services',
    'software company Thane',
    'software company Mumbai',
    'business automation',
    'digital transformation India',
  ],
  authors: [{ name: 'Kaizen Infotech Solutions' }],
  creator: 'Kaizen Infotech Solutions',
  publisher: 'Kaizen Infotech Solutions',
  applicationName: 'Kaizen Infotech Solutions',
  category: 'technology',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'Kaizen Infotech Solutions',
    title: 'Kaizen Infotech Solutions | Custom Software & Digital Solutions',
    description:
      'Custom software, mobile apps, event management systems, and digital marketing solutions for business efficiency.',
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kaizen Infotech Solutions | Custom Software & Digital Solutions',
    description:
      'Custom software, mobile apps, event management systems, and digital marketing solutions for business efficiency.',
    images: [DEFAULT_OG_IMAGE.url],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: '#ffffff',
  colorScheme: 'light',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* No cross-origin preconnects needed anymore: the Spline scene + its wasm
          helpers and the Simple Icons logos are all self-hosted now (public/spline,
          public/images/tech) — the hero has zero third-party dependencies. */}
      <body
        className={`${jost.variable} ${lato.variable} ${jetbrainsMono.variable} ${bricolage.variable} ${anton.variable} ${greatVibes.variable} antialiased`}
      >
        {/* Sitewide structured data — the Organization anchor + WebSite node that
            every page-level schema (Breadcrumb, Service, BlogPosting) references
            by @id. Rendered on the server so it's in the initial HTML. */}
        <JsonLd data={[organizationSchema(), websiteSchema()]} />
        <AppFrame>{children}</AppFrame>
      </body>
    </html>
  );
}
