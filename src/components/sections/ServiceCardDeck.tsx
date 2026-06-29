'use client';

import { useRef, useCallback, useState, useEffect } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, registerGSAPPlugins, ScrollTrigger } from '@/lib/animations/gsap-setup';
import Link from 'next/link';
import { services } from '@/content/services';
import { cn } from '@/lib/utils/cn';

// ─────────────────────────────────────────────────────────────────────────────
// Layout constants (desktop deck)
// ─────────────────────────────────────────────────────────────────────────────
const W = 320;   // card width  (px) — 3-card row = 1016px, fits 1024 with no horizontal clip
const H = 590;   // card height (px) — uniform, sized to the LONGEST card's content (≈574px) + margin
const G = 28;    // gap between cards within a row (px)

// Stack offsets — matches reference animation
const STACK: { x: number; y: number; r: number }[] = [
  { x: 0,  y: 0,   r: -3   },
  { x: 2,  y: -3,  r: -1.5 },
  { x: 4,  y: -6,  r: 0    },
  { x: 6,  y: -9,  r: 1.5  },
  { x: 8,  y: -12, r: 3    },
];

// ─────────────────────────────────────────────────────────────────────────────
// Icon components
// ─────────────────────────────────────────────────────────────────────────────
function ServiceIcon({ name }: { name: string }) {
  const p = {
    width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none',
    stroke: 'currentColor', strokeWidth: 1.5,
    strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const,
  };
  switch (name) {
    case 'Code':
      return <svg {...p}><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>;
    case 'Smartphone':
      return <svg {...p}><rect x="5" y="2" width="14" height="20" rx="2" /><line x1="12" y1="18" x2="12.01" y2="18" /></svg>;
    case 'Calendar':
      return <svg {...p}><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>;
    case 'Globe':
      return <svg {...p}><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" /></svg>;
    case 'TrendingUp':
      return <svg {...p}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>;
    default:
      return <svg {...p}><circle cx="12" cy="12" r="10" /></svg>;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared card chrome — one source of truth for the deck card on desktop, the
// touch deck, AND the offscreen height-probe, so all three measure/animate the
// exact same box.
// ─────────────────────────────────────────────────────────────────────────────
const CARD_CLASS = cn(
  'card-red-accent overflow-hidden',
  'flex flex-col rounded-[var(--radius-xl)] p-7',
  'border border-[var(--color-border)]',
  'bg-[var(--color-bg-secondary)]',
  'shadow-[0_8px_32px_rgba(0,0,0,0.06),0_2px_8px_rgba(0,0,0,0.04)]',
);

function CardFace({ service }: { service: (typeof services)[number] }) {
  return (
    <>
      {/* Icon */}
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-[var(--radius-md)] bg-[var(--red-soft)] text-[var(--red-brand)]">
        <ServiceIcon name={service.icon} />
      </div>

      {/* Title */}
      <h3
        className="mb-3 text-[length:var(--text-lg)] font-semibold leading-snug text-[var(--color-text-primary)]"
        style={{ fontFamily: 'var(--font-card-heading), var(--font-heading)' }}
      >
        {service.title}
      </h3>

      {/* Description — full copy (no clamp); card height fits it */}
      <p
        className="mb-5 flex-1 text-[length:var(--text-base)] leading-relaxed text-[var(--color-text-secondary)]"
        style={{ fontFamily: 'var(--font-body)' }}
      >
        {service.description}
      </p>

      {/* Learn more */}
      <Link
        href={`/services/${service.slug}`}
        className={cn(
          'flex items-center justify-between',
          'border-t border-[var(--color-border)] pt-4',
          'text-[length:var(--text-sm)] font-medium uppercase tracking-wider',
          'text-[var(--color-accent-secondary)] transition-colors duration-200',
          'hover:text-[var(--color-accent-primary)]',
        )}
        style={{ fontFamily: 'var(--font-heading)' }}
      >
        Learn more
        <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
          <path d="M4 10H16M16 10L11 5M16 10L11 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </Link>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Desktop deck — pointer/wheel-driven scroll-scrub reveal (mouse, ≥1024px only)
// ─────────────────────────────────────────────────────────────────────────────
// Row X positions when a row is the focused, centred row.
const ROW1_X = (i: number) => (i - 1) * (W + G);          // 3 cards: −(W+G), 0, +(W+G)
const ROW2_X = (i: number) => (i - 3 - 0.5) * (W + G);    // 2 cards: −½(W+G), +½(W+G)

function ServiceDeck() {
  const containerRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  registerGSAPPlugins();

  const setCardRef = useCallback((el: HTMLDivElement | null, i: number) => {
    cardRefs.current[i] = el;
  }, []);

  useGSAP(() => {
    if (!containerRef.current) return;
    const cards = cardRefs.current.filter(Boolean) as HTMLDivElement[];
    if (cards.length === 0) return;

    const offY = (typeof window !== 'undefined' ? window.innerHeight : 900) / 2 + H / 2 + 48;

    cards.forEach((card, i) => {
      const s = STACK[i];
      gsap.set(card, {
        x: s.x, y: s.y + 40, rotation: s.r, scale: 0.55, opacity: 0,
        zIndex: cards.length - i, transformOrigin: 'center center',
      });
    });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.5,
        invalidateOnRefresh: true,
      },
    });

    // Phase 1 — stack pops up at centre
    cards.forEach((card, i) => {
      const s = STACK[i];
      tl.to(card, { opacity: 1, ease: 'power1.out', duration: 0.15 }, 0);
      tl.to(card, { x: s.x, y: s.y, rotation: s.r, scale: 1, ease: 'power2.inOut', duration: 1 }, 0);
    });
    if (glowRef.current) {
      tl.fromTo(glowRef.current, { opacity: 0.2 }, { opacity: 0.8, duration: 1, ease: 'power2.inOut' }, 0);
    }

    // Phase 2 — ROW 1 fans out (centred); ROW 2 drops DOWN
    cards.forEach((card, i) => {
      if (i < 3) {
        tl.to(card, { x: ROW1_X(i), y: 0, rotation: 0, scale: 1, opacity: 1, ease: 'power3.inOut', duration: 1 }, 1 + i * 0.05);
      } else {
        tl.to(card, { x: 0, y: offY, rotation: 0, scale: 0.72, opacity: 1, ease: 'power2.inOut', duration: 1 }, 1);
      }
    });

    // Phase 3 — ROW 1 exits UP; ROW 2 rises into the centred row
    cards.forEach((card, i) => {
      if (i < 3) {
        tl.to(card, { y: -offY, opacity: 0, ease: 'power2.inOut', duration: 1 }, 2);
      } else {
        tl.to(card, { x: ROW2_X(i), y: 0, rotation: 0, scale: 1, opacity: 1, ease: 'power3.inOut', duration: 1 }, 2 + (i - 3) * 0.06);
      }
    });

    if (glowRef.current) {
      tl.to(glowRef.current, { opacity: 0.45, scale: 1.25, duration: 1, ease: 'power2.inOut' }, 1);
      tl.to(glowRef.current, { opacity: 0.6, duration: 1, ease: 'power2.inOut' }, 2);
    }
  }, { scope: containerRef, dependencies: [] });

  return (
    <div ref={containerRef} className="relative" style={{ height: '600vh' }}>
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden">
        <div
          ref={glowRef}
          aria-hidden
          className="pointer-events-none absolute rounded-full"
          style={{ width: 500, height: 500, background: 'radial-gradient(circle, var(--color-glow), transparent 70%)', opacity: 0.2, filter: 'blur(40px)' }}
        />
        <div style={{ position: 'relative', width: W, height: H }}>
          {services.map((service, i) => (
            <div
              key={service.id}
              ref={(el) => setCardRef(el, i)}
              style={{ position: 'absolute', width: W, height: H, willChange: 'transform, opacity', zIndex: services.length - i, opacity: 0 }}
              className={CARD_CLASS}
            >
              <CardFace service={service} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Touch deck — HORIZONTAL TRAVEL carousel (phones + ALL iPads).
//
// The cards are kept at a STANDARD, readable size (most of the phone width; ~half
// an iPad) — never shrunk to cram three across — so the copy is legible for every
// age group. The section pins, and vertical scroll TRANSLATES the row sideways:
// each card glides through the centre one at a time (with a gentle focus
// scale/opacity), so scrolling down pans 1 → 5 and scrolling up pans 5 → 1.
//
// render(progress) writes every value (track x, per-card scale/opacity) purely
// from progress, and `scrub: true` locks it to the Lenis-smoothed scroll position
// with zero catch-up — so the reverse pan is the exact mirror of the forward pan.
// Card heights come from an offscreen probe so long descriptions never clip.
// ─────────────────────────────────────────────────────────────────────────────
function ServiceDeckTouch() {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const probeRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [m, setM] = useState({ w: 320, h: 480, g: 16, ready: false });

  registerGSAPPlugins();

  const setCardRef = useCallback((el: HTMLDivElement | null, i: number) => {
    cardRefs.current[i] = el;
  }, []);

  // ── Responsive geometry — a STANDARD readable card, not a shrunk-to-fit one ──
  useEffect(() => {
    const GAP = 16;
    const measure = () => {
      const vw = window.innerWidth;
      // Phone: ~82% of the width (one big readable card, neighbours peek at the
      // edges). iPad: ~52% (about two visible). Capped so it never gets unwieldy.
      const frac = vw < 768 ? 0.82 : 0.52;
      const w = Math.min(460, Math.round(vw * frac));

      // Measure the TALLEST card's natural height at this width from the probe so
      // the fixed card box never clips a long description.
      let h = Math.round(w * 1.4); // sensible fallback before the probe paints
      const probe = probeRef.current;
      if (probe) {
        probe.style.width = `${w}px`;
        let max = 0;
        Array.from(probe.children).forEach((ch) => {
          const hh = (ch as HTMLElement).getBoundingClientRect().height;
          if (hh > max) max = hh;
        });
        if (max > 0) h = Math.ceil(max);
      }

      setM((p) => (p.w === w && p.h === h && p.ready ? p : { w, h, g: GAP, ready: true }));
    };

    measure();
    let raf = 0;
    const onResize = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(measure); };
    window.addEventListener('resize', onResize);
    return () => { window.removeEventListener('resize', onResize); cancelAnimationFrame(raf); };
  }, []);

  // ── Scroll-driven horizontal pan ───────────────────────────────────────────
  useGSAP(() => {
    if (!m.ready || !containerRef.current || !trackRef.current) return;
    const cards = cardRefs.current.filter(Boolean) as HTMLDivElement[];
    if (cards.length === 0) return;

    const N = cards.length;
    const step = m.w + m.g;
    const vw = window.innerWidth;
    // x that centres card 0 at progress 0; each unit of progress pans one step.
    const startX = vw / 2 - m.w / 2;
    const totalShift = (N - 1) * step;

    const trackX = gsap.quickSetter(trackRef.current, 'x', 'px') as (v: number) => void;
    const setters = cards.map((card) => {
      const sx = gsap.quickSetter(card, 'scaleX') as (v: number) => void;
      const sy = gsap.quickSetter(card, 'scaleY') as (v: number) => void;
      return {
        scale: (v: number) => { sx(v); sy(v); },
        opacity: gsap.quickSetter(card, 'opacity') as (v: number) => void,
      };
    });

    gsap.set(cards, { transformOrigin: 'center center', force3D: true });
    gsap.set(trackRef.current, { x: startX });

    // Pure function of progress → mirror-symmetric forward/reverse.
    function render(p: number) {
      trackX(startX - p * totalShift);
      const focus = p * (N - 1); // which card is centred (float)
      for (let i = 0; i < N; i++) {
        const prox = Math.max(0, 1 - Math.abs(i - focus)); // 1 at centre → 0 a card away
        const e = prox * prox * (3 - 2 * prox);            // smoothstep
        setters[i].scale(0.92 + 0.08 * e);                 // 0.92 → 1.0
        setters[i].opacity(0.5 + 0.5 * e);                 // 0.5 → 1.0 (centre fully readable)
      }
    }

    ScrollTrigger.create({
      trigger: containerRef.current,
      start: 'top top',
      end: 'bottom bottom',
      // Lock render directly to the Lenis-smoothed scroll position: zero catch-up,
      // so the reverse pan mirrors the forward pan exactly.
      scrub: true,
      invalidateOnRefresh: true,
      onUpdate: (self) => render(self.progress),
      onRefresh: (self) => render(self.progress),
    });

    render(0);
  }, { scope: containerRef, dependencies: [m.ready, m.w, m.h, m.g] });

  // Comfortable pan speed: the pinned scroll distance (~2.6× viewport) is a bit
  // longer than the horizontal travel, so cards glide slowly enough to read.
  const sectionVh = 360;

  return (
    <>
      {/* Offscreen probe — natural card height at the current width. */}
      <div
        ref={probeRef}
        aria-hidden
        className="pointer-events-none invisible absolute left-[-9999px] top-0"
        style={{ width: m.w }}
      >
        {services.map((service) => (
          <div key={service.id} className={CARD_CLASS}>
            <CardFace service={service} />
          </div>
        ))}
      </div>

      <div ref={containerRef} className="relative" style={{ height: `${sectionVh}vh` }}>
        <div className="sticky top-0 flex h-screen items-center overflow-hidden">
          {/* Light STATIC glow centred behind the focused card. */}
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{ width: 420, height: 420, background: 'radial-gradient(circle, var(--color-glow), transparent 70%)', opacity: 0.3, filter: 'blur(28px)' }}
          />
          {/* Horizontal track — GSAP translates this on scroll. */}
          <div ref={trackRef} className="relative flex items-center" style={{ gap: `${m.g}px`, willChange: 'transform' }}>
            {services.map((service, i) => (
              <div
                key={service.id}
                ref={(el) => setCardRef(el, i)}
                style={{ width: m.w, height: m.h, flex: '0 0 auto', willChange: 'transform, opacity' }}
                className={CARD_CLASS}
              >
                <CardFace service={service} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ServiceCardDeck — picks the experience by device capability.
//   • mouse-capable large screen → the original desktop scroll-scrub deck
//   • everything touch (phones, all iPads) → a horizontal-travel carousel of
//     standard, readable cards (vertical scroll pans the row sideways)
// SSR renders the touch deck; desktop swaps to its deck after mount (the section
// sits far below the fold, so the swap is never visible).
// ─────────────────────────────────────────────────────────────────────────────
export function ServiceCardDeck() {
  const [deckMode, setDeckMode] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px) and (hover: hover) and (pointer: fine)');
    const apply = () => setDeckMode(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  return deckMode ? <ServiceDeck /> : <ServiceDeckTouch />;
}
