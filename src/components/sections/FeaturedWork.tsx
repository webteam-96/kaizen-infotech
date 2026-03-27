'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, ScrollTrigger, registerGSAPPlugins } from '@/lib/animations/gsap-setup';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { FadeIn } from '@/components/animation/FadeIn';
import { CountUp } from '@/components/animation/CountUp';
import { projects } from '@/content/projects';
import { cn } from '@/lib/utils/cn';

// Take first 5 projects for the stack
const featured = projects.slice(0, 5);
const N = featured.length;

// Smoother hermite interpolation
function smootherStep(t: number) {
  return t * t * t * (t * (t * 6 - 15) + 10);
}

export function FeaturedWork() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const stackRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [showCta, setShowCta] = useState(false);
  const [inSection, setInSection] = useState(false);

  registerGSAPPlugins();

  const setCardRef = useCallback((el: HTMLDivElement | null, i: number) => {
    cardRefs.current[i] = el;
  }, []);

  useGSAP(
    () => {
      if (!sectionRef.current) return;

      const cards = cardRefs.current.filter(Boolean) as HTMLDivElement[];
      if (cards.length === 0) return;

      // Initialize all cards hidden below
      cards.forEach((card, i) => {
        gsap.set(card, { opacity: 0, y: 140, scale: 0.94, zIndex: N - i });
      });

      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1.5,
        onUpdate: (self) => {
          const p = self.progress;

          const isIn = p > 0.005 && p < 0.995;
          setInSection(isIn);

          const segSize = 1 / N;
          const halfWidth = segSize * 0.65;
          let bestOpacity = -1;
          let bestIdx = 0;

          for (let i = 0; i < N; i++) {
            const card = cards[i];
            if (!card) continue;

            const peak = (i + 0.5) * segSize;
            const winStart = peak - halfWidth;
            const winEnd = peak + halfWidth;

            let opacity: number, y: number, scale: number, zIdx: number;

            if (p <= winStart) {
              opacity = 0;
              y = 120;
              scale = 0.94;
              zIdx = 1;
            } else if (p > winStart && p <= peak) {
              const raw = (p - winStart) / (peak - winStart);
              const t = smootherStep(raw);
              opacity = t;
              y = 120 * (1 - t);
              scale = 0.94 + 0.06 * t;
              zIdx = 5 + Math.round(t * 5);
            } else if (p > peak && p < winEnd) {
              if (i === N - 1) {
                opacity = 1;
                y = 0;
                scale = 1;
                zIdx = 10;
              } else {
                const raw = (p - peak) / (winEnd - peak);
                const t = smootherStep(raw);
                opacity = 1 - t;
                y = -80 * t;
                scale = 1 - 0.03 * t;
                zIdx = 10 - Math.round(t * 5);
              }
            } else {
              opacity = 0;
              y = -80;
              scale = 0.97;
              zIdx = 1;
            }

            if (opacity > bestOpacity) {
              bestOpacity = opacity;
              bestIdx = i;
            }

            gsap.set(card, { opacity, y, scale, zIndex: zIdx });
          }

          bestIdx = Math.max(0, Math.min(N - 1, bestIdx));
          setActiveIdx(bestIdx);
          setShowCta(bestIdx === N - 1 && bestOpacity > 0.8);
        },
      });
    },
    { scope: sectionRef, dependencies: [] }
  );

  return (
    <section data-section-index={4}>
      {/* Section header — outside the pinned area */}
      <div className="bg-[var(--color-bg-primary)] pb-4 pt-16 md:pt-20">
        <div className="mx-auto max-w-[var(--container-max)] px-[var(--container-padding)]">
          <FadeIn direction="up">
            <span
              className="text-[length:var(--text-xs)] font-medium uppercase tracking-widest text-[var(--color-text-tertiary)]"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              Selected Work
            </span>
            <h2
              className={cn(
                'mt-3 font-[family-name:var(--font-display)]',
                'text-[clamp(2rem,4vw,3rem)] leading-tight tracking-tight',
                'text-[var(--color-text-primary)]'
              )}
            >
              Real-World Digital Solutions Built for Scale
            </h2>
            <span
              className="mt-4 inline-block text-[length:var(--text-sm)] text-[var(--color-text-tertiary)]"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              0<CountUp end={projects.length} /> Projects
            </span>
          </FadeIn>
        </div>
      </div>

      {/* Scroll area — drives the animation */}
      <div ref={sectionRef} style={{ height: `${N * 100}vh` }} className="relative">
        {/* Sticky viewport */}
        <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden bg-[var(--color-bg-primary)]">
          {/* Card stack */}
          <div
            ref={stackRef}
            className="relative mx-auto w-full max-w-[860px] px-4"
            style={{ height: 'min(640px, 80vh)' }}
          >
            {featured.map((project, i) => (
              <div
                key={project.id}
                ref={(el) => setCardRef(el, i)}
                className="absolute inset-0 will-change-transform"
                style={{ borderRadius: 'var(--radius-lg)' }}
              >
                <div
                  className={cn(
                    'flex h-full w-full overflow-hidden',
                    'rounded-[var(--radius-lg)] border border-[var(--color-border)]',
                    'bg-[var(--color-bg-primary)]',
                    'shadow-[0_24px_48px_rgba(0,0,0,0.06),0_8px_16px_rgba(0,0,0,0.04)]',
                    'flex-col md:flex-row'
                  )}
                >
                  {/* Image side */}
                  <div className="relative h-[200px] w-full flex-shrink-0 overflow-hidden bg-[var(--color-bg-secondary)] md:h-full md:w-1/2">
                    <Image
                      src={project.image}
                      alt={project.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 430px"
                      className={cn(
                        'object-contain p-4 transition-transform duration-[1.6s]',
                        i === activeIdx ? 'scale-[1.04]' : 'scale-100'
                      )}
                      style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
                    />
                  </div>

                  {/* Content side */}
                  <div className="flex flex-1 flex-col justify-center p-8 md:p-12">
                    <span
                      className="mb-5 block text-[length:var(--text-xs)] font-semibold uppercase tracking-[0.2em] text-[var(--color-text-tertiary)]"
                      style={{ fontFamily: 'var(--font-mono)' }}
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>

                    <h3
                      className="mb-4 text-[clamp(2rem,3vw,2.75rem)] font-medium leading-[1.15] tracking-tight text-[var(--color-text-primary)]"
                      style={{
                        fontFamily: 'var(--font-display)',
                        letterSpacing: '-0.02em',
                      }}
                    >
                      {project.title}
                    </h3>

                    {/* Category pill */}
                    <div className="mb-4">
                      <span
                        className={cn(
                          'inline-block rounded-[var(--radius-full)] px-3 py-1',
                          'bg-[var(--color-accent-primary)]/10 text-[var(--color-accent-primary)]',
                          'text-[length:var(--text-xs)] font-medium uppercase tracking-wider'
                        )}
                        style={{ fontFamily: 'var(--font-heading)' }}
                      >
                        {project.category}
                      </span>
                    </div>

                    <p
                      className="mb-8 line-clamp-3 max-w-[340px] text-[length:var(--text-sm)] leading-[1.7] text-[var(--color-text-secondary)]"
                      style={{ fontFamily: 'var(--font-body)' }}
                    >
                      {project.description}
                    </p>

                    <Link
                      href={`/work/${project.slug}`}
                      className={cn(
                        'group/link inline-flex w-fit items-center gap-2',
                        'border-b-[1.5px] border-[var(--color-text-primary)] pb-1',
                        'text-[length:var(--text-xs)] font-semibold uppercase tracking-[0.06em]',
                        'text-[var(--color-text-primary)] transition-[gap] duration-300',
                        'hover:gap-3'
                      )}
                      style={{ fontFamily: 'var(--font-body)' }}
                    >
                      View Case Study
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="transition-transform duration-300 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5"
                      >
                        <path d="m7 17 9.2-9.2M17 17V8H8" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* View All CTA */}
          <div
            className={cn(
              'absolute bottom-[max(52px,8vh)] left-1/2 -translate-x-1/2 transition-all duration-700',
              showCta
                ? 'translate-y-0 opacity-100'
                : 'pointer-events-none translate-y-3 opacity-0'
            )}
            style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
          >
            <Button variant="primary" size="lg" href="/work">
              View All Projects
            </Button>
          </div>
        </div>

        {/* Progress dots */}
        <div
          className={cn(
            'fixed right-10 top-1/2 z-50 hidden -translate-y-1/2 flex-col items-center gap-2 transition-opacity duration-400 lg:flex',
            inSection ? 'opacity-100' : 'opacity-0'
          )}
        >
          {featured.map((_, i) => (
            <div
              key={i}
              className={cn(
                'rounded-full transition-all duration-500',
                i === activeIdx
                  ? 'h-5 w-1.5 bg-[var(--color-text-primary)]'
                  : 'h-1.5 w-1.5 bg-[var(--color-text-primary)]/10'
              )}
              style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
