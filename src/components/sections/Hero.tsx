'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, registerGSAPPlugins } from '@/lib/animations/gsap-setup';
import { ANIMATION_CONFIG } from '@/lib/animations/config';
import { TextReveal } from '@/components/animation/TextReveal';
import { FadeIn } from '@/components/animation/FadeIn';
import { Button } from '@/components/ui/Button';
import { useParallax, useReducedMotion } from '@/hooks';
import { cn } from '@/lib/utils/cn';

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);
  const accentLineRef = useRef<HTMLDivElement>(null);
  const orb1Ref = useRef<HTMLDivElement>(null);
  const orb2Ref = useRef<HTMLDivElement>(null);
  const chevronRef = useRef<SVGSVGElement>(null);
  const prefersReducedMotion = useReducedMotion();

  registerGSAPPlugins();

  // Parallax on orbs for depth effect
  useParallax(orb1Ref, { speed: 0.3 });
  useParallax(orb2Ref, { speed: -0.2 });

  useGSAP(
    () => {
      if (!sectionRef.current) return;

      // Content fades to opacity:0, y:-60 as user scrolls past
      if (contentRef.current) {
        gsap.to(contentRef.current, {
          opacity: 0,
          y: prefersReducedMotion ? 0 : -60,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: 0.5,
          },
        });
      }

      // Scroll indicator: opacity linked to scroll
      if (scrollIndicatorRef.current) {
        gsap.to(scrollIndicatorRef.current, {
          opacity: 0,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top top',
            end: '100px top',
            scrub: true,
          },
        });
      }

      // Chevron bounce animation (replaces framer-motion animate)
      if (chevronRef.current && !prefersReducedMotion) {
        gsap.to(chevronRef.current, {
          y: 6,
          duration: 0.75,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
        });
      }

      // Accent line: scaleX 0 -> 1 on enter
      if (accentLineRef.current) {
        gsap.fromTo(
          accentLineRef.current,
          { scaleX: 0 },
          {
            scaleX: 1,
            duration: ANIMATION_CONFIG.duration.slow,
            ease: ANIMATION_CONFIG.ease.snappy,
            scrollTrigger: {
              trigger: accentLineRef.current,
              start: ANIMATION_CONFIG.scrollTrigger.start,
              once: true,
            },
          }
        );
      }
    },
    { scope: sectionRef, dependencies: [prefersReducedMotion] }
  );

  return (
    <section
      ref={sectionRef}
      data-section-index={0}
      className="relative flex min-h-screen items-center justify-center overflow-hidden"
    >
      {/* Gradient orb backgrounds with parallax */}
      <div
        ref={orb1Ref}
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 50%, var(--color-accent-primary)/0.08 0%, transparent 70%)',
        }}
      />
      <div
        ref={orb2Ref}
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 50% 40% at 30% 60%, var(--color-accent-secondary)/0.06 0%, transparent 70%)',
        }}
      />

      {/* Content */}
      <div
        ref={contentRef}
        className="relative z-10 mx-auto max-w-[var(--container-max)] px-[var(--container-padding)] text-center"
      >
        {/* Headline */}
        <TextReveal
          as="h1"
          splitBy="chars"
          stagger={0.03}
          duration={0.8}
          className={cn(
            'mx-auto max-w-4xl',
            'font-[family-name:var(--font-display)]',
            'text-[clamp(2.5rem,6vw,5rem)] leading-[1.1] tracking-tight',
            'text-[var(--color-text-primary)]'
          )}
        >
          Custom Software and Digital Solutions That Drive Business Efficiency
        </TextReveal>

        {/* Subheadline */}
        <FadeIn direction="up" delay={0.6} distance={20}>
          <p
            className={cn(
              'mx-auto mt-6 max-w-2xl',
              'text-[length:var(--text-lg)] leading-relaxed',
              'text-[var(--color-text-secondary)]',
              'font-[family-name:var(--font-body)]'
            )}
          >
            We deliver custom software development, mobile app development,
            event registration and management systems, and digital marketing
            solutions that help organizations operate smarter and scale faster.
          </p>
        </FadeIn>

        {/* CTAs */}
        <FadeIn direction="up" delay={0.9} distance={30}>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Button variant="primary" size="lg" href="/services">
              Explore Our Services
            </Button>
            <Button variant="secondary" size="lg" href="/contact">
              Talk to Our Experts
            </Button>
          </div>
        </FadeIn>

        {/* Accent line below CTAs */}
        <div
          ref={accentLineRef}
          className="mx-auto mt-6 h-px w-32 origin-center bg-[var(--color-accent-primary)]"
        />
      </div>

      {/* Scroll indicator */}
      <div
        ref={scrollIndicatorRef}
        className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2"
      >
        <span
          className="text-[length:var(--text-xs)] uppercase tracking-widest text-[var(--color-text-tertiary)]"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Scroll
        </span>
        <svg
          ref={chevronRef}
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          className="text-[var(--color-text-tertiary)]"
        >
          <path
            d="M4 7L10 13L16 7"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </section>
  );
}
