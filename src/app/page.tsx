import type { Metadata } from 'next';
import { CountdownLoader } from '@/components/sections/CountdownLoader';
import { RubiksHero } from '@/components/sections/RubiksHero';
import { BrandPromise } from '@/components/sections/BrandPromise';
import { ServicesScroll } from '@/components/sections/ServicesScroll';
import { StatsGrid } from '@/components/sections/StatsGrid';
import { FeaturedWork } from '@/components/sections/FeaturedWork';
import { ProcessSteps } from '@/components/sections/ProcessSteps';
import { IndustriesSection } from '@/components/sections/IndustriesSection';
import { TechStack } from '@/components/sections/TechStack';
import { WhyChooseSection } from '@/components/sections/WhyChooseSection';
import { CTASection } from '@/components/sections/CTASection';

// Home gets an absolute (non-templated) title so the brand isn't duplicated, and
// its own canonical. Description/OG image inherit the sitewide defaults.
export const metadata: Metadata = {
  title: { absolute: 'Custom Software & Digital Solutions Company | Kaizen Infotech' },
  alternates: { canonical: '/' },
};

export default function HomePage() {
  return (
    <main>
      {/* Preload the hero's LCP element — the blurred Spline poster. The hero is a
          dynamic(ssr:false) chunk, so without this the poster isn't discoverable
          until that chunk executes; the preload fetches its ~14KB in parallel with
          the JS (during the intro loader) so it paints the moment the chunk mounts.
          Next hoists this <link> into <head>. */}
      <link
        rel="preload"
        as="image"
        href="/images/hero/spline-monitor-poster.webp"
        type="image/webp"
        fetchPriority="high"
      />
      <CountdownLoader />
      <RubiksHero />
      <BrandPromise />
      <ServicesScroll />
      <StatsGrid />
      <FeaturedWork />
      <ProcessSteps />
      <IndustriesSection />
      <TechStack />
      <WhyChooseSection />
      <CTASection />
    </main>
  );
}
