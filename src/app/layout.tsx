import type { Metadata } from 'next';
import { Jost, Lato, JetBrains_Mono, Bricolage_Grotesque, Anton, Great_Vibes } from 'next/font/google';
import './globals.css';
import { AppFrame } from '@/components/layout/AppFrame';

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

const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-card-heading',
  display: 'swap',
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
        className={`${jost.variable} ${lato.variable} ${jetbrainsMono.variable} ${bricolage.variable} ${anton.variable} ${greatVibes.variable} antialiased`}
      >
        <AppFrame>{children}</AppFrame>
      </body>
    </html>
  );
}
