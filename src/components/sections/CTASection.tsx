'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, registerGSAPPlugins } from '@/lib/animations/gsap-setup';
import { ANIMATION_CONFIG } from '@/lib/animations/config';
import { TextReveal } from '@/components/animation/TextReveal';
import { ScrollFadeIn } from '@/components/animation/ScrollFadeIn';
import { useParallax, useReducedMotion } from '@/hooks';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils/cn';

export function CTASection() {
  const orb1Ref = useRef<HTMLDivElement>(null);
  const orb2Ref = useRef<HTMLDivElement>(null);
  const orb3Ref = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const hrRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  useParallax(orb1Ref, { speed: 0.3 });
  useParallax(orb2Ref, { speed: -0.2 });
  useParallax(orb3Ref, { speed: 0.15 });

  registerGSAPPlugins();

  // Button glow: scrub-linked scale/opacity
  useGSAP(
    () => {
      if (!glowRef.current || prefersReducedMotion) return;

      gsap.fromTo(
        glowRef.current,
        { scale: 0.9, opacity: 0.2 },
        {
          scale: 1.1,
          opacity: 0.5,
          ease: 'none',
          scrollTrigger: {
            trigger: glowRef.current,
            start: 'top 80%',
            end: 'bottom 20%',
            scrub: ANIMATION_CONFIG.scrub.smooth,
          },
        }
      );
    },
    { dependencies: [prefersReducedMotion] }
  );

  // Expanding horizontal rule above CTA text
  useGSAP(
    () => {
      if (!hrRef.current || prefersReducedMotion) return;

      gsap.fromTo(
        hrRef.current,
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: ANIMATION_CONFIG.duration.slow,
          ease: ANIMATION_CONFIG.ease.cinematic,
          scrollTrigger: {
            trigger: hrRef.current,
            start: ANIMATION_CONFIG.scrollTrigger.start,
            toggleActions: ANIMATION_CONFIG.scrollTrigger.toggleActions,
            once: true,
          },
        }
      );
    },
    { dependencies: [prefersReducedMotion] }
  );

  return (
    <section
      data-section-index={9}
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[var(--color-bg-primary)]"
    >
      {/* Parallax orbs */}
      <div
        ref={orb1Ref}
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 70% 50% at 50% 50%, var(--color-accent-primary)/0.1 0%, transparent 70%)',
        }}
      />
      <div
        ref={orb2Ref}
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 40% 60% at 70% 40%, var(--color-accent-secondary)/0.08 0%, transparent 60%)',
        }}
      />
      <div
        ref={orb3Ref}
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 30% 30% at 20% 70%, var(--color-accent-primary)/0.06 0%, transparent 50%)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-[var(--container-max)] px-[var(--container-padding)] text-center">
        {/* Expanding horizontal rule */}
        <div
          ref={hrRef}
          className="mx-auto mb-8 h-px w-24 origin-center bg-[var(--color-accent-primary)]"
          style={{ transform: prefersReducedMotion ? undefined : 'scaleX(0)' }}
        />

        <TextReveal
          as="h2"
          splitBy="chars"
          stagger={0.02}
          duration={0.7}
          className={cn(
            'mx-auto max-w-3xl',
            'font-[family-name:var(--font-display)]',
            'text-[clamp(2.5rem,6vw,4.5rem)] leading-[1.1] tracking-tight',
            'text-[var(--color-text-primary)]'
          )}
        >
          Ready to Digitize Your Operations?
        </TextReveal>

        <ScrollFadeIn direction="up" delay={0.5} distance={20}>
          <p
            className={cn(
              'mx-auto mt-6 max-w-xl',
              'text-[length:var(--text-lg)] leading-relaxed',
              'text-[var(--color-text-secondary)]',
              'font-[family-name:var(--font-body)]'
            )}
          >
            Whether you are planning a new digital platform or upgrading an
            existing system, our team is ready to help you build technology that
            delivers real results.
          </p>
        </ScrollFadeIn>

        <ScrollFadeIn direction="up" delay={0.8} distance={30}>
          <div className="relative mt-10 inline-block">
            {/* GSAP scrub-linked glow */}
            <div
              ref={glowRef}
              aria-hidden
              className="absolute -inset-4 rounded-[var(--radius-lg)] opacity-40 blur-xl"
              style={{
                background:
                  'radial-gradient(circle, var(--color-accent-primary) 0%, transparent 70%)',
              }}
            />
            <Button variant="primary" size="lg" href="/contact" className="relative">
              Get in Touch
            </Button>
          </div>
        </ScrollFadeIn>
      </div>
    </section>
  );
}
