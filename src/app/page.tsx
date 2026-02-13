import { Hero } from '@/components/sections/Hero';
import { BrandPromise } from '@/components/sections/BrandPromise';
import { ServicesScroll } from '@/components/sections/ServicesScroll';
import { StatsGrid } from '@/components/sections/StatsGrid';
import { FeaturedWork } from '@/components/sections/FeaturedWork';
import { ProcessSteps } from '@/components/sections/ProcessSteps';
import { IndustriesSection } from '@/components/sections/IndustriesSection';
import { TechStack } from '@/components/sections/TechStack';
import { WhyChooseSection } from '@/components/sections/WhyChooseSection';
import { CTASection } from '@/components/sections/CTASection';

export default function HomePage() {
  return (
    <main>
      <Hero />
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
