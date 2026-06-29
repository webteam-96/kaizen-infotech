'use client';

import { ScrollFadeIn } from '@/components/animation/ScrollFadeIn';
import { TextReveal } from '@/components/animation/TextReveal';
import { cn } from '@/lib/utils/cn';
import MagicBento, { type BentoCardData } from '@/components/ui/MagicBento';

const industries: BentoCardData[] = [
  {
    title: 'Government & Public Sector',
    description: 'Digital platforms for governance, grievance redressal, citizen services, and administrative efficiency.',
  },
  {
    title: 'Enterprises & Corporates',
    description: 'Custom software and portals for operational efficiency, internal communication, and workforce management.',
  },
  {
    title: 'Associations & Memberships',
    description: 'Member engagement platforms with directories, event management, communication tools, and reporting.',
  },
  {
    title: 'Event & Conference Organisers',
    description: 'End-to-end event registration, QR check-in, payment processing, and real-time reporting.',
  },
  {
    title: 'NGOs & Social Organisations',
    description: 'Digital platforms to connect beneficiaries with support schemes, grants, and social services.',
  },
  {
    title: 'Healthcare & Clinics',
    description: 'Clinic management with online appointments, digital records, billing, and WhatsApp reminders.',
  },
  {
    title: 'Mobility & Transport',
    description: 'Fair-pricing ride platforms and GPS-enabled field force management applications.',
  },
  {
    title: 'SMEs & Growing Businesses',
    description: 'Scalable digital solutions to digitise operations, automate workflows, and accelerate growth.',
  },
];

export function IndustriesSection() {
  return (
    <section
      data-section-index={6}
      className="section-ink seam-red py-[var(--space-section)]"
    >
      <div className="mx-auto max-w-[var(--container-max)] px-[var(--container-padding)]">
        {/* Header */}
        <div className="mb-16 text-center">
          <ScrollFadeIn direction="up">
            <span
              className="text-[length:var(--h-eyebrow)] font-medium uppercase tracking-widest text-[var(--accent-on-ink)]"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              Industries We Serve
            </span>
          </ScrollFadeIn>
          <TextReveal
            as="h2"
            splitBy="words"
            className={cn(
              'mt-3 font-[family-name:var(--font-display)]',
              'text-[length:var(--h-section)] leading-tight tracking-tight',
              'text-[var(--text-on-ink)]'
            )}
          >
            Solutions Built for Every Sector
          </TextReveal>
        </div>

        {/* MagicBento grid — dark theme, brand-blue glow */}
        <ScrollFadeIn direction="up">
          <MagicBento
            cards={industries}
            textAutoHide={false}
            enableStars
            enableSpotlight
            enableBorderGlow
            enableTilt={false}
            enableMagnetism
            clickEffect
            spotlightRadius={320}
            particleCount={10}
            glowColor="33, 150, 243"
          />
        </ScrollFadeIn>
      </div>
    </section>
  );
}
