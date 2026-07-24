"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import {
  m,
  AnimatePresence,
  useScroll,
  useTransform,
  useMotionValueEvent,
  useReducedMotion,
  type PanInfo,
} from "framer-motion";
import { Eye, RefreshCw, Layers, Target, TrendingUp } from "lucide-react";

type Value = { title: string; body: string; icon: React.ReactNode };

const VALUES: Value[] = [
  {
    title: "Transparency & Accountability",
    body: "We communicate honestly about timelines, challenges, and constraints. Clients know exactly what we are building and why.",
    icon: <Eye className="h-6 w-6" />,
  },
  {
    title: "Continuous Improvement",
    body: "We improve through feedback, retrospectives, and learning. From sprint reviews to post-launch support, getting better is built into our process.",
    icon: <RefreshCw className="h-6 w-6" />,
  },
  {
    title: "Scalable & Future-Ready Architecture",
    body: "Systems we deliver are designed to scale with your growth, integrate with future tools, and adapt as your needs evolve.",
    icon: <Layers className="h-6 w-6" />,
  },
  {
    title: "Business-First Design",
    body: "We build around real operational workflows — not generic templates. Practical adoption and measurable impact are the standards we hold every solution to.",
    icon: <Target className="h-6 w-6" />,
  },
  {
    title: "Long-Term Value Over Quick Fixes",
    body: "We build for the long run. Every solution is architected to serve your organisation for years, not just months. We avoid shortcuts that create technical debt.",
    icon: <TrendingUp className="h-6 w-6" />,
  },
];

const SWIPE_DISTANCE = 70;
const SWIPE_VELOCITY = 350;
// Top padding so pinned content clears a fixed navbar. Tune to your navbar height.
const NAV_OFFSET = "pt-20";

export default function KaizenValues() {
  const prefersReduced = useReducedMotion();
  const [[index, direction], setIndex] = useState<[number, number]>([0, 0]);

  // ---- Serialized card sequencing ----
  // Cards are driven by scroll, drag, keyboard, AND dots — often faster than a
  // single spring transition can finish. Committing a new transition on every
  // one of those events lets framer's popLayout stack several in-flight cards on
  // top of each other, which is the intermittent "cards glitch / flicker". (A
  // fresh load that happens to be scrolled slowly never stacks them — hence it
  // "works after a refresh".) Fix: SERIALIZE. Only one transition runs at a
  // time, and it always jumps straight to the LATEST requested index, skipping
  // any intermediates. `indexRef` mirrors the committed index so the helpers
  // below stay pure (no state reads inside a setState updater).
  const indexRef = useRef(0);
  useEffect(() => {
    indexRef.current = index;
  }, [index]);
  const targetRef = useRef(0); // newest desired index
  const busyRef = useRef(false); // a card transition is currently animating

  const applyTarget = useCallback(() => {
    if (busyRef.current) return;
    const cur = indexRef.current;
    const t = targetRef.current;
    if (t === cur) return;
    busyRef.current = true;
    setIndex([t, t > cur ? 1 : -1]);
  }, []);

  const requestIndex = useCallback(
    (i: number) => {
      targetRef.current = Math.min(VALUES.length - 1, Math.max(0, i));
      applyTarget();
    },
    [applyTarget]
  );

  const paginate = useCallback(
    (dir: number) => requestIndex(targetRef.current + dir),
    [requestIndex]
  );
  const goTo = useCallback((i: number) => requestIndex(i), [requestIndex]);

  // ---- Scroll-driven sequencing ----
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });
  const progressToIndex = useTransform(
    scrollYProgress,
    [0, 1],
    [0, VALUES.length - 1]
  );

  // Only let scroll drive the cards while the section is actually on screen. On
  // a client-side navigation the section mounts far below the fold while Lenis
  // is still resetting scroll and the content/fonts above are settling; a
  // measurement taken then can momentarily report a non-zero progress and snap
  // the deck to the wrong card (the glitch a plain refresh avoids). Gating on
  // visibility means the first index we honour is measured against a settled,
  // in-view layout.
  const engagedRef = useRef(false);
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        engagedRef.current = entry.isIntersecting;
      },
      { threshold: 0 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useMotionValueEvent(progressToIndex, "change", (v) => {
    if (prefersReduced || !engagedRef.current) return;
    requestIndex(Math.round(v));
  });

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") paginate(1);
    if (e.key === "ArrowLeft") paginate(-1);
  };

  const onDragEnd = (_: unknown, info: PanInfo) => {
    const { offset, velocity } = info;
    if (offset.x < -SWIPE_DISTANCE || velocity.x < -SWIPE_VELOCITY) paginate(1);
    else if (offset.x > SWIPE_DISTANCE || velocity.x > SWIPE_VELOCITY) paginate(-1);
  };

  // ---- Reduced-motion fallback ----
  if (prefersReduced) {
    return (
      <section className="mx-auto max-w-6xl px-6 py-24">
        <Header />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {VALUES.map((v) => (
            <div key={v.title} className="card-red-accent overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-8">
              <div className="mb-5 inline-flex rounded-xl bg-[var(--red-soft)] p-3 text-[var(--red-brand)]">{v.icon}</div>
              <h3 className="font-[family-name:var(--font-heading)] text-xl font-semibold text-slate-900">{v.title}</h3>
              <p className="mt-3 text-lg leading-relaxed text-slate-600">{v.body}</p>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <div
      ref={sectionRef}
      style={{ height: `${VALUES.length * 90 + 60}vh` }}
      className="relative"
    >
      <div
        className={`kv-stage sticky top-0 flex h-svh flex-col items-center justify-center overflow-hidden bg-white ${NAV_OFFSET}`}
      >
        <Header />

        <div
          tabIndex={0}
          role="group"
          aria-roledescription="card carousel"
          aria-label="Our values. Use arrow keys, drag, or scroll to navigate."
          onKeyDown={onKeyDown}
          className="kv-deck relative mt-8 flex w-[min(100%-2rem,42rem)] items-center justify-center outline-none"
        >
          {/* Background deck cards — upright, never hold text */}
          {[2, 1].map((depth) => {
            if (index + depth > VALUES.length - 1) return null;
            return (
              <div
                key={`peek-${depth}`}
                aria-hidden
                className="absolute inset-x-4 top-3 h-full rounded-3xl border border-slate-200 bg-slate-50"
                style={{
                  transform: `translateY(${depth * 14}px) scale(${1 - depth * 0.05})`,
                  opacity: 1 - depth * 0.4,
                  zIndex: 10 - depth,
                }}
              />
            );
          })}

          {/* Active card — fixed height so every card is uniform regardless of copy length */}
          <AnimatePresence
            initial={false}
            custom={direction}
            mode="popLayout"
            onExitComplete={() => {
              // The prior card finished leaving — release the lock and jump to
              // wherever scroll/drag has moved the target since. This is what
              // keeps transitions strictly one-at-a-time (no pile-up).
              busyRef.current = false;
              applyTarget();
            }}
          >
            <m.div
              key={index}
              custom={direction}
              className="kv-card card-red-accent relative flex h-[min(32.5rem,58svh)] w-full cursor-grab flex-col overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-50 to-sky-50 p-6 shadow-lg active:cursor-grabbing sm:p-8 lg:p-10"
              style={{ zIndex: 20 }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.6}
              onDragEnd={onDragEnd}
              whileDrag={{ scale: 1.02 }}
              variants={{
                enter: (d: number) => ({ x: d > 0 ? 320 : -320, rotate: d > 0 ? 6 : -6, opacity: 0 }),
                center: { x: 0, rotate: 0, opacity: 1 },
                exit: (d: number) => ({ x: d > 0 ? -320 : 320, rotate: d > 0 ? -6 : 6, opacity: 0 }),
              }}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
            >
              <div className="kv-icon mb-4 inline-flex w-fit rounded-2xl bg-[var(--red-soft)] p-3 text-[var(--red-brand)] sm:mb-5">
                {VALUES[index].icon}
              </div>
              {/* break-words + balanced wrapping fixes the mid-word "Accountabilit-y" break */}
              <h3 className="font-[family-name:var(--font-heading)] text-xl font-semibold leading-tight tracking-tight text-slate-900 [text-wrap:balance] break-words sm:text-2xl">
                {VALUES[index].title}
              </h3>
              <p className="mt-3 text-base leading-relaxed text-slate-600 sm:mt-4 sm:text-lg">
                {VALUES[index].body}
              </p>
            </m.div>
          </AnimatePresence>
        </div>

        {/* Controls — progress dots */}
        <div className="kv-dots mt-8 flex items-center justify-center">
          {VALUES.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Go to value ${i + 1}`}
              aria-current={i === index}
              className="group flex h-6 items-center justify-center px-2"
            >
              <span
                className={`block h-2 rounded-full transition-all ${
                  i === index
                    ? "w-6 bg-sky-500"
                    : "w-2 bg-slate-300 group-hover:bg-slate-400"
                }`}
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function Header() {
  return (
    <div className="kv-header text-center">
      <span className="text-[length:var(--h-eyebrow)] font-semibold uppercase tracking-[0.2em] text-[var(--color-text-tertiary)]">Our Values</span>
      <h2 className="mt-2 font-[family-name:var(--font-heading)] text-[length:var(--h-section)] font-bold text-slate-900">The Kaizen Way</h2>
    </div>
  );
}
