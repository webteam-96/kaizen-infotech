'use client';

import { useRef } from 'react';
import { ScrollFadeIn } from '@/components/animation/ScrollFadeIn';
import { TextReveal } from '@/components/animation/TextReveal';
import { DrawSVG } from '@/components/animation/DrawSVG';
import { ParallaxLayer } from '@/components/animation/ParallaxLayer';
import { useStaggeredScrollReveal } from '@/hooks/useStaggeredScrollReveal';
import { cn } from '@/lib/utils/cn';

const reasons = [
  { title: 'Over 10 Years of Experience', description: 'Deep industry knowledge built over a decade of delivering enterprise and government projects.' },
  { title: 'Business Process Expertise', description: 'We understand how organizations work and build solutions that align with real operational workflows.' },
  { title: 'Secure & Scalable Architecture', description: 'Every system we build is designed for security, performance, and long-term scalability.' },
  { title: 'Transparent Communication', description: 'Open communication, honest timelines, and clear expectations throughout every engagement.' },
  { title: 'Dedicated Post-Launch Support', description: 'We provide continuous support, maintenance, and enhancements long after deployment.' },
];

export function WhyChooseSection() {
  const gridRef = useRef<HTMLDivElement>(null);

  useStaggeredScrollReveal(gridRef, {
    from: { opacity: 0, x: -40 },
    to: { opacity: 1, x: 0 },
    stagger: 0.1,
  });

  return (
    <section
      data-section-index={8}
      className="bg-[var(--color-bg-primary)] py-[var(--space-section)]"
    >
      <div className="mx-auto max-w-[var(--container-max)] px-[var(--container-padding)]">
        <div className="mb-16 text-center">
          <ScrollFadeIn direction="up">
            <span
              className="text-[length:var(--text-xs)] font-medium uppercase tracking-widest text-[var(--color-text-tertiary)]"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              Why Kaizen Infotech
            </span>
          </ScrollFadeIn>
          <TextReveal
            as="h2"
            splitBy="words"
            stagger={0.04}
            className={cn(
              'mt-3 font-[family-name:var(--font-display)]',
              'text-[clamp(2rem,4vw,3rem)] leading-tight tracking-tight',
              'text-[var(--color-text-primary)]'
            )}
          >
            Long-term value, not just project delivery
          </TextReveal>
        </div>

        <div ref={gridRef} className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {reasons.map((reason) => (
            <div key={reason.title} className="flex gap-4">
              <ParallaxLayer speed={0.15} className="shrink-0">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-surface-glass)] text-[var(--color-accent-primary)]">
                  <DrawSVG>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M5 10L8.5 13.5L15 6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </DrawSVG>
                </div>
              </ParallaxLayer>
              <div>
                <h3
                  className="mb-2 text-[length:var(--text-base)] font-semibold text-[var(--color-text-primary)]"
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  {reason.title}
                </h3>
                <p
                  className="text-[length:var(--text-sm)] leading-relaxed text-[var(--color-text-secondary)]"
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  {reason.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
