'use client';

import { useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, ScrollTrigger, registerGSAPPlugins } from '@/lib/animations/gsap-setup';
import { useReducedMotion } from '@/hooks';
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
      'We create secure, scalable solution architectures aligned with your long-term growth objectives.',
  },
  {
    number: '03',
    title: 'Develop',
    description:
      'We follow clean coding practices with rigorous testing and performance optimisation throughout development.',
  },
  {
    number: '04',
    title: 'Deploy & Support',
    description:
      'We ensure smooth deployment with continuous post-launch support, maintenance, and enhancements.',
  },
];

export function ProcessSteps() {
  const sectionRef    = useRef<HTMLElement>(null);
  const trackRef      = useRef<HTMLDivElement>(null);
  const railFillRef   = useRef<HTMLDivElement>(null);
  const panelRefs     = useRef<(HTMLDivElement | null)[]>([]);
  const bgNumRefs     = useRef<(HTMLDivElement | null)[]>([]);
  const [activeStep, setActiveStep] = useState(0);
  const activeStepRef = useRef(0);

  const prefersReducedMotion = useReducedMotion();
  registerGSAPPlugins();

  useGSAP(
    () => {
      const section = sectionRef.current;
      const track   = trackRef.current;
      if (!section || !track) return;

      // On mobile or reduced-motion: CSS / native scroll handles it.
      if (prefersReducedMotion || window.innerWidth < 768) return;

      const panels = panelRefs.current.filter(Boolean) as HTMLDivElement[];
      if (panels.length === 0) return;

      // quickSetters — direct DOM writes, no tween overhead per frame.
      const pSet = panels.map(p => ({
        opacity: gsap.quickSetter(p, 'opacity')     as (v: number) => void,
        scale:   gsap.quickSetter(p, 'scale')       as (v: number) => void,
        y:       gsap.quickSetter(p, 'y', 'px')     as (v: number) => void,
      }));
      // bg number parallax — no conflicting CSS transform on this element.
      const bgXSet = bgNumRefs.current
        .filter(Boolean)
        .map(el => gsap.quickSetter(el!, 'x', 'px') as (v: number) => void);

      // Initial state: panel 0 in focus, rest dimmed + shifted down.
      panels.forEach((p, i) => {
        gsap.set(p, {
          opacity: i === 0 ? 1    : 0.25,
          scale:   i === 0 ? 1    : 0.86,
          y:       i === 0 ? 0    : 36,
        });
      });

      const getTravel = () => Math.max(1, track.scrollWidth - window.innerWidth);

      // A single scrubbed tween drives the horizontal track translation.
      const tween = gsap.to(track, {
        x:                  () => -getTravel(),
        ease:               'none',
        invalidateOnRefresh: true,
      });

      const trigger = ScrollTrigger.create({
        trigger:            section,
        start:              'top top',
        end:                () => `+=${getTravel()}`,
        pin:                true,
        scrub:              1,
        animation:          tween,
        invalidateOnRefresh: true,

        onUpdate(self) {
          // 1. Rail fill: scaleX 0 → 1.
          if (railFillRef.current) {
            railFillRef.current.style.transform = `scaleX(${self.progress})`;
          }

          // 2. Per-panel focus + parallax.
          let nearestI    = 0;
          let nearestDist = Infinity;

          panels.forEach((panel, i) => {
            const rect = panel.getBoundingClientRect();
            const cx   = rect.left + rect.width * 0.5;
            const vx   = window.innerWidth * 0.5;
            const abs  = Math.abs(cx - vx);

            if (abs < nearestDist) { nearestDist = abs; nearestI = i; }

            // Normalised signed dist [−1 … +1 per panel width].
            const norm = (cx - vx) / rect.width;
            // Smooth focus [0 = off-screen, 1 = centred].
            const f = Math.max(0, 1 - Math.abs(norm) * 1.6);
            const e = f * f * (3 - 2 * f); // smoothstep

            pSet[i]?.opacity(0.22 + 0.78 * e);
            pSet[i]?.scale(0.86 + 0.14 * e);
            pSet[i]?.y((1 - e) * 36);

            // Bg number drifts at ~10 % of panel displacement → depth cue.
            if (bgXSet[i]) bgXSet[i](norm * rect.width * 0.10);
          });

          // 3. Active step — only re-render when it actually changes.
          if (nearestI !== activeStepRef.current) {
            activeStepRef.current = nearestI;
            setActiveStep(nearestI);
          }
        },
      });

      return () => { trigger.kill(); tween.kill(); };
    },
    { scope: sectionRef, dependencies: [prefersReducedMotion] },
  );

  return (
    <section
      ref={sectionRef}
      data-section-index={5}
      className={cn(
        'relative flex flex-col overflow-hidden bg-[var(--color-bg-primary)]',
        // Desktop: full-viewport height for the GSAP pin.
        'h-auto md:h-screen',
      )}
    >
      {/* ── Section header ──────────────────────────────────────── */}
      <div className="flex-none px-[var(--container-padding)] pb-2 pt-10 md:pt-14">
        <FadeIn direction="up">
          <span
            className="text-[length:var(--h-eyebrow)] font-medium uppercase tracking-widest text-[var(--color-text-tertiary)]"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            How We Work
          </span>
          <h2
            className={cn(
              'mt-3 font-[family-name:var(--font-display)]',
              'text-[length:var(--h-section)] leading-tight tracking-tight',
              'text-[var(--color-text-primary)]',
            )}
          >
            Business First. Technology Second.
          </h2>
        </FadeIn>
      </div>

      {/* ── Horizontal track ────────────────────────────────────── */}
      {/*
          Mobile  : overflow-x scroll + snap (CSS only, GSAP skipped).
          Desktop : overflow-x hidden; GSAP drives trackRef translateX.
          Height  : min(75vw,420px) on mobile → natural card height.
                    flex-1 on desktop → fills remaining viewport between
                    header and bottom rail bar.
      */}
      <div
        className={cn(
          'min-h-[min(75vw,420px)] flex-1',
          // Mobile scroll
          'overflow-x-auto [scroll-snap-type:x_mandatory]',
          '[scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
          // Desktop: GSAP controls position
          'md:overflow-x-hidden',
        )}
      >
        <div
          ref={trackRef}
          className="flex h-full will-change-transform"
        >
          {steps.map((step, i) => (
            <div
              key={step.number}
              ref={el => { panelRefs.current[i] = el; }}
              className={cn(
                'relative flex flex-none items-center',
                '[scroll-snap-align:start]',
                // Mobile panel: 85 vw so next panel peeks; desktop 75 vw.
                'w-[85vw] md:w-[75vw]',
                'h-full',
              )}
              style={{ willChange: 'transform, opacity' }}
            >
              {/* ── Decorative large number (parallax target) ── */}
              {/*
                  Wrapper handles vertical centring so the inner div has
                  NO CSS transform — GSAP can set x freely without conflict.
              */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-y-0 right-[6%] flex items-center select-none"
              >
                <div
                  ref={el => { bgNumRefs.current[i] = el; }}
                  className="font-[family-name:var(--font-display)] font-bold leading-none"
                  style={{
                    fontSize:      'clamp(7rem, 20vw, 18rem)',
                    color:         'var(--color-accent-primary)',
                    opacity:       0.05,
                    letterSpacing: '-0.04em',
                    willChange:    'transform',
                    userSelect:    'none',
                  }}
                >
                  {step.number}
                </div>
              </div>

              {/* ── Foreground content ─────────────────────────── */}
              <div className="relative z-10 px-[clamp(2.5rem,6vw,6rem)]">
                {/* Step badge */}
                <div
                  className={cn(
                    'mb-6 flex h-11 w-11 items-center justify-center rounded-full border-2',
                    'font-[family-name:var(--font-mono)] text-[length:var(--text-sm)] font-bold',
                    'transition-all duration-500',
                    activeStep === i
                      ? 'border-[var(--color-accent-primary)] bg-[var(--color-accent-primary)] text-[var(--color-text-inverse)] shadow-[0_0_20px_rgba(33,150,243,0.28)]'
                      : 'border-[var(--color-border)] bg-[var(--color-bg-primary)] text-[var(--color-text-tertiary)]',
                  )}
                >
                  {step.number}
                </div>

                <h3
                  className={cn(
                    'mb-4 font-[family-name:var(--font-display)]',
                    'text-[clamp(1.75rem,3.5vw,3.25rem)] font-bold leading-tight tracking-tight',
                    'transition-colors duration-500',
                    activeStep === i
                      ? 'text-[var(--color-text-primary)]'
                      : 'text-[var(--color-text-tertiary)]',
                  )}
                >
                  {step.title}
                </h3>

                <p
                  className="max-w-[380px] text-[length:var(--text-base)] leading-relaxed text-[var(--color-text-secondary)]"
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Bottom bar: rail + step counter ─────────────────────── */}
      <div className="flex-none px-[var(--container-padding)] pb-10 pt-5 md:pb-12">
        {/* Progress rail */}
        <div className="relative mb-4 flex h-8 items-center">
          {/* Static track line */}
          <div
            aria-hidden
            className="absolute left-0 right-0 h-px bg-[var(--color-border)]"
            style={{ top: 'calc(50% - 0.5px)' }}
          />
          {/* Animated fill — scaleX driven by onUpdate */}
          <div
            ref={railFillRef}
            aria-hidden
            className="absolute left-0 right-0 h-[2px] origin-left bg-[var(--color-accent-primary)] will-change-transform"
            style={{ top: 'calc(50% - 1px)', transform: 'scaleX(0)' }}
          />
          {/* Step nodes, evenly distributed */}
          <div className="relative flex w-full justify-between">
            {steps.map((step, i) => (
              <div
                key={step.number}
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full border-2',
                  'font-[family-name:var(--font-mono)] text-[length:var(--text-xs)] font-bold',
                  'bg-[var(--color-bg-primary)] transition-all duration-500',
                  activeStep === i
                    ? 'scale-110 border-[var(--color-accent-primary)] bg-[var(--color-accent-primary)] text-[var(--color-text-inverse)] shadow-[0_0_12px_rgba(33,150,243,0.35)]'
                    : i < activeStep
                      ? 'border-[var(--color-accent-primary)]/50 text-[var(--color-text-tertiary)]'
                      : 'border-[var(--color-border)] text-[var(--color-text-tertiary)]',
                )}
              >
                {step.number}
              </div>
            ))}
          </div>
        </div>

        {/* Counter: "01 / 04" + thin progress bar */}
        <div className="flex items-center gap-4">
          <span
            className="font-[family-name:var(--font-mono)] text-[length:var(--text-sm)] tabular-nums text-[var(--color-text-primary)]"
          >
            {String(activeStep + 1).padStart(2, '0')}
            <span className="text-[var(--color-text-tertiary)]">
              {' / '}{String(steps.length).padStart(2, '0')}
            </span>
          </span>
          <div className="h-[1.5px] flex-1 rounded-full bg-[var(--color-border)]">
            <div
              className="h-full rounded-full bg-[var(--color-accent-primary)] transition-[width] duration-500 ease-out"
              style={{ width: `${((activeStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
