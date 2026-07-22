'use client';

import { useRef, useState, useCallback } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, ScrollTrigger, registerGSAPPlugins } from '@/lib/animations/gsap-setup';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { FadeIn } from '@/components/animation/FadeIn';
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
  // Track last-committed React state via refs so the per-frame onUpdate
  // can avoid scheduling re-renders unless something actually changed.
  const activeIdxRef = useRef(0);
  const showCtaRef = useRef(false);
  const inSectionRef = useRef(false);

  registerGSAPPlugins();

  const setCardRef = useCallback((el: HTMLDivElement | null, i: number) => {
    cardRefs.current[i] = el;
  }, []);

  useGSAP(
    () => {
      if (!sectionRef.current) return;

      const cards = cardRefs.current.filter(Boolean) as HTMLDivElement[];
      if (cards.length === 0) return;

      // Pre-build per-card quickSetters so the per-frame render does
      // direct DOM writes rather than going through gsap.set's plugin
      // pipeline N times per scroll tick.
      const setters = cards.map((card) => ({
        y: gsap.quickSetter(card, 'y', 'px') as (v: number) => void,
        scale: gsap.quickSetter(card, 'scale') as (v: number) => void,
        opacity: gsap.quickSetter(card, 'opacity') as (v: number) => void,
      }));

      // Initialize all cards hidden below
      cards.forEach((card, i) => {
        gsap.set(card, { opacity: 0, y: 140, scale: 0.94, zIndex: N - i });
      });

      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top top',
        end: 'bottom bottom',
        // Consistent 0.5s scrub: smooth catch-up on fast scroll without drag.
        scrub: 0.5,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const p = self.progress;

          const isIn = p > 0.005 && p < 0.995;
          if (isIn !== inSectionRef.current) {
            inSectionRef.current = isIn;
            setInSection(isIn);
          }

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

            const s = setters[i];
            s.opacity(opacity);
            s.y(y);
            s.scale(scale);
            // zIndex isn't a transform — set it directly, only when changed.
            if (card.style.zIndex !== String(zIdx)) {
              card.style.zIndex = String(zIdx);
            }
          }

          bestIdx = Math.max(0, Math.min(N - 1, bestIdx));
          if (bestIdx !== activeIdxRef.current) {
            activeIdxRef.current = bestIdx;
            setActiveIdx(bestIdx);
          }
          const nextShowCta = bestIdx === N - 1 && bestOpacity > 0.8;
          if (nextShowCta !== showCtaRef.current) {
            showCtaRef.current = nextShowCta;
            setShowCta(nextShowCta);
          }
        },
      });
    },
    { scope: sectionRef, dependencies: [] }
  );

  return (
    <section data-section-index={4} className="seam-red">
      {/* Section header — outside the pinned area */}
      <div className="section-tint pb-4 pt-8 md:pt-10">
        <div className="mx-auto max-w-[var(--container-max)] px-[var(--container-padding)]">
          <FadeIn direction="up">
            <span
              className="text-[length:var(--h-eyebrow)] font-medium uppercase tracking-widest text-[var(--color-text-tertiary)]"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              Selected Work
            </span>
            <h2
              className={cn(
                'mt-3 font-[family-name:var(--font-display)]',
                'text-[length:var(--h-section)] leading-tight tracking-tight',
                'text-[var(--color-text-primary)]'
              )}
            >
              Real-World Digital Solutions Built for Scale
            </h2>
          </FadeIn>
        </div>
      </div>

      {/* Scroll area — drives the animation */}
      <div ref={sectionRef} style={{ height: `${N * 70}vh` }} className="relative">
        {/* Sticky viewport — cap the min-height to the visible viewport (svh) so the
            pinned stage never extends below the fold on short screens (1366x768
            laptops, phones, iPad landscape), which would clip the card + View All CTA. */}
        <div className="sticky top-0 flex flex-col min-h-[min(760px,100svh)] h-[80svh] items-center justify-center overflow-hidden section-tint">
          {/* Card stack — rem height so it scales with the big-screen root font steps */}
          <div
            ref={stackRef}
            className="relative mx-auto w-full max-w-[53.75rem] px-4"
            style={{ height: 'min(40rem, 80svh)' }}
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
                    'card-work relative flex h-full w-full overflow-hidden',
                    'rounded-[var(--radius-lg)] border border-[rgba(192,0,0,0.16)]',
                    'bg-[var(--color-bg-secondary)]',
                    'shadow-[0_24px_48px_rgba(192,0,0,0.07),0_8px_16px_rgba(0,0,0,0.05)]',
                    // Touch (phone + ALL iPads) = stacked column; only real desktop
                    // (desk: = large screen + mouse) gets the side-by-side row.
                    'flex-col desk:flex-row'
                  )}
                >
                  {/* Image side — touch: a percentage of the card height (bigger
                      photo than the old 200px, but scales DOWN on short phones so
                      the text below never clips). Desktop: the original left half. */}
                  <div className="relative w-full flex-[0_0_45%] overflow-hidden bg-[var(--color-bg-secondary)] desk:h-full desk:w-1/2 desk:flex-none">
                    <Image
                      src={project.image}
                      alt={project.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 430px"
                      className={cn(
                        'object-contain p-4 transition-transform duration-[1.6s]',
                        i === activeIdx ? 'scale-[1.04]' : 'scale-100'
                      )}
                      // Pivot the scroll-zoom 30% past the image's right edge so it
                      // visibly grows toward the right rather than from the centre.
                      style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)', transformOrigin: '130% 50%' }}
                    />
                  </div>

                  {/* Content side — touch: justify-end pushes the text block toward
                      the BOTTOM of the card (under the enlarged photo) with tighter
                      leading + margins. Desktop keeps centred, roomier spacing. */}
                  <div className="flex flex-1 flex-col justify-end p-8 desk:justify-center desk:p-12">
                    <h3
                      className="mb-3 text-[length:var(--h-sub)] desk:mb-5 desk:text-[length:var(--text-lg)] font-semibold leading-[1.15] desk:leading-[1.2] tracking-tight text-[var(--color-text-primary)]"
                      style={{
                        fontFamily: 'var(--font-card-heading), var(--font-display)',
                        letterSpacing: '-0.02em',
                      }}
                    >
                      {project.title}
                    </h3>

                    {/* Category pill */}
                    <div className="mb-3 desk:mb-5">
                      <span
                        className={cn(
                          'inline-block rounded-[var(--radius-full)] px-3 py-1',
                          'bg-[rgba(192,0,0,0.10)] text-[var(--red-brand)]',
                          'text-[length:var(--text-sm)] font-semibold uppercase tracking-wider'
                        )}
                        style={{ fontFamily: 'var(--font-heading)' }}
                      >
                        {project.category}
                      </span>
                    </div>

                    <p
                      className="mb-5 line-clamp-3 max-w-[440px] text-[length:var(--text-base)] leading-[1.45] desk:mb-9 desk:leading-[1.65] text-[var(--color-text-secondary)]"
                      style={{ fontFamily: 'var(--font-body)' }}
                    >
                      {project.description}
                    </p>

                    <Link
                      href={`/work/${project.slug}`}
                      className={cn(
                        'group/link inline-flex w-fit items-center gap-2',
                        'border-b-[1.5px] border-[var(--color-text-primary)] pb-1',
                        'text-[length:var(--text-sm)] font-semibold uppercase tracking-[0.06em]',
                        'text-[var(--color-text-primary)] transition-[gap] duration-300',
                        'hover:gap-3'
                      )}
                      style={{ fontFamily: 'var(--font-body)' }}
                    >
                      View Case Study
                      <svg
                        width="16"
                        height="16"
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

          {/* View All CTA — sits a fixed 28px below the card on every screen size
              (flow sibling inside the flex-col viewport, not pinned to the bottom edge). */}
          <div
            className={cn(
              'mt-7 z-20 transition-all duration-700',
              showCta
                ? 'translate-y-0 opacity-100'
                : 'pointer-events-none translate-y-3 opacity-0'
            )}
            style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
          >
            <Button variant="primary" size="lg" href="/work">
              View All Work
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
