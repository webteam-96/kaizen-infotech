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
// Phase boundaries — DESKTOP defaults. On compact/touch they are WIDENED inside
// the effect (local P1..P4) so the larger touch entrance reverses symmetrically.
// ---------------------------------------------------------------------------

const P1_DESKTOP = 0.10; // popup ends
const P2_DESKTOP = 0.25; // spread ends
const P3_BOUND   = 0.80; // carousel ends
const P4_BOUND   = 0.95; // fade-out ends

// Desktop card geometry. On phones / iPad-portrait (<820px) these shrink to a
// measured, viewport-fitted size (see the `metrics` state below) so the SAME
// spotlight carousel runs on small screens. The gap:width ratio (620 / 800 =
// 0.775) is preserved at every size, so spotlight spacing looks identical.
const DESKTOP_W   = 800;
// Height sized to the TALLEST card's content (icon+title+desc ≈ 699px) plus the
// p-14 padding (112px) ≈ 811px. Was 860 — that surplus left a large empty void
// at the bottom of every card (read as a stray panel). 820 fits the longest card
// snugly; shorter cards centre their content (ServiceCard `justify-center`) so the
// slack is split evenly top/bottom rather than dumped at the bottom.
const DESKTOP_H   = 820;
const DESKTOP_GAP = 620;
const GAP_RATIO   = DESKTOP_GAP / DESKTOP_W; // 0.775

// Largest compact card width (phones + ALL iPads). Kept small on purpose so the
// spotlight card never dominates a tablet — neighbours stay partly visible and
// the deck reads as a carousel, not a single billboard.
const COMPACT_MAX_W = 370;

// Compact width = this fraction of the viewport (capped at COMPACT_MAX_W).
const COMPACT_W_RATIO = 0.72;

// The deck is "desktop" (large 800×860 cards, pinned at half-scale) only on a
// genuine mouse + large screen. Every touch device — phones AND iPads, any
// orientation/width — gets the small compact cards. Capability, not width.
const DESKTOP_MEDIA = '(min-width: 1024px) and (hover: hover) and (pointer: fine)';

// ---------------------------------------------------------------------------
// ServicesScroll — pinned spotlight carousel, on EVERY device.
//
// The same scroll-scrubbed spotlight animation runs on desktop, iPad and phone.
// Touch smoothness is handled by (a) a capability-driven `compact` size so the
// cards are small and viewport-fitted, (b) NO per-frame box-shadow on compact
// (the worst per-frame repaint), (c) no transform CSS-transition on compact so
// the GSAP scrub is 1:1 crisp instead of rubber-banding, and (d) UI chrome
// (counter/dots) only written to the DOM when the active index changes.
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
  // LIVE metrics mirror. The carousel's render() and its scale setter read THIS
  // every frame — never the value captured in the useGSAP closure. The useState
  // default above is DESKTOP geometry (gap 620 / w 800), so on a touch device the
  // carousel's first setup runs with desktop metrics until measure() swaps in the
  // compact ones; if any closure (the desktop-seed trigger, or a re-sync race) is
  // still around on a scroll-direction reversal, reading `metrics` directly would
  // pan with the 620px gap and freeze cards at scale 0.5. Reading metricsRef.current
  // makes the geometry identical in both scroll directions.
  const metricsRef = useRef(metrics);

  useEffect(() => {
    const measure = () => {
      const vw = window.innerWidth;

      // Mouse + large screen: keep the exact original 800×860 desktop geometry.
      if (window.matchMedia(DESKTOP_MEDIA).matches) {
        const next = { w: DESKTOP_W, h: DESKTOP_H, gap: DESKTOP_GAP };
        metricsRef.current = next; // keep the live mirror in lock-step with state
        setMetrics((m) =>
          m.w === next.w && m.h === next.h && m.gap === next.gap ? m : next,
        );
        return;
      }

      // Every touch device (phones + all iPads): small, viewport-fitted card
      // with a proportional gap so the spotlight spacing matches desktop.
      const w   = Math.min(Math.round(vw * COMPACT_W_RATIO), COMPACT_MAX_W);
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

      const next = { w, h, gap };
      metricsRef.current = next; // keep the live mirror in lock-step with state
      setMetrics((m) => (m.w === w && m.h === h && m.gap === gap ? m : next));
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
      // Reduced motion: no pinned carousel at all — a static grid is rendered
      // instead (see below), so skip the entire scroll-scrubbed setup.
      if (prefersReducedMotion) return;
      if (!sectionRef.current || !deckRef.current) return;

      // Spotlight spacing is read LIVE inside render() (metricsRef.current.gap),
      // not captured here — see the metricsRef note above and the render() body.

      // Desktop metrics (800-wide) are only ever set for a mouse + large screen
      // (see `measure`), so `metrics.w === DESKTOP_W` IS the desktop view. This
      // captured value still drives the (untouched) POPUP_RISE / P1-P2 / scrub
      // setup; the per-frame SCALE decision instead reads metricsRef live (below).
      const desktopView = metrics.w === DESKTOP_W;
      const compact = !desktopView;
      const DESKTOP_CARD_SCALE = 0.5;

      // ── Phase boundaries (responsive) — THE entrance-symmetry fix ────────────
      // Phase 1 (0 → P1) on touch rises ~0.16×vh; crammed into a 10%-wide band it
      // cannot reverse symmetrically on scroll-up (it snaps away). Widen the popup
      // + spread bands on compact so the rise/fall has a comfortable scroll budget
      // BOTH ways. Phases 2/3/4 normalize against (P1,P2)/(P2,P3)/(P3,P4) already,
      // so widening here automatically rebalances the rest — no other math changes.
      const P1 = compact ? 0.20 : P1_DESKTOP;
      const P2 = compact ? 0.33 : P2_DESKTOP;
      const P3 = P3_BOUND;
      const P4 = P4_BOUND;

      // ── Compact (mobile + iPad) entrance distance ──────────────────────────
      // Desktop keeps its small 80px in-place hop. On touch the spotlight card
      // rises ~0.16×viewport (~120–135px) up to its centred resting position —
      // enough to read as "sliding up into view" while staying the SAME order of
      // magnitude as the other phases. It used to leap a FULL half-viewport, which
      // couldn't reverse symmetrically inside the narrow popup band — the entrance
      // snapped away on scroll-up. The smaller rise + widened P1 band fix that.
      // Derived from the live viewport so it scales to any phone/iPad.
      const POPUP_RISE = compact
        ? Math.round(window.innerHeight * 0.16)
        : 80;

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
          // Read the desktop-half-scale decision from the LIVE metrics ref every
          // frame (NOT the captured `desktopView`) so a stale/desktop-default
          // closure on scroll-up can't freeze touch cards at scale 0.5.
          scale:     (v: number) => { const s = metricsRef.current.w === DESKTOP_W ? DESKTOP_CARD_SCALE : v; sx(s); sy(s); },
          opacity:   gsap.quickSetter(card, 'opacity')        as (v: number) => void,
          // Per-frame box-shadow is the single most expensive op in the loop
          // (forces a full repaint every frame). On compact/touch it's a no-op —
          // the card keeps its own static shadow — so the scrub stays smooth.
          boxShadow: compact
            ? ((() => {}) as (v: string) => void)
            : (gsap.quickSetter(card, 'boxShadow') as (v: string) => void),
        };
      });

      // Force each card onto its own GPU compositor layer, which prevents
      // sub-pixel text shimmer at scale(0.5) during the popup phase.
      // GSAP owns the transform from the start (initial popup state: half-scale,
      // dropped 60px). This must be set here — not via a React inline `transform`
      // — so the per-frame quickSetters (incl. scale) can actually drive it.
      gsap.set(cards, { scale: 0.5, y: 60, z: 0, force3D: true });

      // ── DOM helpers (bypass React state for 60fps perf) ──────────────────

      // Counter + dots only change at integer index boundaries, but render runs
      // every frame. Guard the DOM writes so they fire once per index change
      // instead of 60×/s — fewer style recalcs, smoother scrub on touch.
      let lastCounterIdx = -2;
      function updateCounter(idx: number) {
        if (idx === lastCounterIdx) return;
        lastCounterIdx = idx;
        if (counterRef.current) {
          counterRef.current.textContent =
            `${String(idx + 1).padStart(2, '0')} / ${String(N).padStart(2, '0')}`;
        }
      }

      let lastDotsIdx = -2;
      function updateDots(idx: number) {
        if (idx === lastDotsIdx) return;
        lastDotsIdx = idx;
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
        // LIVE spotlight spacing — read every frame so a stale/desktop-default
        // closure on a scroll reversal can't pan with the 620px desktop gap.
        // Same single source of truth as the scale setter (metricsRef.current).
        const CARD_GAP = metricsRef.current.gap;
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
            s.y(prefersReducedMotion ? off.y : off.y + (1 - t) * POPUP_RISE);
            s.rotation(prefersReducedMotion ? 0 : off.r);
            // Compact starts near the carousel scale range (0.85→1) instead of
            // 0.5→1, so the entrance scale delta also matches the other phases.
            s.scale(prefersReducedMotion ? 1 : (compact ? 0.85 + t * 0.15 : 0.5 + t * 0.5));
            s.opacity(t);
            // Set visibility every phase (not just 2/3) so scrolling BACK UP into
            // this phase restores it — otherwise the after-branch's hidden state
            // sticks and the reverse animation is invisible until phase 3.
            card.style.visibility = 'visible';
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
            // Card 0 is the spotlight during the spread — keep it fully opaque.
            s.opacity(i === 0 ? 1 : 1 - t * 0.15);
            card.style.visibility = 'visible';
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

            // The nearest card is FORCED to a full opacity:1 target (not the
            // proxSmooth fraction). This guarantees the deck always settles with a
            // fully-readable card — fixing the measured "stuck at 0.72–0.92" end
            // states — regardless of where between centers the scroll comes to rest.
            const op    = i === idx ? 1 : 0.72 + proxSmooth * 0.28;
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
            card.style.visibility = 'visible';
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
            // visibility AND zIndex are set unconditionally every frame, purely
            // from progress — so coming back UP from the after-branch the fade-OUT
            // plays as a clean fade-IN (no hidden state sticking) and stacking is
            // identical to the forward pass at the same progress.
            card.style.visibility = 'visible';
            card.style.zIndex = String(i);
          });

          updateActiveIndex(N - 1);
          updateCounter(N - 1);
          updateDots(N - 1);
        }

        /* ═══════════════════════════════════════════
           AFTER — blank
           ═══════════════════════════════════════════ */
        else {
          cards.forEach((card, i) => {
            setters[i].opacity(0);
            // Hidden + a stable, progress-pure zIndex every frame — nothing from
            // the carousel/fade pass lingers to make the reverse path differ.
            card.style.visibility = 'hidden'; // autoAlpha-style safe hidden state
            card.style.zIndex = String(i);
          });
        }
      }

      // ── Scroll driver ─────────────────────────────────────────────────────────
      // render() maps progress → state PURELY: every per-frame write (transform,
      // opacity, visibility, zIndex, the freshly-derived active index) is a function
      // of progress alone and is set unconditionally in every branch — so forward and
      // reverse at the same progress are byte-identical. The only thing left that can
      // break the mirror is scrub CATCH-UP: a NUMERIC scrub renders a trailing
      // progress that keeps drifting the OLD way for ~scrub seconds after a reversal,
      // so the turnaround is inherently asymmetric.
      //
      // TOUCH → `scrub: true`: lock the render directly to the scroll position, zero
      // catch-up lag, so reverse is the exact mirror of forward. Lenis already smooths
      // the underlying scroll position, so motion stays fluid without a scrub tween.
      // (If iOS momentum ever makes this feel choppy, 0.12 is the fallback — the
      // per-frame purity above is the dominant fix either way.)
      // DESKTOP keeps its 0.3 ease — mouse-wheel deltas need a little bridging and
      // its feel is established; this path is intentionally untouched.
      const trigger = ScrollTrigger.create({
        trigger: section,
        start:   'top top',
        end:     'bottom bottom',
        scrub:   compact ? true : 0.3,
        invalidateOnRefresh: true,
        onUpdate:  (self) => render(self.progress),
        onRefresh: (self) => render(self.progress),
      });

      render(0);

      return () => {
        trigger.kill();
      };
    },
    { scope: sectionRef, dependencies: [prefersReducedMotion, metrics] },
  );

  // Touch devices (phones + all iPads) get the small compact card.
  const isCompactView = metrics.w !== DESKTOP_W;

  // CSS transition applied to each .deck-card → NONE on EVERY screen (desktop,
  // iPad, phone). Both transform AND opacity are driven purely by the GSAP scrub
  // (a function of scroll progress), so the animation is a perfect mirror image
  // to-and-fro. A time-based `transform 0.45s` / `opacity 0.3s` here makes the
  // rendered value lag the scrub-driven target; on a scroll-direction REVERSAL
  // the two desync and rubber-band — the "backward isn't as smooth as forward"
  // symptom. The quickSetters already write transform/opacity/box-shadow every
  // frame at 60fps, so removing the CSS easing causes no visual jump — it only
  // strips the asymmetric lag, making reverse identical to forward on all sizes.
  const deckCardTransition = 'none';

  // Reduced motion: a static, fully-visible grid of all services — no sticky, no
  // pinning, no fake scroll height, no scroll-scrubbed opacity. Every card rests
  // at opacity:1, so nothing can be skipped or left dim at any scroll speed.
  if (prefersReducedMotion) {
    return (
      <section data-section-index={2} className="section-light-aura seam-red px-[var(--container-padding)] py-24 md:py-32">
        <div className="mx-auto max-w-[var(--container-max)]">
          <div className="mb-12">
            <span
              className="text-[length:var(--h-eyebrow)] font-medium uppercase tracking-widest text-[var(--color-text-tertiary)]"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              Our Services
            </span>
            <h2 className="mt-1 font-display text-[length:var(--h-section)] tracking-tight text-[var(--color-text-primary)]">
              End-to-End Technology Services
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service, i) => (
              <ServiceCard
                key={service.id}
                icon={serviceIcons[i] || serviceIcons[0]}
                title={service.title}
                description={service.description}
                isActive
                compact
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <div data-section-index={2} className="seam-red">

      {/* Off-screen probe — measures the natural compact card height at the
          current width so the deck box is tall enough to avoid clipping. Kept
          rendered (off-screen + invisible, never display:none) so it can be
          measured at ANY touch width, including iPads ≥820px. Not measured on
          mouse-desktop (that branch returns the fixed 800×860 geometry). */}
      <div
        ref={probeRef}
        aria-hidden
        className="pointer-events-none invisible absolute left-[-9999px] top-0"
        style={{ width: metrics.w }}
      >
        {services.map((service, i) => (
          <div key={service.id}>
            <ServiceCard
              icon={serviceIcons[i] || serviceIcons[0]}
              title={service.title}
              description={service.description}
              isActive={false}
              /* Probe is read ONLY by the compact branch of measure() (desktop
                 early-returns before touching it), so it must ALWAYS render the
                 compact card. Tying it to `isCompactView` measured the big
                 non-compact card on first paint (isCompactView is false until
                 metrics update), sizing the touch deck box ~1234px tall and
                 clipping the card off-screen. Forcing compact fixes the height. */
              compact
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
        style={{ height: '400vh' }}
      >
        {/*
          perspective here creates the shared 3D vanishing point for all
          .deck-card children so GSAP rotation/scale look natural in 3D space.
        */}
        <div
          className="sticky top-0 flex h-screen items-center justify-center overflow-hidden section-light-aura"
          // Desktop keeps the shared 3D vanishing point; touch drops it — the
          // rotations are tiny, so 2D looks the same but avoids forcing a
          // preserve-3d compositing context for 5 layered cards every frame.
          style={isCompactView ? undefined : { perspective: '1200px', transformStyle: 'preserve-3d' }}
        >
          {/* Header */}
          <div className="absolute left-0 right-0 top-20 z-10 flex items-start justify-between px-[var(--container-padding)] min-[820px]:top-8">
            <div>
              <span
                className="text-[length:var(--h-eyebrow)] font-medium uppercase tracking-widest text-[var(--color-text-tertiary)]"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                Our Services
              </span>
              <h2 className="mt-1 font-display text-[length:var(--h-section)] tracking-tight text-[var(--color-text-primary)]">
                End-to-End Technology Services
              </h2>
            </div>
            <div className="flex flex-col items-end gap-1.5">
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
                  compact={isCompactView}
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

