'use client';

import { useEffect, useRef, useState } from 'react';

interface UseScrollRevealOptions {
  /** Fraction of the element visible before it reveals. */
  threshold?: number;
  /** IntersectionObserver rootMargin. */
  rootMargin?: string;
  /** Reveal once then stop observing (default). Set false to re-hide on exit. */
  once?: boolean;
}

/**
 * Dependency-free scroll-reveal trigger built on IntersectionObserver.
 * Returns a `ref` to attach to the target and a `revealed` boolean that flips
 * true the first time the element scrolls into view. Unobserves after the first
 * reveal (when `once`). Falls back to revealed:true where IO is unavailable
 * (SSR / old browsers) so content is never stuck hidden.
 */
export function useScrollReveal<T extends Element = HTMLDivElement>(
  options: UseScrollRevealOptions = {}
) {
  const { threshold = 0.15, rootMargin = '0px 0px -8% 0px', once = true } = options;
  const ref = useRef<T | null>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      setRevealed(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setRevealed(true);
            if (once) observer.unobserve(entry.target);
          } else if (!once) {
            setRevealed(false);
          }
        }
      },
      { threshold, rootMargin }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin, once]);

  return { ref, revealed };
}
