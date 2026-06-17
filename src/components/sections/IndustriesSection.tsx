'use client';

import { ScrollFadeIn } from '@/components/animation/ScrollFadeIn';
import { TextReveal } from '@/components/animation/TextReveal';
import { cn } from '@/lib/utils/cn';
import MagicBento, { type BentoCardData } from '@/components/ui/MagicBento';

const industries: BentoCardData[] = [
  {
    label: '01',
    title: 'Government & Public Sector',
    description: 'Digital platforms for governance, grievance redressal, citizen services, and administrative efficiency.',
  },
  {
    label: '02',
    title: 'Enterprises & Corporates',
    description: 'Custom software and portals for operational efficiency, internal communication, and workforce management.',
  },
  {
    label: '03',
    title: 'Associations & Memberships',
    description: 'Member engagement platforms with directories, event management, communication tools, and reporting.',
  },
  {
    label: '04',
    title: 'Event & Conference Organisers',
    description: 'End-to-end event registration, QR check-in, payment processing, and real-time reporting.',
  },
  {
    label: '05',
    title: 'NGOs & Social Organisations',
    description: 'Digital platforms to connect beneficiaries with support schemes, grants, and social services.',
  },
  {
    label: '06',
    title: 'Healthcare & Clinics',
    description: 'Clinic management with online appointments, digital records, billing, and WhatsApp reminders.',
  },
  {
    label: '07',
    title: 'Mobility & Transport',
    description: 'Fair-pricing ride platforms and GPS-enabled field force management applications.',
  },
  {
    label: '08',
    title: 'SMEs & Growing Businesses',
    description: 'Scalable digital solutions to digitise operations, automate workflows, and accelerate growth.',
  },
];

export function IndustriesSection() {
  return (
    <section
      data-section-index={6}
      className="section-ink py-[var(--space-section)]"
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
            Industries We Serve
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
