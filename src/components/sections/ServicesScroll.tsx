'use client';

import { useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, registerGSAPPlugins, ScrollTrigger } from '@/lib/animations/gsap-setup';
import { ServiceCard } from '@/components/ui/ServiceCard';
import { services } from '@/content/services';
import { cn } from '@/lib/utils/cn';

// ---------------------------------------------------------------------------
// Icon components
// ---------------------------------------------------------------------------

function CodeIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
    </svg>
  );
}
function SmartphoneIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="2" width="14" height="20" rx="2" ry="2" /><line x1="12" y1="18" x2="12.01" y2="18" />
    </svg>
  );
}
function CalendarIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}
function GlobeIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
    </svg>
  );
}
function TrendingUpIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
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

function clamp01(v: number) {
  return Math.max(0, Math.min(1, v));
}

function smoothstep(t: number) {
  return t * t * (3 - 2 * t);
}

// ---------------------------------------------------------------------------
// Phase boundaries
// ---------------------------------------------------------------------------

const P1 = 0.10; // popup ends
const P2 = 0.25; // spread ends
const P3 = 0.80; // carousel ends
const P4 = 0.95; // fade-out ends

const CARD_GAP = 380;

// ---------------------------------------------------------------------------
// ServicesScroll
// ---------------------------------------------------------------------------

export function ServicesScroll() {
  const sectionRef = useRef<HTMLElement>(null);
  const deckRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const dotsRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeIndexRef = useRef(0);

  registerGSAPPlugins();

  useGSAP(
    () => {
      if (!sectionRef.current || !deckRef.current) return;

      const section = sectionRef.current;
      const deck = deckRef.current;
      const cards = gsap.utils.toArray<HTMLElement>('.deck-card', deck);
      const dots = dotsRef.current
        ? gsap.utils.toArray<HTMLElement>('.deck-dot', dotsRef.current)
        : [];
      const N = cards.length;

      // Stack offsets — slight cascade
      const stackOffsets = cards.map((_, i) => ({
        x: i * 4,
        y: -i * 6,
        r: -2 + i * 1,
      }));

      // ---- DOM helpers (bypass React state for 60fps perf) ----

      function updateCounter(idx: number) {
        if (counterRef.current) {
          counterRef.current.textContent = `${String(idx + 1).padStart(2, '0')} / ${String(N).padStart(2, '0')}`;
        }
      }

      function updateDots(idx: number) {
        dots.forEach((dot, i) => {
          dot.style.transform = i === idx ? 'scale(1.5)' : 'scale(1)';
          dot.style.backgroundColor =
            i === idx
              ? 'var(--color-accent-primary)'
              : 'var(--color-border)';
          dot.style.boxShadow =
            i === idx
              ? '0 0 8px var(--color-glow)'
              : 'none';
        });
      }

      function updateActiveIndex(idx: number) {
        if (activeIndexRef.current !== idx) {
          activeIndexRef.current = idx;
          setActiveIndex(idx);
        }
      }

      // ---- Render function driven by scroll progress ----

      function render(p: number) {
        // Progress bar
        if (progressRef.current) {
          progressRef.current.style.height = `${p * 100}%`;
        }

        // Hint — hide once scrolling starts
        if (hintRef.current) {
          hintRef.current.style.opacity = p > 0.01 ? '0' : '1';
        }

        /* ═══════════════════════════════════════════
           PHASE 1 — POPUP  (0 → P1)
           Scale 0.5 → 1, rise from below
           ═══════════════════════════════════════════ */
        if (p <= P1) {
          const t = smoothstep(clamp01(p / P1));

          cards.forEach((card, i) => {
            const off = stackOffsets[i];
            gsap.to(card, {
              x: off.x,
              y: off.y + (1 - t) * 80,
              rotation: off.r,
              scale: 0.5 + t * 0.5,
              opacity: t,
              duration: 0.4,
              ease: 'power3.out',
              overwrite: true,
            });
            card.style.zIndex = String(i);
          });

          updateActiveIndex(0);
          updateCounter(0);
          updateDots(-1);
        }

        /* ═══════════════════════════════════════════
           PHASE 2 — SPREAD TO LINE  (P1 → P2)
           Stack → horizontal line, card 0 at center
           ═══════════════════════════════════════════ */
        else if (p <= P2) {
          const t = smoothstep(clamp01((p - P1) / (P2 - P1)));

          cards.forEach((card, i) => {
            const off = stackOffsets[i];
            const lineX = i * CARD_GAP;

            gsap.to(card, {
              x: off.x + (lineX - off.x) * t,
              y: off.y * (1 - t),
              rotation: off.r * (1 - t),
              scale: 1 - t * 0.15,
              opacity: 1 - t * 0.15,
              duration: 0.4,
              ease: 'power3.out',
              overwrite: true,
            });
            card.style.zIndex = String(i);
          });

          updateActiveIndex(0);
          updateCounter(0);
          updateDots(0);
        }

        /* ═══════════════════════════════════════════
           PHASE 3 — CAROUSEL SPOTLIGHT  (P2 → P3)
           Row shifts left, active card spotlighted
           ═══════════════════════════════════════════ */
        else if (p <= P3) {
          const t = clamp01((p - P2) / (P3 - P2));
          const rowShift = -t * (N - 1) * CARD_GAP;
          const focusFloat = t * (N - 1);
          const idx = Math.round(focusFloat);

          cards.forEach((card, i) => {
            const baseX = i * CARD_GAP + rowShift;
            const dist = Math.abs(i - focusFloat);
            const prox = Math.max(0, 1 - dist);
            const proxSmooth = smoothstep(prox);

            // Active: full scale + opacity + lift. Inactive: smaller, dimmed
            const sc = 0.75 + proxSmooth * 0.25;
            const op = 0.5 + proxSmooth * 0.5;
            const yLift = -proxSmooth * 20;

            // Shadow intensifies with proximity
            const shadowBlur = 12 + proxSmooth * 28;
            const shadowAlpha = 0.06 + proxSmooth * 0.12;
            const shadow = `0 ${4 + proxSmooth * 8}px ${shadowBlur}px rgba(0,0,0,${shadowAlpha.toFixed(3)})`;

            gsap.to(card, {
              x: baseX,
              y: yLift,
              rotation: 0,
              scale: sc,
              opacity: op,
              boxShadow: shadow,
              duration: 0.35,
              ease: 'power2.out',
              overwrite: true,
            });
            card.style.zIndex = String(Math.round(proxSmooth * 10));
          });

          updateActiveIndex(idx);
          updateCounter(idx);
          updateDots(idx);
        }

        /* ═══════════════════════════════════════════
           PHASE 4 — FADE OUT  (P3 → P4)
           Cards drift away + scale down
           ═══════════════════════════════════════════ */
        else if (p <= P4) {
          const t = smoothstep(clamp01((p - P3) / (P4 - P3)));
          const rowShiftEnd = -(N - 1) * CARD_GAP;

          cards.forEach((card, i) => {
            const baseX = i * CARD_GAP + rowShiftEnd;
            const distFromLast = Math.abs(i - (N - 1));
            const fadeDelay = distFromLast * 0.1;
            const cardT = clamp01((t - fadeDelay) / (1 - fadeDelay));
            const cardTSmooth = smoothstep(cardT);

            const driftDir = i - (N - 1);
            const driftX = driftDir * cardTSmooth * 150;
            const isLast = i === N - 1;

            gsap.to(card, {
              x: baseX + driftX,
              y: cardTSmooth * 50,
              scale: Math.max(0.2, (isLast ? 1.0 : 0.75) * (1 - cardTSmooth * 0.5)),
              opacity: Math.max(0, (isLast ? 1 : 0.3) * (1 - cardTSmooth)),
              boxShadow: `0 4px 12px rgba(0,0,0,${(0.08 * (1 - cardTSmooth)).toFixed(3)})`,
              duration: 0.35,
              ease: 'power2.out',
              overwrite: true,
            });
          });

          updateActiveIndex(N - 1);
          updateCounter(N - 1);
          updateDots(N - 1);
        }

        /* ═══════════════════════════════════════════
           AFTER — blank
           ═══════════════════════════════════════════ */
        else {
          cards.forEach((card) => {
            gsap.to(card, { opacity: 0, duration: 0.3, overwrite: true });
          });
        }
      }

      // ---- ScrollTrigger: map vertical scroll to animation progress ----
      ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0,
        onUpdate: (self) => render(self.progress),
      });

      // Initial state
      render(0);
    },
    { scope: sectionRef, dependencies: [] }
  );

  return (
    <section
      ref={sectionRef}
      data-section-index={2}
      className="relative"
      style={{ height: '600vh' }}
    >
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden bg-[var(--color-bg-primary)]">
        {/* Header */}
        <div className="absolute top-8 left-0 right-0 z-10 flex items-end justify-between px-[var(--container-padding)]">
          <div className="flex items-baseline gap-4">
            <span
              className="text-xs font-medium uppercase tracking-widest text-[var(--color-text-tertiary)]"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              Services
            </span>
            <span
              className="text-xs text-[var(--color-accent-primary)]"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              01
            </span>
          </div>
          <span
            ref={counterRef}
            className="text-xs text-[var(--color-text-tertiary)]"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            01 / {String(services.length).padStart(2, '0')}
          </span>
        </div>

        {/* Deck — sized to match one card, centered in viewport */}
        <div
          ref={deckRef}
          className="relative w-[280px] h-[340px] sm:w-[320px] sm:h-[380px] md:w-[350px] md:h-[400px]"
        >
          {services.map((service, i) => (
            <div
              key={service.id}
              className="deck-card absolute inset-0 will-change-transform"
              style={{
                opacity: 0,
                transform: 'scale(0.5) translateY(60px)',
                transformOrigin: 'center center',
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

        {/* Vertical progress track */}
        <div className="absolute right-6 top-1/2 z-10 h-40 w-0.5 -translate-y-1/2 rounded-full bg-[var(--color-border)]">
          <div
            ref={progressRef}
            className="w-full rounded-full bg-[var(--color-accent-primary)]"
            style={{ height: '0%', transition: 'height 0.1s linear' }}
          />
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
  );
}
