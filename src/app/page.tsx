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
        href="/images/hero/spline-monitor-poster-v2.webp"
        type="image/webp"
        fetchPriority="high"
      />
      {/* Lock scroll at the very first paint — BEFORE hydration — so the intro
          can never be scrolled past before the Enter/Space/tap gesture. Without
          this there's a pre-hydration window (no Lenis, no effects yet) where
          native wheel/touch scrolls the page. React (SmoothScroll, driven by the
          loader store) then takes ownership: it KEEPS the lock for the full 3D
          hero until the begin gesture, and RELEASES it immediately for
          lite/reduced-motion heroes (which have no dive). Reduced-motion users
          are skipped here entirely (no dive → free scroll). If JS is disabled the
          script never runs, so no-JS users are never trapped. scrollbar-gutter:
          stable (globals.css) keeps this overflow toggle shift-free. */}
      <script
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html:
            "try{if(!matchMedia('(prefers-reduced-motion:reduce)').matches)document.documentElement.style.overflow='hidden'}catch(e){}",
        }}
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
