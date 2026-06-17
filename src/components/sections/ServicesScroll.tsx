'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, registerGSAPPlugins, ScrollTrigger } from '@/lib/animations/gsap-setup';
import { useReducedMotion } from '@/hooks';
import { ServiceCard } from '@/components/ui/ServiceCard';
import { services } from '@/content/services';
import { cn } from '@/lib/utils/cn';

// ---------------------------------------------------------------------------
// Icon components
// ---------------------------------------------------------------------------

function CodeIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
    </svg>
  );
}
function SmartphoneIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="2" width="14" height="20" rx="2" ry="2" /><line x1="12" y1="18" x2="12.01" y2="18" />
    </svg>
  );
}
function CalendarIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}
function GlobeIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
    </svg>
  );
}
function TrendingUpIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
    </svg>
  );
}

const serviceIcons = [
  <CodeIcon key="code" />,
  <SmartphoneIcon key="phone" />,
  <CalendarIcon key="calendar" />,
  <GlobeIcon key="globe" />,
  <TrendingUpIcon key="trending" />,
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const clamp01 = gsap.utils.clamp(0, 1);

function smoothstep(t: number) {
  return t * t * (3 - 2 * t);
}

// Eases the carousel phase so cards decelerate into center rather than
// moving at constant speed relative to scroll input.
function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// ---------------------------------------------------------------------------
// Phase boundaries (unchanged from original)
// ---------------------------------------------------------------------------

const P1 = 0.10; // popup ends
const P2 = 0.25; // spread ends
const P3 = 0.80; // carousel ends
const P4 = 0.95; // fade-out ends

// Desktop card geometry. On phones / iPad-portrait (<820px) these shrink to a
// measured, viewport-fitted size (see the `metrics` state below) so the SAME
// spotlight carousel runs on small screens. The gap:width ratio (620 / 800 =
// 0.775) is preserved at every size, so spotlight spacing looks identical.
const DESKTOP_W   = 800;
const DESKTOP_H   = 860;
const DESKTOP_GAP = 620;
const GAP_RATIO   = DESKTOP_GAP / DESKTOP_W; // 0.775

// Largest card width we allow on a phone / iPad-portrait, so the deck never
// fills the whole viewport edge-to-edge on a big tablet held in portrait.
const COMPACT_MAX_W = 680;

// ---------------------------------------------------------------------------
// ServicesScroll
// ---------------------------------------------------------------------------

export function ServicesScroll() {
  const sectionRef  = useRef<HTMLElement>(null);
  const deckRef     = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const counterRef  = useRef<HTMLSpanElement>(null);
  const dotsRef     = useRef<HTMLDivElement>(null);
  const hintRef     = useRef<HTMLDivElement>(null);
  const probeRef    = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeIndexRef = useRef(0);

  // Responsive deck geometry. Desktop defaults; below 820px these are replaced
  // by a viewport-fitted width + a *measured* content height (so cards never
  // clip on a phone) + a proportional gap. The GSAP carousel re-inits whenever
  // `metrics` changes (resize / breakpoint cross) via its dependency array.
  const [metrics, setMetrics] = useState({ w: DESKTOP_W, h: DESKTOP_H, gap: DESKTOP_GAP });

  useEffect(() => {
    const measure = () => {
      const vw = window.innerWidth;

      // Desktop / tablet-landscape: pin to the exact original geometry so the
      // >=820px experience stays pixel-identical.
      if (vw >= 820) {
        setMetrics((m) =>
          m.w === DESKTOP_W && m.h === DESKTOP_H && m.gap === DESKTOP_GAP
            ? m
            : { w: DESKTOP_W, h: DESKTOP_H, gap: DESKTOP_GAP },
        );
        return;
      }

      // Phone / iPad-portrait: ~86% of the viewport (capped), proportional gap.
      const w   = Math.min(Math.round(vw * 0.86), COMPACT_MAX_W);
      const gap = Math.round(w * GAP_RATIO);

      // Measure the tallest card at this width from the off-screen probe so the
      // fixed deck box is tall enough for the longest description — no clipping.
      let h = Math.round(w * 1.25); // sensible fallback before the probe paints
      const probe = probeRef.current;
      if (probe) {
        probe.style.width = `${w}px`;
        let max = 0;
        for (let i = 0; i < probe.children.length; i++) {
          const ch = (probe.children[i] as HTMLElement).getBoundingClientRect().height;
          if (ch > max) max = ch;
        }
        if (max > 0) h = Math.ceil(max);
      }

      setMetrics((m) => (m.w === w && m.h === h && m.gap === gap ? m : { w, h, gap }));
    };

    measure();
    let raf = 0;
    const onResize = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(measure);
    };
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(raf);
    };
  }, []);

  const prefersReducedMotion = useReducedMotion();
  registerGSAPPlugins();

  useGSAP(
    () => {
      if (!sectionRef.current || !deckRef.current) return;

      // Responsive spotlight spacing. Desktop stays 620; phones & iPad-portrait
      // get the measured, viewport-fitted gap so the SAME carousel animation
      // runs at every width (re-inits via the `metrics` dependency on resize).
      const CARD_GAP = metrics.gap;

      // Only the TRUE desktop view (wide, landscape) is pinned at half-scale to
      // match its previous look, per request. Phones AND iPad-portrait keep the
      // full-size animated cards. iPad-portrait renders on the 800-wide desktop
      // deck (metrics.w === 800) yet must still animate, so detect it by
      // orientation and exclude it from the revert.
      const portraitTablet =
        window.innerWidth > 768 &&
        window.innerWidth <= 1024 &&
        window.matchMedia('(orientation: portrait)').matches;
      const desktopView = metrics.w === DESKTOP_W && !portraitTablet;
      const DESKTOP_CARD_SCALE = 0.5;

      const section = sectionRef.current;
      const deck    = deckRef.current;
      const cards   = gsap.utils.toArray<HTMLElement>('.deck-card', deck);
      const dots    = dotsRef.current
        ? gsap.utils.toArray<HTMLElement>('.deck-dot', dotsRef.current)
        : [];
      const N = cards.length;

      const stackOffsets = cards.map((_, i) => ({
        x: i * 4,
        y: -i * 6,
        r: -2 + i * 1,
      }));

      const setters = cards.map((card) => {
        // NB: the 'scale' shorthand quickSetter is a no-op here (x/y/rotation work,
        // but 'scale' never updates the transform — cards stayed pinned at 0.5).
        // Driving scaleX + scaleY directly works, so wrap them behind `scale(v)`.
        const sx = gsap.quickSetter(card, 'scaleX') as (v: number) => void;
        const sy = gsap.quickSetter(card, 'scaleY') as (v: number) => void;
        return {
          x:         gsap.quickSetter(card, 'x', 'px')       as (v: number) => void,
          y:         gsap.quickSetter(card, 'y', 'px')       as (v: number) => void,
          rotation:  gsap.quickSetter(card, 'rotation', 'deg') as (v: number) => void,
          // Phones + iPad-portrait animate scale (cards render full-size); the
          // true desktop view stays pinned at half-scale (its previous look).
          scale:     (v: number) => { const s = desktopView ? DESKTOP_CARD_SCALE : v; sx(s); sy(s); },
          opacity:   gsap.quickSetter(card, 'opacity')        as (v: number) => void,
          boxShadow: gsap.quickSetter(card, 'boxShadow')      as (v: string) => void,
        };
      });

      // Force each card onto its own GPU compositor layer, which prevents
      // sub-pixel text shimmer at scale(0.5) during the popup phase.
      // GSAP owns the transform from the start (initial popup state: half-scale,
      // dropped 60px). This must be set here — not via a React inline `transform`
      // — so the per-frame quickSetters (incl. scale) can actually drive it.
      gsap.set(cards, { scale: 0.5, y: 60, z: 0, force3D: true });

      // ── DOM helpers (bypass React state for 60fps perf) ──────────────────

      function updateCounter(idx: number) {
        if (counterRef.current) {
          counterRef.current.textContent =
            `${String(idx + 1).padStart(2, '0')} / ${String(N).padStart(2, '0')}`;
        }
      }

      function updateDots(idx: number) {
        dots.forEach((dot, i) => {
          dot.style.transform = i === idx ? 'scale(1.5)' : 'scale(1)';
          dot.style.backgroundColor =
            i === idx ? 'var(--color-accent-primary)' : 'var(--color-border)';
          dot.style.boxShadow = i === idx ? '0 0 8px var(--color-glow)' : 'none';
        });
      }

      function updateActiveIndex(idx: number) {
        if (activeIndexRef.current !== idx) {
          activeIndexRef.current = idx;
          setActiveIndex(idx);
        }
      }

      // Keyboard: focusing a card activates it (no scroll required).
      cards.forEach((card, i) => {
        card.addEventListener('focus', () => {
          updateActiveIndex(i);
          updateCounter(i);
          updateDots(i);
        });
      });

      const setProgress = progressRef.current
        ? (gsap.quickSetter(progressRef.current, 'scaleY') as (v: number) => void)
        : null;

      // ── Render: maps scroll progress → per-card transforms ────────────────

      function render(p: number) {
        setProgress?.(p);

        if (hintRef.current) {
          hintRef.current.style.opacity = p > 0.01 ? '0' : '1';
        }

        /* ═══════════════════════════════════════════
           PHASE 1 — POPUP  (0 → P1)
           Fade in + rise from below.
           Reduced motion: fade only, no scale/rise.
           ═══════════════════════════════════════════ */
        if (p <= P1) {
          const t = smoothstep(clamp01(p / P1));

          cards.forEach((card, i) => {
            const off = stackOffsets[i];
            const s   = setters[i];
            s.x(off.x);
            s.y(prefersReducedMotion ? off.y : off.y + (1 - t) * 80);
            s.rotation(prefersReducedMotion ? 0 : off.r);
            s.scale(prefersReducedMotion ? 1 : 0.5 + t * 0.5);
            s.opacity(t);
            card.style.zIndex = String(i);
          });

          updateActiveIndex(0);
          updateCounter(0);
          updateDots(-1);
        }

        /* ═══════════════════════════════════════════
           PHASE 2 — SPREAD TO LINE  (P1 → P2)
           Stack → horizontal row, card 0 at center.
           Reduced motion: skip rotation.
           ═══════════════════════════════════════════ */
        else if (p <= P2) {
          const t = smoothstep(clamp01((p - P1) / (P2 - P1)));

          cards.forEach((card, i) => {
            const off   = stackOffsets[i];
            const lineX = i * CARD_GAP;
            const s     = setters[i];
            s.x(off.x + (lineX - off.x) * t);
            s.y(off.y * (1 - t));
            s.rotation(prefersReducedMotion ? 0 : off.r * (1 - t));
            s.scale(prefersReducedMotion ? 1 : 1 - t * 0.15);
            s.opacity(1 - t * 0.15);
            card.style.zIndex = String(i);
          });

          updateActiveIndex(0);
          updateCounter(0);
          updateDots(0);
        }

        /* ═══════════════════════════════════════════
           PHASE 3 — CAROUSEL SPOTLIGHT  (P2 → P3)
           Row shifts left; active card spotlighted.
           easeInOutCubic wraps t so cards decelerate
           into the spotlight position.
           Reduced motion: minimal scale delta (0.97–1).
           Inactive opacity raised to 0.72 for legibility.
           ═══════════════════════════════════════════ */
        else if (p <= P3) {
          const raw  = clamp01((p - P2) / (P3 - P2));
          const t    = prefersReducedMotion ? raw : easeInOutCubic(raw);
          const rowShift   = -t * (N - 1) * CARD_GAP;
          const focusFloat = t * (N - 1);
          const idx        = Math.round(focusFloat);

          cards.forEach((card, i) => {
            const baseX      = i * CARD_GAP + rowShift;
            const dist       = Math.abs(i - focusFloat);
            const prox       = Math.max(0, 1 - dist);
            const proxSmooth = smoothstep(prox);

            const sc = prefersReducedMotion
              ? 0.97 + proxSmooth * 0.03           // subtle: 0.97 → 1.00
              : 0.90 + proxSmooth * 0.15;           // standard: 0.90 → 1.05

            const op    = 0.72 + proxSmooth * 0.28; // inactive 0.72, active 1.0
            const yLift = prefersReducedMotion ? 0 : -proxSmooth * 24;

            const shadowBlur  = 12 + proxSmooth * 28;
            const shadowAlpha = 0.06 + proxSmooth * 0.12;
            const shadow = `0 ${4 + proxSmooth * 8}px ${shadowBlur}px rgba(0,0,0,${shadowAlpha.toFixed(3)})`;

            const s = setters[i];
            s.x(baseX);
            s.y(yLift);
            s.rotation(0);
            s.scale(sc);
            s.opacity(op);
            s.boxShadow(shadow);
            card.style.zIndex = String(Math.round(proxSmooth * 10));
          });

          updateActiveIndex(idx);
          updateCounter(idx);
          updateDots(idx);
        }

        /* ═══════════════════════════════════════════
           PHASE 4 — FADE OUT  (P3 → P4)
           Cards drift away and scale down.
           ═══════════════════════════════════════════ */
        else if (p <= P4) {
          const t         = smoothstep(clamp01((p - P3) / (P4 - P3)));
          const rowShiftEnd = -(N - 1) * CARD_GAP;

          cards.forEach((card, i) => {
            const baseX       = i * CARD_GAP + rowShiftEnd;
            const distFromLast = Math.abs(i - (N - 1));
            const fadeDelay   = distFromLast * 0.1;
            const cardT       = clamp01((t - fadeDelay) / (1 - fadeDelay));
            const cardTSmooth = smoothstep(cardT);

            const driftDir = i - (N - 1);
            const driftX   = driftDir * cardTSmooth * 150;
            const isLast   = i === N - 1;

            const s = setters[i];
            s.x(baseX + driftX);
            s.y(cardTSmooth * 50);
            s.scale(Math.max(0.2, (isLast ? 1.0 : 0.75) * (1 - cardTSmooth * 0.5)));
            s.opacity(Math.max(0, (isLast ? 1 : 0.3) * (1 - cardTSmooth)));
            s.boxShadow(`0 4px 12px rgba(0,0,0,${(0.08 * (1 - cardTSmooth)).toFixed(3)})`);
          });

          updateActiveIndex(N - 1);
          updateCounter(N - 1);
          updateDots(N - 1);
        }

        /* ═══════════════════════════════════════════
           AFTER — blank
           ═══════════════════════════════════════════ */
        else {
          setters.forEach((s) => s.opacity(0));
        }
      }

      // scrub: true = progress tied exactly to scroll position; the CSS
      // transition on each .deck-card (0.45s easeOutQuint) provides all
      // visual smoothing without adding GSAP's own lag on top.
      ScrollTrigger.create({
        trigger: section,
        start:   'top top',
        end:     'bottom bottom',
        scrub:   true,
        onUpdate: (self) => render(self.progress),
      });

      render(0);
    },
    { scope: sectionRef, dependencies: [prefersReducedMotion, metrics] },
  );

  // CSS transition applied to each .deck-card.
  // Reduced motion: transform transition removed, only opacity fades.
  const deckCardTransition = prefersReducedMotion
    ? 'opacity 0.3s ease'
    : 'transform 0.45s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.3s ease';

  return (
    <div data-section-index={2}>

      {/* Off-screen probe — measures the natural card height at the current
          mobile width so the pinned deck box is tall enough to avoid clipping.
          Hidden on desktop (where geometry is the fixed 800×860). */}
      <div
        ref={probeRef}
        aria-hidden
        className="pointer-events-none invisible absolute left-[-9999px] top-0 min-[820px]:hidden"
        style={{ width: metrics.w }}
      >
        {services.map((service, i) => (
          <div key={service.id}>
            <ServiceCard
              icon={serviceIcons[i] || serviceIcons[0]}
              title={service.title}
              description={service.description}
              isActive={false}
            />
          </div>
        ))}
      </div>

      {/* ── Pinned spotlight carousel — runs at EVERY width ───── */}
      {/* Desktop keeps 800×860/620; phones & iPad-portrait use the measured,
          viewport-fitted `metrics` so the identical animation fits the screen. */}
      <section
        ref={sectionRef}
        className="relative block"
        style={{ height: '600vh' }}
      >
        {/*
          perspective here creates the shared 3D vanishing point for all
          .deck-card children so GSAP rotation/scale look natural in 3D space.
        */}
        <div
          className="sticky top-0 flex h-screen items-center justify-center overflow-hidden bg-[var(--color-bg-primary)]"
          style={{ perspective: '1200px', transformStyle: 'preserve-3d' }}
        >
          {/* Header */}
          <div className="absolute left-0 right-0 top-20 z-10 flex items-start justify-between px-[var(--container-padding)] min-[820px]:top-8">
            <div>
              <div className="flex items-baseline gap-4">
                <span
                  className="text-xs font-medium uppercase tracking-widest text-[var(--color-text-tertiary)]"
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  Our Services
                </span>
                <span
                  className="text-xs text-[var(--color-accent-primary)]"
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  01
                </span>
              </div>
              <h2 className="mt-1 font-display text-lg tracking-tight text-[var(--color-text-primary)] xl:text-xl">
                End-to-End Technology Services
              </h2>
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <span
                ref={counterRef}
                className="text-xs text-[var(--color-text-tertiary)]"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                01 / {String(services.length).padStart(2, '0')}
              </span>
              <Link
                href="/services"
                className="focus-ring text-sm font-medium text-[var(--color-accent-primary)] transition-colors hover:text-[var(--color-text-primary)]"
              >
                View All Services →
              </Link>
            </div>
          </div>

          {/* Deck — sized to one card so GSAP transforms are centred */}
          <div
            ref={deckRef}
            className="relative"
            style={{ width: metrics.w, height: metrics.h }}
          >
            {services.map((service, i) => (
              <div
                key={service.id}
                className={cn(
                  'deck-card absolute inset-0',
                  'rounded-[var(--radius-lg)]',
                  // Visible focus ring for keyboard navigation
                  'outline-none focus-visible:ring-4',
                  'focus-visible:ring-[var(--color-accent-primary)]',
                  'focus-visible:ring-offset-2',
                )}
                tabIndex={0}
                role="article"
                aria-label={`${service.title}: ${service.description.slice(0, 80)}`}
                style={{
                  opacity:            0,
                  // Initial transform is set by GSAP (gsap.set below), NOT here.
                  // Keeping a `transform` string in React's inline style made React
                  // own the property, which left GSAP's per-frame `scale` quickSetter
                  // unable to update it — the cards stayed pinned at scale(0.5).
                  transformOrigin:    'center center',
                  transition:         deckCardTransition,
                  willChange:         'transform, opacity',
                  backfaceVisibility: 'hidden',
                }}
              >
                <ServiceCard
                  icon={serviceIcons[i] || serviceIcons[0]}
                  title={service.title}
                  description={service.description}
                  isActive={i === activeIndex}
                />
              </div>
            ))}
          </div>

          {/* Dots indicator */}
          <div
            ref={dotsRef}
            className="absolute bottom-20 left-1/2 z-10 flex -translate-x-1/2 gap-3"
          >
            {services.map((_, i) => (
              <div
                key={i}
                className="deck-dot h-2 w-2 rounded-full"
                style={{
                  backgroundColor: 'var(--color-border)',
                  transition: 'transform 0.3s, background-color 0.3s, box-shadow 0.3s',
                }}
              />
            ))}
          </div>

          {/* Scroll hint */}
          <div
            ref={hintRef}
            className="absolute bottom-8 z-10 flex flex-col items-center gap-1.5"
            style={{ transition: 'opacity 0.4s ease' }}
          >
            <span
              className="text-[10px] uppercase tracking-[3px] text-[var(--color-text-tertiary)]"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              Scroll
            </span>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              className="animate-bounce text-[var(--color-text-tertiary)]"
            >
              <path
                d="M12 5v14M5 12l7 7 7-7"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      </section>
    </div>
  );
}
