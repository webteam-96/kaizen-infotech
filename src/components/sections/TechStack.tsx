'use client';
/* eslint-disable @next/next/no-img-element -- brand logos are tiny first-party SVGs (self-hosted Simple Icons); next/image adds an optimizer round-trip for no benefit on SVG. */

import {
  useRef,
  useEffect,
  useState,
  type CSSProperties,
  type ReactNode,
  type PointerEvent as RPointerEvent,
} from 'react';
import { m, useMotionValue, useAnimationFrame, useTransform } from 'framer-motion';
import { ScrollFadeIn } from '@/components/animation/ScrollFadeIn';
import { TextReveal } from '@/components/animation/TextReveal';
import { useReducedMotion } from '@/hooks';
import { cn } from '@/lib/utils/cn';

// ---------------------------------------------------------------------------
// Inline glyphs for technologies that have no brand logo on the CDN.
// They use currentColor so they fade from neutral grey → tint on hover.
// ---------------------------------------------------------------------------

const IconSparkles = (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className="h-full w-full">
    <path d="M12 2l1.7 5L19 8.6l-5.3 1.6L12 15l-1.7-4.8L5 8.6l5.3-1.6z" />
    <path d="M18.5 13.5l.9 2.6 2.6.9-2.6.9-.9 2.6-.9-2.6-2.6-.9 2.6-.9z" />
  </svg>
);

const IconRAG = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" aria-hidden className="h-full w-full">
    <path d="M12 3 3 7.5 12 12l9-4.5z" />
    <path d="M3 12l9 4.5L21 12" />
    <path d="M3 16.5 12 21l9-4.5" />
  </svg>
);

const IconML = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden className="h-full w-full">
    <circle cx="5" cy="6" r="2.1" />
    <circle cx="5" cy="18" r="2.1" />
    <circle cx="19" cy="12" r="2.1" />
    <path d="M7 6.8l10 4M7 17.2l10-4" strokeLinecap="round" />
  </svg>
);

const IconAgent = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="h-full w-full">
    <rect x="4" y="8" width="16" height="11" rx="2.6" />
    <path d="M12 3v3M2.5 13v2M21.5 13v2" />
    <circle cx="9.2" cy="13.2" r="1.1" fill="currentColor" stroke="none" />
    <circle cx="14.8" cy="13.2" r="1.1" fill="currentColor" stroke="none" />
  </svg>
);

// React Native shares React's official atom logo (there is no separate mark),
// so to avoid a duplicate icon it gets a distinct device glyph instead.
const IconMobile = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="h-full w-full">
    <rect x="6.5" y="2.5" width="11" height="19" rx="2.6" />
    <path d="M10.5 5.4h3" />
    <circle cx="12" cy="18.2" r="0.95" fill="currentColor" stroke="none" />
  </svg>
);

// ---------------------------------------------------------------------------
// Tech list — `slug` loads the official logo from cdn.simpleicons.org;
// `node` is a custom glyph; `tint` is the colour revealed on hover.
// ---------------------------------------------------------------------------

interface Tech {
  name: string;
  // Official Simple Icons logo, SELF-HOSTED at /images/tech/<slug>.svg (brand
  // colour baked into the file's fill). Previously hot-linked from
  // cdn.simpleicons.org — ~17 third-party requests on a cold homepage load; to
  // add a new one: curl -sL https://cdn.simpleicons.org/<slug> -o public/images/tech/<slug>.svg
  slug?: string;
  img?: string;    // local logo image (brands not on Simple Icons)
  node?: ReactNode;
  tint?: string;
}

const TECHS: Tech[] = [
  { name: 'React JS', slug: 'react' },
  { name: 'Next JS', slug: 'nextdotjs' },
  { name: 'Vue JS', slug: 'vuedotjs' },
  { name: '.NET Core', slug: 'dotnet' },
  { name: 'MySQL', slug: 'mysql' },
  { name: 'PostgreSQL', slug: 'postgresql' },
  { name: 'MongoDB', slug: 'mongodb' },
  { name: 'Node JS', slug: 'nodedotjs' },
  { name: 'Python', slug: 'python' },
  { name: 'Android', slug: 'android' },
  { name: 'iOS', slug: 'apple' },
  { name: 'Flutter', slug: 'flutter' },
  { name: 'React Native', node: IconMobile, tint: '#61DAFB' },
  { name: 'HTML / CSS', slug: 'html5' },
  { name: 'WhatsApp', slug: 'whatsapp' },
  { name: 'Razorpay', slug: 'razorpay' },
  { name: 'Instamojo', img: '/images/tech/instamojo.png', tint: '#2E3192' },
  { name: 'Cashfree', img: '/images/tech/cashfree.png', tint: '#05C16E' },
  { name: 'Express API', slug: 'express' },
  { name: 'Tailwind CSS', slug: 'tailwindcss' },
  { name: 'AI Technologies', node: IconSparkles, tint: '#8B5CF6' },
  { name: 'RAG Systems', node: IconRAG, tint: '#0EA5E9' },
  { name: 'ML Systems', node: IconML, tint: '#10B981' },
  { name: 'Agentic Coding', node: IconAgent, tint: '#F59E0B' },
];

const ROW_TOP = TECHS.slice(0, 12);
const ROW_BOTTOM = TECHS.slice(12);
const BASE_VELOCITY = 42; // px per second

// ---------------------------------------------------------------------------
// Single logo chip — B&W by default, full colour + lift on hover.
// ---------------------------------------------------------------------------

// `active` mirrors the desktop :hover state for touch devices — a tap toggles it
// (see useMarquee), and it lights the chip exactly like hover would. Conflicting
// utilities are resolved by `cn` (tailwind-merge), so the active classes cleanly
// override the resting ones.
function Chip({ tech, index, active }: { tech: Tech; index?: number; active?: boolean }) {
  return (
    <div
      data-chip-index={index}
      className={cn(
        'group mr-5 flex shrink-0 select-none items-center gap-4 rounded-full',
        'border border-[var(--color-border)] bg-white px-8 py-5',
        'shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition duration-300',
        'hover:-translate-y-0.5 hover:border-[var(--color-border-hover)]',
        'hover:shadow-[0_10px_28px_rgba(0,0,0,0.10)]',
        active &&
          '-translate-y-0.5 border-[var(--color-border-hover)] shadow-[0_10px_28px_rgba(0,0,0,0.10)]'
      )}
      style={{ '--tint': tech.tint ?? 'var(--color-accent-primary)' } as CSSProperties}
    >
      <span className="flex h-11 w-11 items-center justify-center">
        {tech.img ? (
          <img
            src={tech.img}
            alt=""
            width={44}
            height={44}
            loading="lazy"
            draggable={false}
            className={cn(
              'h-11 w-11 rounded-[9px] object-contain opacity-60 grayscale transition duration-300 group-hover:opacity-100 group-hover:grayscale-0',
              active && 'opacity-100 grayscale-0'
            )}
          />
        ) : tech.slug ? (
          <img
            src={`/images/tech/${tech.slug}.svg`}
            alt=""
            width={44}
            height={44}
            loading="lazy"
            draggable={false}
            className={cn(
              'h-11 w-11 object-contain opacity-60 grayscale transition duration-300 group-hover:opacity-100 group-hover:grayscale-0',
              active && 'opacity-100 grayscale-0'
            )}
          />
        ) : (
          <span
            className={cn(
              'flex h-11 w-11 items-center justify-center text-[#9aa3af] transition-colors duration-300 group-hover:text-[var(--tint)]',
              active && 'text-[var(--tint)]'
            )}
          >
            {tech.node}
          </span>
        )}
      </span>
      <span
        className={cn(
          'whitespace-nowrap text-[length:var(--text-base)] font-medium text-[var(--color-text-tertiary)] transition-colors duration-300 group-hover:text-[var(--color-text-primary)]',
          active && 'text-[var(--color-text-primary)]'
        )}
        style={{ fontFamily: 'var(--font-heading)' }}
      >
        {tech.name}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Marquee mechanics: seamless loop + drag-to-scrub + flick momentum +
// ease-to-slow on hover. One transform per row → cheap and smooth.
// ---------------------------------------------------------------------------

function useMarquee(baseVelocity: number) {
  const baseX = useMotionValue(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const periodRef = useRef(1); // width of one set of items (track is rendered twice)
  const dragVel = useRef(0);
  const dragging = useRef(false);
  const last = useRef({ x: 0, t: 0 });
  const speed = useRef(1);
  const targetSpeed = useRef(1);
  // Tap-to-activate (touch/pen): a press that never becomes a drag toggles the
  // pressed chip's lit state — the touch equivalent of a desktop hover.
  const startX = useRef(0);
  const dragged = useRef(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // Visibility gate: this marquee used to be the one remaining per-frame loop
  // that ran for the whole page lifetime (every canvas background is already
  // IO-gated and the hero tick early-exits off-screen). Pause the rAF work while
  // the section is out of view; position resumes exactly where it paused.
  const inViewRef = useRef(true);

  useEffect(() => {
    const measure = () => {
      if (trackRef.current) periodRef.current = trackRef.current.scrollWidth / 2 || 1;
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (trackRef.current) ro.observe(trackRef.current);
    let io: IntersectionObserver | undefined;
    if (trackRef.current && typeof IntersectionObserver !== 'undefined') {
      io = new IntersectionObserver(
        ([entry]) => {
          inViewRef.current = entry.isIntersecting;
        },
        // Small margin so the rows are already moving as they scroll into view.
        { rootMargin: '150px 0px' },
      );
      io.observe(trackRef.current);
    }
    return () => {
      ro.disconnect();
      io?.disconnect();
    };
  }, []);

  // Map any accumulated offset into a single [-period, 0) window → seamless wrap.
  const x = useTransform(baseX, (v) => {
    const w = periodRef.current || 1;
    const m = ((v % w) + w) % w;
    return `${m - w}px`;
  });

  useAnimationFrame((_, delta) => {
    // Off-screen: skip all motion work (except mid-drag, which implies visible).
    if (!inViewRef.current && !dragging.current) return;
    const dt = Math.min(delta, 50) / 1000; // clamp tab-switch gaps
    speed.current += (targetSpeed.current - speed.current) * 0.08; // smooth hover slow-down
    let move = baseVelocity * speed.current * dt;
    if (!dragging.current) {
      move += dragVel.current * dt; // flick momentum
      dragVel.current *= 0.93; // decay back to the base speed
      if (Math.abs(dragVel.current) < 1) dragVel.current = 0;
    }
    baseX.set(baseX.get() + move);
  });

  const onPointerDown = (e: RPointerEvent<HTMLDivElement>) => {
    dragging.current = true;
    dragged.current = false;
    dragVel.current = 0;
    startX.current = e.clientX;
    last.current = { x: e.clientX, t: e.timeStamp };
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e: RPointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    const dx = e.clientX - last.current.x;
    const dtMs = Math.max(8, e.timeStamp - last.current.t);
    baseX.set(baseX.get() + dx); // 1:1 finger tracking
    dragVel.current = (dx / dtMs) * 1000; // px/s → carried as momentum on release
    if (Math.abs(e.clientX - startX.current) > 8) dragged.current = true; // it's a scrub, not a tap
    last.current = { x: e.clientX, t: e.timeStamp };
  };
  // Release/cancel cleanup only — no tap handling (used for cancel + leave).
  const finishDrag = (e: RPointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    dragging.current = false;
    e.currentTarget.releasePointerCapture?.(e.pointerId);
  };
  const onPointerUp = (e: RPointerEvent<HTMLDivElement>) => {
    const wasTap = dragging.current && !dragged.current;
    finishDrag(e);
    // Touch/pen tap (mouse already has hover): toggle the chip under the finger.
    if (wasTap && e.pointerType !== 'mouse' && typeof document !== 'undefined') {
      const chip = (document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null)?.closest(
        '[data-chip-index]',
      );
      const idx = chip?.getAttribute('data-chip-index');
      if (idx != null && idx !== '') {
        const n = Number(idx);
        setActiveIndex((cur) => (cur === n ? null : n));
      }
    }
  };
  const onPointerEnter = (e: RPointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'mouse') targetSpeed.current = 0.18;
  };
  const onPointerLeave = (e: RPointerEvent<HTMLDivElement>) => {
    targetSpeed.current = 1;
    finishDrag(e);
  };

  return {
    trackRef,
    x,
    activeIndex,
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel: finishDrag,
      onPointerEnter,
      onPointerLeave,
    },
  };
}

function MarqueeRow({ items, baseVelocity }: { items: Tech[]; baseVelocity: number }) {
  const { trackRef, x, activeIndex, handlers } = useMarquee(baseVelocity);
  return (
    <div
      {...handlers}
      aria-hidden
      className="cursor-grab overflow-hidden py-4 active:cursor-grabbing"
      style={{
        touchAction: 'pan-y',
        WebkitMaskImage: 'linear-gradient(90deg, transparent 0, #000 6%, #000 94%, transparent 100%)',
        maskImage: 'linear-gradient(90deg, transparent 0, #000 6%, #000 94%, transparent 100%)',
      }}
    >
      <m.div ref={trackRef} className="flex w-max px-2" style={{ x }}>
        {[...items, ...items].map((t, i) => (
          <Chip key={`${t.name}-${i}`} tech={t} index={i} active={i === activeIndex} />
        ))}
      </m.div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Section
// ---------------------------------------------------------------------------

function Header() {
  return (
    <div className="mb-12 text-center">
      <ScrollFadeIn direction="up">
        <span
          className="text-[length:var(--h-eyebrow)] font-medium uppercase tracking-widest text-[var(--color-text-tertiary)]"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          What Powers Us
        </span>
      </ScrollFadeIn>
      <TextReveal
        as="h2"
        splitBy="words"
        className={cn(
          'mt-3 font-[family-name:var(--font-display)]',
          'text-[length:var(--h-section)] leading-tight tracking-tight',
          'text-[var(--color-text-primary)]'
        )}
      >
        Reliable and proven technologies
      </TextReveal>
    </div>
  );
}

export function TechStack() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section
      data-section-index={7}
      className="relative overflow-hidden section-tint seam-blue py-[var(--space-section)]"
    >
      <div className="mx-auto max-w-[var(--container-max)] px-[var(--container-padding)]">
        <Header />
      </div>

      {/* Screen-reader list (the visual marquee is aria-hidden) */}
      <ul className="sr-only">
        {TECHS.map((t) => (
          <li key={t.name}>{t.name}</li>
        ))}
      </ul>

      {prefersReducedMotion ? (
        <div className="mx-auto flex max-w-[var(--container-max)] flex-wrap justify-center gap-4 px-[var(--container-padding)]">
          {TECHS.map((t) => (
            <Chip key={t.name} tech={t} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <MarqueeRow items={ROW_TOP} baseVelocity={-BASE_VELOCITY} />
          <MarqueeRow items={ROW_BOTTOM} baseVelocity={BASE_VELOCITY} />
        </div>
      )}
    </section>
  );
}
