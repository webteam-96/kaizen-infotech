'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, registerGSAPPlugins } from '@/lib/animations/gsap-setup';
import { ANIMATION_CONFIG } from '@/lib/animations/config';
import { ScrollFadeIn } from '@/components/animation/ScrollFadeIn';
import { CountUp } from '@/components/animation/CountUp';
import { useReducedMotion } from '@/hooks';
import { cn } from '@/lib/utils/cn';

const stats = [
  { number: 10, suffix: '+', label: 'Years of Experience' },
  { number: 100, suffix: '+', label: 'Projects Delivered' },
  { number: 8, suffix: '+', label: 'Industries Served' },
  { number: 5, suffix: '', label: 'Core Services' },
];

export function StatsGrid() {
  const sectionRef = useRef<HTMLElement>(null);
  const dotGridRef = useRef<HTMLDivElement>(null);
  const circle1Ref = useRef<HTMLDivElement>(null);
  const circle2Ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  registerGSAPPlugins();

  useGSAP(
    () => {
      if (!sectionRef.current) return;

      // Dot grid: fade in opacity from 0 to 0.03 with scrub
      if (dotGridRef.current) {
        gsap.fromTo(
          dotGridRef.current,
          { opacity: 0 },
          {
            opacity: 0.03,
            ease: 'none',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 80%',
              end: 'top 30%',
              scrub: ANIMATION_CONFIG.scrub.smooth,
            },
          }
        );
      }

      // Decorative circles: scrub-based scale (only if motion allowed)
      if (!prefersReducedMotion) {
        if (circle1Ref.current) {
          gsap.fromTo(
            circle1Ref.current,
            { scale: 0.8 },
            {
              scale: 1,
              ease: 'none',
              scrollTrigger: {
                trigger: sectionRef.current,
                start: 'top bottom',
                end: 'bottom top',
                scrub: ANIMATION_CONFIG.scrub.smooth,
              },
            }
          );
        }
        if (circle2Ref.current) {
          gsap.fromTo(
            circle2Ref.current,
            { scale: 0.8 },
            {
              scale: 1,
              ease: 'none',
              scrollTrigger: {
                trigger: sectionRef.current,
                start: 'top bottom',
                end: 'bottom top',
                scrub: ANIMATION_CONFIG.scrub.smooth,
              },
            }
          );
        }
      }
    },
    { scope: sectionRef, dependencies: [prefersReducedMotion] }
  );

  return (
    <section
      ref={sectionRef}
      data-section-index={3}
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[var(--color-bg-secondary)] py-[var(--space-section)]"
    >
      {/* Decorative dot grid */}
      <div
        ref={dotGridRef}
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0"
        style={{
          backgroundImage:
            'radial-gradient(circle, var(--color-text-primary) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* Decorative circles */}
      <div
        ref={circle1Ref}
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[var(--color-border)] opacity-20"
      />
      <div
        ref={circle2Ref}
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[var(--color-border)] opacity-10"
      />

      <div className="relative z-10 mx-auto max-w-[var(--container-max)] px-[var(--container-padding)]">
        {/* Section label */}
        <ScrollFadeIn direction="up" className="mb-16 text-center">
          <span
            className="text-[length:var(--text-xs)] font-medium uppercase tracking-widest text-[var(--color-text-tertiary)]"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            By the Numbers
          </span>
        </ScrollFadeIn>

        {/* 2x2 Grid */}
        <ScrollFadeIn direction="up" stagger={0.15} className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:gap-16">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              {/* Number */}
              <div
                className={cn(
                  'font-[family-name:var(--font-display)]',
                  'text-[length:var(--text-mega)]',
                  'leading-none tracking-tight',
                  'text-[var(--color-text-primary)]'
                )}
              >
                <CountUp end={stat.number} suffix={stat.suffix} />
              </div>

              {/* Label */}
              <p
                className={cn(
                  'mt-2 text-[var(--text-sm)] text-[var(--color-text-secondary)]',
                  'font-[family-name:var(--font-heading)]'
                )}
              >
                {stat.label}
              </p>
            </div>
          ))}
        </ScrollFadeIn>
      </div>
    </section>
  );
}
