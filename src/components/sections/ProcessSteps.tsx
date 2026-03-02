'use client';

import { useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, ScrollTrigger, registerGSAPPlugins } from '@/lib/animations/gsap-setup';
import { FadeIn } from '@/components/animation/FadeIn';
import { cn } from '@/lib/utils/cn';

const steps = [
  {
    number: '01',
    title: 'Understand',
    description:
      'We deeply understand your business goals, users, and operational challenges before writing a single line of code.',
  },
  {
    number: '02',
    title: 'Design',
    description:
      'We create scalable and secure solution architectures aligned with long-term growth and business objectives.',
  },
  {
    number: '03',
    title: 'Develop',
    description:
      'We follow clean coding practices with strong testing and performance optimization throughout the development lifecycle.',
  },
  {
    number: '04',
    title: 'Deploy & Support',
    description:
      'We ensure smooth deployment with continuous support, maintenance, and enhancements post-launch.',
  },
];

export function ProcessSteps() {
  const sectionRef = useRef<HTMLElement>(null);
  const stepsContainerRef = useRef<HTMLDivElement>(null);
  const progressLineRef = useRef<HTMLDivElement>(null);
  const [activeStep, setActiveStep] = useState(0);

  registerGSAPPlugins();

  useGSAP(
    () => {
      if (!sectionRef.current || !stepsContainerRef.current || !progressLineRef.current) return;

      const stepEls = sectionRef.current.querySelectorAll('[data-step]');

      // Step activation on scroll
      stepEls.forEach((el, i) => {
        ScrollTrigger.create({
          trigger: el,
          start: 'top 60%',
          end: 'bottom 40%',
          onEnter: () => setActiveStep(i),
          onEnterBack: () => setActiveStep(i),
        });
      });

      // Animated progress line — draws from top to bottom as you scroll through steps
      gsap.fromTo(
        progressLineRef.current,
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: stepsContainerRef.current,
            start: 'top 55%',
            end: 'bottom 50%',
            scrub: 0.8,
          },
        }
      );
    },
    { scope: sectionRef, dependencies: [] }
  );

  return (
    <section
      ref={sectionRef}
      data-section-index={5}
      className="bg-[var(--color-bg-primary)] py-[var(--space-section)]"
    >
      <div className="mx-auto max-w-[var(--container-max)] px-[var(--container-padding)]">
        {/* Section header */}
        <FadeIn direction="up" className="mb-20">
          <span
            className="text-[length:var(--text-xs)] font-medium uppercase tracking-widest text-[var(--color-text-tertiary)]"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            How We Work
          </span>
          <h2
            className={cn(
              'mt-3 font-[family-name:var(--font-display)]',
              'text-[clamp(2rem,4vw,3rem)] leading-tight tracking-tight',
              'text-[var(--color-text-primary)]'
            )}
          >
            Business First. Technology Driven.
          </h2>
        </FadeIn>

        {/* Steps with animated line */}
        <div className="relative" ref={stepsContainerRef}>
          {/* Track line (light, always visible) — from first circle center to last */}
          <div
            className="absolute left-[23px] top-[25px] hidden w-[2px] lg:left-[60px] lg:block"
            style={{
              bottom: '25px',
              background: 'var(--color-border)',
            }}
          />

          {/* Progress line (accent, scroll-animated) — draws on top of track */}
          <div
            ref={progressLineRef}
            className="absolute left-[23px] top-[25px] hidden w-[2px] lg:left-[60px] lg:block"
            style={{
              bottom: '25px',
              background: 'var(--color-accent-primary)',
              transformOrigin: 'top center',
              transform: 'scaleY(0)',
            }}
          />

          {/* Step items */}
          <div className="space-y-24 lg:space-y-32">
            {steps.map((step, i) => {
              const isActive = i === activeStep;
              const isPast = i < activeStep;

              return (
                <div
                  key={step.number}
                  data-step={i}
                  className="relative lg:pl-32"
                >
                  {/* Step number circle */}
                  <div
                    className={cn(
                      'absolute left-0 top-0 z-[1] flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all duration-500',
                      'lg:left-[36px] lg:h-[50px] lg:w-[50px]',
                      'font-[family-name:var(--font-mono)] text-[length:var(--text-sm)] font-bold',
                      isActive
                        ? 'scale-110 border-[var(--color-accent-primary)] bg-[var(--color-accent-primary)] text-[var(--color-text-inverse)] shadow-[0_0_20px_rgba(33,150,243,0.3)]'
                        : isPast
                          ? 'border-[var(--color-accent-secondary)] bg-[var(--color-bg-primary)] text-[var(--color-text-tertiary)]'
                          : 'border-[var(--color-border)] bg-[var(--color-bg-primary)] text-[var(--color-text-tertiary)]'
                    )}
                  >
                    {step.number}
                  </div>

                  {/* Content */}
                  <FadeIn direction="up" delay={i * 0.1}>
                    <div
                      className={cn(
                        'pl-16 transition-all duration-500 lg:pl-0',
                        isActive
                          ? 'opacity-100'
                          : isPast
                            ? 'opacity-50'
                            : 'opacity-30'
                      )}
                    >
                      <h3
                        className={cn(
                          'mb-3 font-[family-name:var(--font-heading)]',
                          'text-[length:var(--text-2xl)] font-bold',
                          isActive
                            ? 'text-[var(--color-accent-primary)]'
                            : 'text-[var(--color-text-tertiary)]'
                        )}
                        style={{
                          transition: 'color 0.5s ease',
                        }}
                      >
                        {step.title}
                      </h3>
                      <p
                        className={cn(
                          'max-w-lg text-[length:var(--text-base)] leading-relaxed',
                          isActive
                            ? 'text-[var(--color-text-secondary)]'
                            : 'text-[var(--color-text-tertiary)]'
                        )}
                        style={{ fontFamily: 'var(--font-body)' }}
                      >
                        {step.description}
                      </p>
                    </div>
                  </FadeIn>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
