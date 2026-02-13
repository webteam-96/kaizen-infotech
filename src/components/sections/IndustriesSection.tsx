'use client';

import { useRef } from 'react';
import { ScrollFadeIn } from '@/components/animation/ScrollFadeIn';
import { TextReveal } from '@/components/animation/TextReveal';
import { DrawSVG } from '@/components/animation/DrawSVG';
import { useStaggeredScrollReveal } from '@/hooks/useStaggeredScrollReveal';
import { cn } from '@/lib/utils/cn';

const industries = [
  {
    title: 'Government & Public Sector',
    description: 'Digital platforms for governance, grievance redressal, and citizen services.',
    icon: '01',
  },
  {
    title: 'Enterprises & Corporate Teams',
    description: 'Custom software and portals for operational efficiency and internal communication.',
    icon: '02',
  },
  {
    title: 'Associations & Memberships',
    description: 'Member engagement platforms with directories, events, and communication tools.',
    icon: '03',
  },
  {
    title: 'Event & Conference Organizers',
    description: 'End-to-end event registration, QR check-in, and real-time reporting systems.',
    icon: '04',
  },
  {
    title: 'SMEs & Growing Businesses',
    description: 'Scalable digital solutions to digitize operations and accelerate growth.',
    icon: '05',
  },
];

export function IndustriesSection() {
  const gridRef = useRef<HTMLDivElement>(null);

  useStaggeredScrollReveal(gridRef, {
    from: { opacity: 0, y: 40, scale: 0.95 },
    to: { opacity: 1, y: 0, scale: 1 },
    stagger: 0.1,
  });

  return (
    <section
      data-section-index={6}
      className="bg-[var(--color-bg-secondary)] py-[var(--space-section)]"
    >
      <div className="mx-auto max-w-[var(--container-max)] px-[var(--container-padding)]">
        {/* Header */}
        <div className="mb-16 text-center">
          <ScrollFadeIn direction="up">
            <span
              className="text-[length:var(--text-xs)] font-medium uppercase tracking-widest text-[var(--color-text-tertiary)]"
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
              'text-[clamp(2rem,4vw,3rem)] leading-tight tracking-tight',
              'text-[var(--color-text-primary)]'
            )}
          >
            Trusted across multiple sectors
          </TextReveal>
        </div>

        {/* Grid with decorative vertical line */}
        <div className="relative">
          {/* Vertical DrawSVG connecting line - desktop only */}
          <div className="pointer-events-none absolute -left-8 top-0 hidden h-full lg:block">
            <DrawSVG scrub className="h-full w-px">
              <svg
                width="2"
                height="100%"
                viewBox="0 0 2 600"
                preserveAspectRatio="none"
                className="h-full"
              >
                <line
                  x1="1"
                  y1="0"
                  x2="1"
                  y2="600"
                  stroke="var(--color-accent-primary)"
                  strokeWidth="2"
                  strokeOpacity="0.3"
                />
              </svg>
            </DrawSVG>
          </div>

          <div ref={gridRef} className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {industries.map((industry) => (
              <div
                key={industry.title}
                className={cn(
                  'group rounded-[var(--radius-lg)] p-8',
                  'bg-[var(--color-bg-tertiary)] border border-[var(--color-border)]',
                  'transition-all duration-300',
                  'hover:border-[var(--color-border-hover)]',
                  'hover:shadow-[0_0_30px_var(--color-glow)]'
                )}
              >
                <span
                  className="mb-4 block text-[length:var(--text-xs)] font-medium text-[var(--color-accent-primary)]"
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  {industry.icon}
                </span>
                <h3
                  className="mb-3 text-[length:var(--text-lg)] font-semibold text-[var(--color-text-primary)]"
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  {industry.title}
                </h3>
                <p
                  className="text-[length:var(--text-sm)] leading-relaxed text-[var(--color-text-secondary)]"
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  {industry.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
