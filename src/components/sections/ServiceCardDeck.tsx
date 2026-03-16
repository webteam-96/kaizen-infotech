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
const G = 24;    // grid gap    (px)

// Stack offsets — matches reference HTML exactly
const STACK: { x: number; y: number; r: number }[] = [
  { x: 0,  y: 0,   r: -3   },
  { x: 2,  y: -3,  r: -1.5 },
  { x: 4,  y: -6,  r: 0    },
  { x: 6,  y: -9,  r: 1.5  },
  { x: 8,  y: -12, r: 3    },
];

// Grid: 3 top + 2 bottom, centered around deck origin
const GRID: { x: number; y: number }[] = [
  { x: -(W + G),          y: -(H / 2 + G / 2) }, // top-left
  { x: 0,                 y: -(H / 2 + G / 2) }, // top-center
  { x:  (W + G),          y: -(H / 2 + G / 2) }, // top-right
  { x: -(W / 2 + G / 2),  y:  (H / 2 + G / 2) }, // bottom-left
  { x:  (W / 2 + G / 2),  y:  (H / 2 + G / 2) }, // bottom-right
];

// Per-card dark gradient backgrounds (matching reference aesthetics)
const CARD_BG = [
  { gradient: 'linear-gradient(145deg, #1a1a2e, #16213e)', border: 'rgba(59,130,246,0.2)' },
  { gradient: 'linear-gradient(145deg, #1a1a2e, #0f3460)', border: 'rgba(56,189,248,0.2)' },
  { gradient: 'linear-gradient(145deg, #1a1a2e, #1e1e3a)', border: 'rgba(167,139,250,0.2)' },
  { gradient: 'linear-gradient(145deg, #1a1a2e, #2d1b4e)', border: 'rgba(236,72,153,0.2)' },
  { gradient: 'linear-gradient(145deg, #1a1a2e, #1b3a2d)', border: 'rgba(52,211,153,0.2)' },
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
// ServiceCardDeck
// ─────────────────────────────────────────────────────────────────────────────
export function ServiceCardDeck() {
  const containerRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);
  const phaseLabelRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
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

    // ── Initial state — matches reference HTML exactly ──────────────────────
    // opacity: 0.2, scale: 0.55, translateY: +40px from stack position
    // Dark bg makes 0.2 opacity safe (no ghosting on dark backgrounds)
    cards.forEach((card, i) => {
      const s = STACK[i];
      gsap.set(card, {
        x: s.x,
        y: s.y + 40,
        rotation: s.r,
        scale: 0.55,
        opacity: 0.2,
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
        onUpdate(self) {
          const p = self.progress;
          // Hint fade
          if (hintRef.current) {
            hintRef.current.style.opacity = p > 0.02 ? '0' : '1';
          }
          // Phase label
          if (phaseLabelRef.current) {
            phaseLabelRef.current.textContent =
              p <= 0.42 ? 'Stacked' : p <= 0.75 ? 'Revealing' : 'Revealed';
          }
          // Progress fill
          if (progressRef.current) {
            progressRef.current.style.height = `${p * 100}%`;
          }
        },
      },
    });

    // ── Phase 1 (tl 0–1): stack pops up ─────────────────────────────────────
    // ALL cards animate TOGETHER at tl position 0 (no stagger).
    // scale 0.55→1, opacity 0.2→0.6, y settles to stack offset.
    cards.forEach((card, i) => {
      const s = STACK[i];
      tl.to(card, {
        x: s.x,
        y: s.y,
        rotation: s.r,
        scale: 1,
        opacity: 0.6,
        ease: 'power2.inOut',
        duration: 1,
      }, 0); // all at position 0 — together
    });

    // Glow phase 1
    if (glowRef.current) {
      tl.fromTo(glowRef.current,
        { opacity: 0.3 },
        { opacity: 1, duration: 1, ease: 'power2.inOut' },
        0,
      );
    }

    // ── Phase 2 (tl 1–2.7): cards spread to grid ───────────────────────────
    // Forward stagger: i * 0.04 — slight offset per card for natural "deal" feel.
    // scale→0.88, opacity→1. Matches reference exactly.
    cards.forEach((card, i) => {
      const g = GRID[i];
      tl.to(card, {
        x: g.x,
        y: g.y,
        rotation: 0,
        scale: 0.88,
        opacity: 1,
        ease: 'power3.inOut',
        duration: 1.5,
      }, 1 + i * 0.04);
    });

    // Glow phase 2
    if (glowRef.current) {
      tl.to(glowRef.current,
        { opacity: 0.4, scale: 1.3, duration: 1.5, ease: 'power2.inOut' },
        1,
      );
    }
  }, { scope: containerRef, dependencies: [] });

  // ── JSX ──────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Desktop: sticky deck animation (lg+) ─────────────────────────── */}
      <div
        ref={containerRef}
        className="relative hidden lg:block"
        style={{ height: '500vh' }}
      >
        <div
          className="sticky top-0 flex h-screen items-center justify-center overflow-hidden"
          style={{ background: '#0a0a0f' }}
        >
          {/* Phase label */}
          <div
            ref={phaseLabelRef}
            className="absolute top-12"
            style={{
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: 3,
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.35)',
            }}
          >
            Stacked
          </div>

          {/* Progress track (right side) */}
          <div
            className="absolute right-8 top-1/2 -translate-y-1/2"
            style={{
              width: 3,
              height: 120,
              background: 'rgba(255,255,255,0.08)',
              borderRadius: 3,
            }}
          >
            <div
              ref={progressRef}
              style={{
                width: '100%',
                height: '0%',
                background: 'linear-gradient(to bottom, var(--color-accent-primary), #a78bfa)',
                borderRadius: 3,
              }}
            />
          </div>

          {/* Ambient glow */}
          <div
            ref={glowRef}
            aria-hidden
            className="pointer-events-none absolute rounded-full"
            style={{
              width: 500,
              height: 500,
              background: 'radial-gradient(circle, rgba(99,102,241,0.1), transparent 70%)',
              opacity: 0.5,
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
                  borderRadius: 18,
                  willChange: 'transform, opacity',
                  zIndex: i + 1,
                  background: CARD_BG[i]?.gradient ?? CARD_BG[0].gradient,
                  borderWidth: 1,
                  borderStyle: 'solid',
                  borderColor: CARD_BG[i]?.border ?? CARD_BG[0].border,
                  boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
                }}
                className="flex flex-col p-5"
              >
                {/* Icon */}
                <div
                  className="mb-4 flex h-11 w-11 items-center justify-center rounded-[var(--radius-md)]"
                  style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--color-accent-primary)' }}
                >
                  <ServiceIcon name={service.icon} />
                </div>

                {/* Title */}
                <h3
                  className="mb-2.5 line-clamp-2 text-[length:var(--text-base)] font-semibold leading-snug"
                  style={{ fontFamily: 'var(--font-heading)', color: '#fff' }}
                >
                  {service.title}
                </h3>

                {/* Description */}
                <p
                  className="mb-4 line-clamp-3 flex-1 text-[length:var(--text-sm)] leading-relaxed"
                  style={{ fontFamily: 'var(--font-body)', color: 'rgba(255,255,255,0.6)' }}
                >
                  {service.description}
                </p>

                {/* Tech tags */}
                <div className="mb-4 flex flex-wrap gap-1.5">
                  {service.technologies.slice(0, 3).map((tech) => (
                    <span
                      key={tech}
                      className="inline-block rounded-[var(--radius-full)] px-2.5 py-0.5 text-[length:var(--text-xs)]"
                      style={{
                        fontFamily: 'var(--font-mono)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        background: 'rgba(255,255,255,0.04)',
                        color: 'rgba(255,255,255,0.5)',
                      }}
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                {/* Learn more */}
                <Link
                  href={`/services/${service.slug}`}
                  className="flex items-center justify-between pt-3 text-[length:var(--text-xs)] font-medium uppercase tracking-wider transition-colors duration-200 hover:text-[var(--color-accent-primary)]"
                  style={{
                    fontFamily: 'var(--font-heading)',
                    borderTop: '1px solid rgba(255,255,255,0.08)',
                    color: 'rgba(255,255,255,0.4)',
                  }}
                >
                  Learn more
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                    <path d="M4 10H16M16 10L11 5M16 10L11 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
              </div>
            ))}
          </div>

          {/* Scroll hint */}
          <div
            ref={hintRef}
            className="absolute bottom-10 flex flex-col items-center gap-2"
            style={{ pointerEvents: 'none', animation: 'deckHintPulse 2s ease-in-out infinite' }}
          >
            <span
              style={{
                fontSize: 12,
                letterSpacing: 2,
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.25)',
              }}
            >
              Scroll to animate
            </span>
            <svg
              width="20" height="20" viewBox="0 0 24 24"
              fill="none" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round"
              style={{ stroke: 'rgba(255,255,255,0.25)' }}
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
