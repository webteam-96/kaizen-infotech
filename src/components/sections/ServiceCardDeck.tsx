'use client';

import { useRef, useCallback } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, ScrollTrigger, registerGSAPPlugins } from '@/lib/animations/gsap-setup';
import Link from 'next/link';
import { services } from '@/content/services';
import { cn } from '@/lib/utils/cn';

// ─────────────────────────────────────────────────────────────────────────────
// Layout constants
// ─────────────────────────────────────────────────────────────────────────────
const W = 280;   // card width  (px)
const H = 380;   // card height (px)
const G = 20;    // grid gap    (px)

// Each card starts here (stacked, offset by a few px for a "deck" look)
const STACK: { x: number; y: number; r: number }[] = [
  { x: 0,  y: 0,   r: -4   },
  { x: 3,  y: -4,  r: -2   },
  { x: 6,  y: -8,  r: 0    },
  { x: 9,  y: -12, r: 2    },
  { x: 12, y: -16, r: 4    },
];

// Final grid: 3 top + 2 bottom, centered around the deck origin
// x, y are pixel offsets from the card's starting position (top-left of deck div)
const GRID: { x: number; y: number }[] = [
  { x: -(W + G),       y: -(H / 2 + G / 2) }, // top-left
  { x: 0,              y: -(H / 2 + G / 2) }, // top-center
  { x:  (W + G),       y: -(H / 2 + G / 2) }, // top-right
  { x: -(W / 2 + G / 2), y:  (H / 2 + G / 2) }, // bottom-left
  { x:  (W / 2 + G / 2), y:  (H / 2 + G / 2) }, // bottom-right
];

// ─────────────────────────────────────────────────────────────────────────────
// Icon components (matching services/page.tsx icon set)
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
  const hintRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  registerGSAPPlugins();

  const setCardRef = useCallback((el: HTMLDivElement | null, i: number) => {
    cardRefs.current[i] = el;
  }, []);

  useGSAP(() => {
    if (!containerRef.current) return;
    const cards = cardRefs.current.filter(Boolean) as HTMLDivElement[];
    if (cards.length === 0) return;

    // ── Initial state: all cards hidden below stack, flat, scaled down ───────
    // z-index set here so card 4 (top of pile) renders above cards 0-3.
    // opacity: 0 for all — no ghosting from stacked semi-transparent cards.
    cards.forEach((card, i) => {
      const s = STACK[i];
      gsap.set(card, {
        x: s.x,
        y: s.y + 70,   // start 70px below, will rise into stack in Phase 1
        rotation: 0,   // start flat; Phase 1 tilts each card to its stack angle
        scale: 0.6,
        opacity: 0,
        zIndex: i + 1, // card 4 = z:5 (top of pile), card 0 = z:1 (bottom)
        transformOrigin: 'center center',
      });
    });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1,
        onUpdate(self) {
          if (hintRef.current) {
            hintRef.current.style.opacity = self.progress > 0.02 ? '0' : '1';
          }
        },
      },
    });

    // ── Phase 1 (tl 0–1.2): deck rises from below ────────────────────────────
    // Cards stagger in bottom-first so the deck assembles visually.
    // Graduated opacity: back cards barely visible (0.2), top card solid (0.9).
    // With z-index, the top card covers the lower ones — only their small
    // peeking edges show through at low opacity. No ghosting.
    cards.forEach((card, i) => {
      const s = STACK[i];
      const stackOpacity = 0.2 + (i / (cards.length - 1)) * 0.7; // 0.2 → 0.9
      tl.to(card, {
        x: s.x, y: s.y,
        rotation: s.r,
        scale: 1,
        opacity: stackOpacity,
        ease: 'power3.out',
        duration: 1,
      }, i * 0.06); // card 0 at t=0, card 4 at t=0.24 — assembles bottom→top
    });

    // ── Phase 2 (tl ~1.5–3.2): deal from top of pile outward ────────────────
    // Top card (card 4, highest z-index, most visible) deals FIRST.
    // As each card leaves, the one below it is revealed and deals next.
    // This mirrors how you'd physically deal from a real card deck.
    cards.forEach((card, i) => {
      const g = GRID[i];
      const startAt = 1.5 + (cards.length - 1 - i) * 0.15; // card 4 at 1.5, card 0 at 2.1
      tl.to(card, {
        x: g.x, y: g.y,
        rotation: 0,
        scale: 0.95,
        opacity: 1,
        ease: 'power3.inOut',
        duration: 1.5,
      }, startAt);
    });
  }, { scope: containerRef, dependencies: [] });

  // ── JSX ──────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Desktop: sticky deck animation (lg+) ─────────────────────────── */}
      <div
        ref={containerRef}
        className="relative hidden lg:block"
        style={{ height: '360vh' }}
      >
        <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden bg-[var(--color-bg-primary)]">

          {/* Subtle ambient glow behind the deck */}
          <div
            aria-hidden
            className="pointer-events-none absolute h-[600px] w-[600px] rounded-full opacity-40"
            style={{
              background: 'radial-gradient(circle, rgba(33,150,243,0.08), transparent 70%)',
              filter: 'blur(60px)',
            }}
          />

          {/* Deck: same dimensions as one card; cards are abs positioned from its top-left */}
          <div style={{ position: 'relative', width: W, height: H }}>
            {services.map((service, i) => (
              <div
                key={service.id}
                ref={(el) => setCardRef(el, i)}
                style={{
                  position: 'absolute',
                  width: W,
                  height: H,
                  borderRadius: 'var(--radius-xl)',
                  willChange: 'transform, opacity',
                  zIndex: i + 1,
                  opacity: 0,           // hidden until GSAP Phase 1 runs
                }}
                className={cn(
                  'flex flex-col p-5',
                  'border border-[var(--color-border)]',
                  'bg-[var(--color-bg-secondary)]',
                  'shadow-[0_12px_40px_rgba(0,0,0,0.10),0_4px_12px_rgba(0,0,0,0.06)]',
                )}
              >
                {/* Icon */}
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-surface-glass)] text-[var(--color-accent-primary)]">
                  <ServiceIcon name={service.icon} />
                </div>

                {/* Title */}
                <h3
                  className="mb-2.5 line-clamp-2 text-[length:var(--text-base)] font-semibold leading-snug text-[var(--color-text-primary)]"
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  {service.title}
                </h3>

                {/* Description */}
                <p
                  className="mb-4 line-clamp-3 flex-1 text-[length:var(--text-sm)] leading-relaxed text-[var(--color-text-secondary)]"
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  {service.description}
                </p>

                {/* Tech tags */}
                <div className="mb-4 flex flex-wrap gap-1.5">
                  {service.technologies.slice(0, 3).map((tech) => (
                    <span
                      key={tech}
                      className={cn(
                        'inline-block rounded-[var(--radius-full)] px-2.5 py-0.5',
                        'border border-[var(--color-border)] bg-[var(--color-surface-glass)]',
                        'text-[length:var(--text-xs)] text-[var(--color-text-tertiary)]',
                      )}
                      style={{ fontFamily: 'var(--font-mono)' }}
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                {/* Learn more */}
                <Link
                  href={`/services/${service.slug}`}
                  className={cn(
                    'flex items-center justify-between',
                    'border-t border-[var(--color-border)] pt-3',
                    'text-[length:var(--text-xs)] font-medium uppercase tracking-wider',
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

          {/* Scroll hint (fades out once animation starts) */}
          <div
            ref={hintRef}
            className="absolute bottom-10 flex flex-col items-center gap-2 transition-opacity duration-500"
            style={{ pointerEvents: 'none' }}
          >
            <span
              className="text-[length:var(--text-xs)] uppercase tracking-[0.25em] text-[var(--color-text-tertiary)]"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              Scroll to explore
            </span>
            <svg
              className="animate-bounce"
              width="18" height="18" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round"
              style={{ color: 'var(--color-text-tertiary)', opacity: 0.5 }}
            >
              <path d="M12 5v14M5 12l7 7 7-7" />
            </svg>
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
              <h3 className="mb-2 text-[length:var(--text-lg)] font-semibold text-[var(--color-text-primary)]" style={{ fontFamily: 'var(--font-heading)' }}>
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
