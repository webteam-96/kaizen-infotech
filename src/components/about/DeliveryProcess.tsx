"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils/cn";

/* ===========================================================================
   DeliveryProcess — hover/click expanding card row.

   Adapted from Skiper UI "Skiper 52 / HoverExpand_001" (React + Framer Motion).
   Changes from upstream:
   - Drives text steps (number/title/description) instead of images.
   - Themed to the site's design tokens (no hardcoded slate/sky palette).
   - Responsive interaction: hover-to-expand on desktop (hover + fine pointer),
     tap-to-expand on touch (mobile / iPad).
   - Widths animate via flex-grow (basis-0) so the row always fits its container
     on any screen instead of fixed rem widths.
   - Dropped the unused Swiper CSS imports from the original snippet.
   =========================================================================== */

type Step = { number: string; title: string; description: string };

export default function DeliveryProcess({
  steps,
  className,
}: {
  steps: Step[];
  className?: string;
}) {
  const [active, setActive] = useState(0);
  const [canHover, setCanHover] = useState(false);

  // Desktop = a device that can hover with a precise pointer. Everything else
  // (phones, most tablets/iPads without a mouse) gets tap-to-expand.
  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setCanHover(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return (
    <div className={cn("flex w-full gap-2 md:gap-3", className)}>
      {steps.map((step, index) => {
        const isActive = active === index;
        return (
          <motion.div
            key={step.number}
            role="button"
            tabIndex={0}
            aria-expanded={isActive}
            aria-label={`${step.number} ${step.title}`}
            onMouseEnter={canHover ? () => setActive(index) : undefined}
            onClick={!canHover ? () => setActive(index) : undefined}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setActive(index);
              }
            }}
            initial={false}
            animate={{ flexGrow: isActive ? 6 : 1 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            style={{ backgroundColor: "var(--color-bg-tertiary)" }}
            className={cn(
              "card-red-accent relative h-[24rem] min-w-0 shrink basis-0 cursor-pointer select-none overflow-hidden rounded-[var(--radius-lg)] border outline-none transition-colors duration-300 md:h-[26rem]",
              "focus-visible:ring-2 focus-visible:ring-[var(--color-accent-primary)]",
              isActive
                ? "border-[var(--color-border-hover)] shadow-[0_0_30px_var(--color-glow)]"
                : "border-[var(--color-border)]"
            )}
          >
            {/* Accent wash on the active card */}
            <AnimatePresence>
              {isActive && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="pointer-events-none absolute inset-0 bg-gradient-to-br from-transparent to-[var(--accent-10)]"
                />
              )}
            </AnimatePresence>

            {/* Collapsed state — number on top, vertical title at the bottom */}
            <AnimatePresence>
              {!isActive && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex flex-col items-center justify-between py-6"
                >
                  <span
                    className="text-2xl font-bold text-[var(--red-brand)] opacity-85"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    {step.number}
                  </span>
                  <span className="whitespace-nowrap rotate-180 text-sm font-medium uppercase tracking-widest text-[var(--color-text-secondary)] [writing-mode:vertical-rl]">
                    {step.title}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Expanded state — number, title, description (in flow, no overlap) */}
            <AnimatePresence>
              {isActive && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3, delay: 0.12 }}
                  className="absolute inset-0 flex flex-col justify-end p-8"
                >
                  <span
                    className="mb-2 text-[clamp(2.25rem,3vw,3.25rem)] font-bold leading-none text-[var(--red-brand)] opacity-30"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    {step.number}
                  </span>
                  <h3
                    className="mb-3 text-[length:var(--h-card)] font-semibold leading-snug text-[var(--color-text-primary)]"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    {step.title}
                  </h3>
                  <p
                    className="max-w-md text-[length:var(--text-base)] leading-relaxed text-[var(--color-text-secondary)]"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    {step.description}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}
