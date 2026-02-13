'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TestimonialCard } from '@/components/ui/TestimonialCard';
import { FadeIn } from '@/components/animation/FadeIn';
import { testimonials } from '@/content/testimonials';
import { cn } from '@/lib/utils/cn';

const AUTO_PLAY_INTERVAL = 6000;

export function Testimonials() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const next = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
  }, []);

  const goTo = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

  // Auto-play
  useEffect(() => {
    if (isPaused) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(next, AUTO_PLAY_INTERVAL);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPaused, next]);

  return (
    <section
      data-section-index={6}
      className="bg-[var(--color-bg-secondary)] py-[var(--space-section)]"
    >
      <div className="mx-auto max-w-[var(--container-max)] px-[var(--container-padding)]">
        {/* Section header */}
        <FadeIn direction="up" className="mb-16 text-center">
          <span
            className="text-[length:var(--text-xs)] font-medium uppercase tracking-widest text-[var(--color-text-tertiary)]"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Client Voices
          </span>
          <h2
            className={cn(
              'mt-3 font-[family-name:var(--font-display)]',
              'text-[clamp(2rem,4vw,3rem)] leading-tight tracking-tight',
              'text-[var(--color-text-primary)]'
            )}
          >
            What our clients say
          </h2>
        </FadeIn>

        {/* Carousel area */}
        <div
          className="relative"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Large decorative quote marks */}
          <div
            aria-hidden
            className="pointer-events-none absolute -top-8 left-4 select-none text-[12rem] font-bold leading-none text-[var(--color-accent-primary)] opacity-[0.06]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            &ldquo;
          </div>

          {/* Cards */}
          <div className="mx-auto max-w-3xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                <TestimonialCard
                  quote={testimonials[activeIndex].quote}
                  clientName={testimonials[activeIndex].clientName}
                  clientRole={testimonials[activeIndex].clientRole}
                  clientCompany={testimonials[activeIndex].clientCompany}
                  clientImage={testimonials[activeIndex].clientImage}
                  isActive
                />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation dots */}
          <div className="mt-10 flex items-center justify-center gap-3">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`Go to testimonial ${i + 1}`}
                className={cn(
                  'relative h-3 w-3 rounded-full transition-all duration-300',
                  i === activeIndex
                    ? 'scale-125 bg-[var(--color-accent-primary)]'
                    : 'bg-[var(--color-border)] hover:bg-[var(--color-text-tertiary)]'
                )}
              >
                {/* Active ring */}
                {i === activeIndex && (
                  <motion.span
                    className="absolute inset-[-3px] rounded-full border-2 border-[var(--color-accent-primary)]"
                    layoutId="testimonial-ring"
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
