import type { Metadata } from 'next';
import { Jost, Lato, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import ScrollProgress from '@/components/layout/ScrollProgress';

const jost = Jost({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const lato = Lato({
  subsets: ['latin'],
  weight: ['300', '400', '700', '900'],
  variable: '--font-body',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Kaizen Infotech Solutions | Continuous Improvement Through Technology',
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
    'software company Mumbai',
    'business automation',
    'digital transformation India',
  ],
  authors: [{ name: 'Kaizen Infotech Solutions' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Kaizen Infotech Solutions',
    title: 'Kaizen Infotech Solutions | Custom Software & Digital Solutions',
    description:
      'Custom software, mobile apps, event management systems, and digital marketing solutions for business efficiency.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kaizen Infotech Solutions',
    description:
      'Custom software, mobile apps, event management systems, and digital marketing solutions for business efficiency.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${jost.variable} ${lato.variable} ${jetbrainsMono.variable} antialiased`}
        style={{ fontFamily: 'var(--font-body)' }}
      >
        <Providers>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[999] focus:rounded-md focus:bg-[var(--color-accent-primary)] focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-[var(--color-text-inverse)]"
          >
            Skip to main content
          </a>
          <ScrollProgress />
          <Navbar />
          <div id="main-content">{children}</div>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
