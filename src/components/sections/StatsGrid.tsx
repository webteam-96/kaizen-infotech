'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, registerGSAPPlugins } from '@/lib/animations/gsap-setup';
import { ANIMATION_CONFIG } from '@/lib/animations/config';
import { ScrollFadeIn } from '@/components/animation/ScrollFadeIn';
import { CountUp } from '@/components/animation/CountUp';
import { useReducedMotion } from '@/hooks';
import { cn } from '@/lib/utils/cn';
import { FlowingLightWaves } from '@/components/shared/FlowingLightWaves';

const stats = [
  { number: 10, suffix: '+', label: 'Years of Experience' },
  { number: 100, suffix: '+', label: 'Projects Delivered' },
  { number: 8, suffix: '+', label: 'Industries Served' },
  { number: 3, suffix: 'Mn+', label: 'Users on Our Platforms' },
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
            opacity: 0.06,
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
      className="section-ink seam-blue relative isolate flex items-center justify-center overflow-hidden py-20"
    >
      <FlowingLightWaves />
      {/* Decorative dot grid */}
      <div
        ref={dotGridRef}
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0"
        style={{
          backgroundImage:
            'radial-gradient(circle, var(--text-on-ink) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* Decorative circles */}
      <div
        ref={circle1Ref}
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[rgba(245,248,252,0.25)] opacity-20"
      />
      <div
        ref={circle2Ref}
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[rgba(245,248,252,0.25)] opacity-10"
      />

      <div className="relative z-10 mx-auto max-w-[1000px] px-[var(--container-padding)]">
        {/* Section label */}
        <ScrollFadeIn direction="up" className="mb-16 text-center">
          <span
            className="ink-accent text-[length:var(--h-eyebrow)] font-medium uppercase tracking-widest"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            By the Numbers
          </span>
        </ScrollFadeIn>

        {/* 2x2 Grid */}
        <ScrollFadeIn direction="up" stagger={0.15} className="grid grid-cols-2 gap-y-8 md:grid-cols-4 md:gap-0">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className={cn(
                'text-center px-6',
                index !== 0 && 'md:border-l md:border-[rgba(245,248,252,0.18)]'
              )}
            >
              {/* Number */}
              <div
                className={cn(
                  'font-[family-name:var(--font-display)]',
                  'text-[length:56px]',
                  'leading-none tracking-tight',
                  'text-[var(--text-on-ink)]'
                )}
              >
                <CountUp end={stat.number} suffix={stat.suffix} />
              </div>

              {/* Small red accent underbar — red is the highlight colour on the
                  dark-blue band (kept tiny, per the "smallest design" intent). */}
              <div
                aria-hidden
                className="mx-auto mt-3 h-[3px] w-10 rounded-full"
                style={{ background: 'linear-gradient(90deg, var(--red-brand), var(--red-coral))' }}
              />

              {/* Label */}
              <p
                className={cn(
                  'mt-2 text-[var(--text-sm)] text-[var(--text-on-ink-muted)]',
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
