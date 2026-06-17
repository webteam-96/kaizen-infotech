'use client';

import { useRef, useCallback } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, registerGSAPPlugins } from '@/lib/animations/gsap-setup';
import Link from 'next/link';
import { services } from '@/content/services';
import { cn } from '@/lib/utils/cn';

// ─────────────────────────────────────────────────────────────────────────────
// Layout constants
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

// The five cards reveal as TWO rows, one at a time, each centred in the
// viewport. Row 1 = first three cards, Row 2 = last two. Positions are the
// per-card X offset from centre when that row is the focused, centred row.
const ROW1_X = (i: number) => (i - 1) * (W + G);          // 3 cards: −(W+G), 0, +(W+G)
const ROW2_X = (i: number) => (i - 3 - 0.5) * (W + G);    // 2 cards: −½(W+G), +½(W+G)

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
// ServiceCardDeck
// ─────────────────────────────────────────────────────────────────────────────
export function ServiceCardDeck() {
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

    // Distance that pushes a card fully past the top/bottom edge of the viewport
    // (deck is centred), used to send a row off-screen / bring it back.
    const offY = (typeof window !== 'undefined' ? window.innerHeight : 900) / 2 + H / 2 + 48;

    // ── Initial state ─────────────────────────────────────────────────────────
    // Cards start invisible (opacity 0), scaled down, below their stack position.
    cards.forEach((card, i) => {
      const s = STACK[i];
      gsap.set(card, {
        x: s.x,
        y: s.y + 40,
        rotation: s.r,
        scale: 0.55,
        opacity: 0,
        zIndex: i + 1,
        transformOrigin: 'center center',
      });
    });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1.2,
      },
    });

    // ── Phase 1 (tl 0–1): the stack pops up at centre ───────────────────────
    cards.forEach((card, i) => {
      const s = STACK[i];
      tl.to(card, { opacity: 1, ease: 'power1.out', duration: 0.15 }, 0);
      tl.to(card, {
        x: s.x, y: s.y, rotation: s.r, scale: 1,
        ease: 'power2.inOut', duration: 1,
      }, 0);
    });
    if (glowRef.current) {
      tl.fromTo(glowRef.current,
        { opacity: 0.2 },
        { opacity: 0.8, duration: 1, ease: 'power2.inOut' }, 0);
    }

    // ── Phase 2 (tl 1–2): ROW 1 fans out (centred); ROW 2 drops DOWN ─────────
    // The first three cards spread into a centred horizontal row. The last two
    // slide straight down, off the bottom edge, waiting their turn.
    cards.forEach((card, i) => {
      if (i < 3) {
        tl.to(card, {
          x: ROW1_X(i), y: 0, rotation: 0, scale: 1, opacity: 1,
          ease: 'power3.inOut', duration: 1,
        }, 1 + i * 0.05);
      } else {
        tl.to(card, {
          x: 0, y: offY, rotation: 0, scale: 0.72, opacity: 1,
          ease: 'power2.inOut', duration: 1,
        }, 1);
      }
    });

    // ── Phase 3 (tl 2–3): ROW 1 exits UP; ROW 2 rises into the centred row ──
    cards.forEach((card, i) => {
      if (i < 3) {
        tl.to(card, {
          y: -offY, opacity: 0, ease: 'power2.inOut', duration: 1,
        }, 2);
      } else {
        tl.to(card, {
          x: ROW2_X(i), y: 0, rotation: 0, scale: 1, opacity: 1,
          ease: 'power3.inOut', duration: 1,
        }, 2 + (i - 3) * 0.06);
      }
    });

    // Glow keeps a soft presence through both reveals.
    if (glowRef.current) {
      tl.to(glowRef.current, { opacity: 0.45, scale: 1.25, duration: 1, ease: 'power2.inOut' }, 1);
      tl.to(glowRef.current, { opacity: 0.6, duration: 1, ease: 'power2.inOut' }, 2);
    }
  }, { scope: containerRef, dependencies: [] });

  // ── JSX ──────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Desktop: sticky deck animation (lg+) ─────────────────────────── */}
      <div
        ref={containerRef}
        className="relative hidden lg:block"
        style={{ height: '600vh' }}
      >
        <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden bg-[var(--color-bg-primary)]">

          {/* Ambient glow — brand accent */}
          <div
            ref={glowRef}
            aria-hidden
            className="pointer-events-none absolute rounded-full"
            style={{
              width: 500,
              height: 500,
              background: 'radial-gradient(circle, var(--color-glow), transparent 70%)',
              opacity: 0.2,
              filter: 'blur(40px)',
            }}
          />

          {/* Deck container */}
          <div style={{ position: 'relative', width: W, height: H }}>
            {services.map((service, i) => (
              <div
                key={service.id}
                ref={(el) => setCardRef(el, i)}
                style={{
                  position: 'absolute',
                  width: W,
                  height: H,
                  willChange: 'transform, opacity',
                  zIndex: i + 1,
                  opacity: 0,
                }}
                className={cn(
                  'flex flex-col rounded-[var(--radius-xl)] p-7',
                  'border border-[var(--color-border)]',
                  'bg-[var(--color-bg-secondary)]',
                  'shadow-[0_8px_32px_rgba(0,0,0,0.06),0_2px_8px_rgba(0,0,0,0.04)]',
                )}
              >
                {/* Icon */}
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-surface-glass)] text-[var(--color-accent-primary)]">
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
                    'text-[var(--color-text-tertiary)] transition-colors duration-200',
                    'hover:text-[var(--color-accent-primary)]',
                  )}
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  Learn more
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                    <path d="M4 10H16M16 10L11 5M16 10L11 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* ── Mobile / tablet: regular responsive grid (< lg) ──────────────── */}
      <div className="grid gap-5 px-6 pb-12 sm:grid-cols-2 md:px-12 lg:hidden">
        {services.map((service) => (
          <Link key={service.id} href={`/services/${service.slug}`} className="group block">
            <div
              className={cn(
                'relative flex h-full flex-col rounded-[var(--radius-lg)] p-7',
                'border border-[var(--color-border)] bg-[var(--color-bg-tertiary)]',
                'transition-all duration-300',
                'hover:border-[var(--color-border-hover)] hover:shadow-[0_0_40px_var(--color-glow)]',
                'hover:-translate-y-1.5',
              )}
            >
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-surface-glass)] text-[var(--color-accent-primary)] transition-transform duration-300 group-hover:scale-110">
                <ServiceIcon name={service.icon} />
              </div>
              <h3 className="mb-2 text-[length:var(--text-lg)] font-semibold text-[var(--color-text-primary)]" style={{ fontFamily: 'var(--font-card-heading), var(--font-heading)' }}>
                {service.title}
              </h3>
              <p className="mb-5 flex-1 text-[length:var(--text-sm)] leading-relaxed text-[var(--color-text-secondary)]" style={{ fontFamily: 'var(--font-body)' }}>
                {service.description}
              </p>
              <div className="flex items-center justify-between border-t border-[var(--color-border)] pt-4">
                <span className="text-[length:var(--text-xs)] font-medium uppercase tracking-wider text-[var(--color-text-tertiary)] transition-colors group-hover:text-[var(--color-accent-primary)]" style={{ fontFamily: 'var(--font-heading)' }}>
                  Learn more
                </span>
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none" className="text-[var(--color-text-tertiary)] transition-all group-hover:translate-x-1 group-hover:text-[var(--color-accent-primary)]">
                  <path d="M4 10H16M16 10L11 5M16 10L11 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
