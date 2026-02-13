'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, registerGSAPPlugins } from '@/lib/animations/gsap-setup';
import { ANIMATION_CONFIG } from '@/lib/animations/config';
import { FloatingElement } from '@/components/animation/FloatingElement';
import { ScrollFadeIn } from '@/components/animation/ScrollFadeIn';
import { TextReveal } from '@/components/animation/TextReveal';
import { useStaggeredScrollReveal } from '@/hooks/useStaggeredScrollReveal';
import { useReducedMotion } from '@/hooks';
import { cn } from '@/lib/utils/cn';

const technologies = [
  { name: 'ASP.NET', color: '#512BD4' },
  { name: 'HTML', color: '#E34F26' },
  { name: 'CSS', color: '#1572B6' },
  { name: 'JavaScript', color: '#F7DF1E' },
  { name: 'MySQL', color: '#4479A1' },
  { name: 'SQL Server', color: '#CC2927' },
  { name: 'Android', color: '#3DDC84' },
  { name: 'iOS', color: '#333333' },
  { name: 'APIs', color: '#FF6C37' },
  { name: 'Payment Gateways', color: '#00D632' },
  { name: 'WhatsApp', color: '#25D366' },
  { name: 'Email Systems', color: '#4285F4' },
];

export function TechStack() {
  const gridRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  useStaggeredScrollReveal(gridRef, {
    from: { opacity: 0, scale: 0.8, rotation: -5 },
    to: { opacity: 1, scale: 1, rotation: 0 },
    stagger: { each: 0.08, from: 'random' },
  });

  registerGSAPPlugins();

  // Horizontal progress bar that fills as section scrolls
  useGSAP(
    () => {
      if (!progressBarRef.current || !sectionRef.current) return;

      if (prefersReducedMotion) {
        gsap.set(progressBarRef.current, { scaleX: 1 });
        return;
      }

      gsap.fromTo(
        progressBarRef.current,
        { scaleX: 0 },
        {
          scaleX: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: ANIMATION_CONFIG.scrollTrigger.start,
            end: ANIMATION_CONFIG.scrollTrigger.end,
            scrub: ANIMATION_CONFIG.scrub.smooth,
          },
        }
      );
    },
    { dependencies: [prefersReducedMotion] }
  );

  return (
    <section
      ref={sectionRef}
      data-section-index={7}
      className="relative bg-[var(--color-bg-primary)] py-[var(--space-section)]"
    >
      <div className="mx-auto max-w-[var(--container-max)] px-[var(--container-padding)]">
        {/* Section header */}
        <div className="mb-16 text-center">
          <ScrollFadeIn direction="up">
            <span
              className="text-[length:var(--text-xs)] font-medium uppercase tracking-widest text-[var(--color-text-tertiary)]"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              What Powers Us
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
            Reliable and proven technologies
          </TextReveal>
        </div>

        {/* Tech grid */}
        <div ref={gridRef} className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {technologies.map((tech, i) => (
            <FloatingElement
              key={tech.name}
              amplitude={4 + (i % 3) * 2}
              duration={3 + (i % 4) * 0.5}
              delay={i * 0.2}
            >
              <div
                className={cn(
                  'group flex flex-col items-center justify-center gap-3 rounded-[var(--radius-lg)] p-6',
                  'border border-[var(--color-border)] bg-[var(--color-bg-tertiary)]',
                  'transition-all duration-300',
                  'hover:scale-110 hover:border-[var(--color-border-hover)]',
                  'hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)]'
                )}
              >
                {/* Tech initial as logo placeholder */}
                <div
                  className={cn(
                    'flex h-14 w-14 items-center justify-center rounded-[var(--radius-md)]',
                    'text-[length:var(--text-xl)] font-bold',
                    'transition-transform duration-300 group-hover:scale-110'
                  )}
                  style={{
                    color: tech.color,
                    backgroundColor: `${tech.color}15`,
                  }}
                >
                  {tech.name.charAt(0)}
                </div>

                {/* Name */}
                <span
                  className="text-center text-[length:var(--text-sm)] font-medium text-[var(--color-text-secondary)] transition-colors duration-300 group-hover:text-[var(--color-text-primary)]"
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  {tech.name}
                </span>
              </div>
            </FloatingElement>
          ))}
        </div>
      </div>

      {/* Horizontal progress bar */}
      <div className="absolute bottom-0 left-0 h-px w-full bg-[var(--color-border)]">
        <div
          ref={progressBarRef}
          className="h-full w-full origin-left bg-[var(--color-accent-primary)]"
          style={{ transform: 'scaleX(0)' }}
        />
      </div>
    </section>
  );
}
