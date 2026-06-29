'use client';

import { cn } from '@/lib/utils/cn';
import { useScrollReveal } from '@/hooks/useScrollReveal';

type RevealVariant = 'up' | 'sm';

interface RevealProps {
  children: React.ReactNode;
  /** "up" = translateY(40px)→0 fade over .8s; "sm" = translateY(20px)+scale(.96) over .55s. */
  variant?: RevealVariant;
  /** Stagger index — multiplied by a per-variant step (up: 90ms, sm: 70ms). */
  index?: number;
  /** Explicit transition-delay in ms (overrides index). */
  delay?: number;
  className?: string;
}

/**
 * Wraps children and reveals them once they scroll into view (IntersectionObserver
 * via useScrollReveal). Animates opacity + transform only; all timing/easing lives
 * in globals.css (.reveal / .reveal-up / .reveal-sm) using the brand easing token,
 * and is disabled under prefers-reduced-motion.
 */
export function Reveal({ children, variant = 'up', index = 0, delay, className }: RevealProps) {
  const { ref, revealed } = useScrollReveal<HTMLDivElement>();
  const ms = delay ?? index * (variant === 'sm' ? 70 : 90);

  return (
    <div
      ref={ref}
      className={cn('reveal', `reveal-${variant}`, revealed && 'is-revealed', className)}
      style={{ transitionDelay: `${ms}ms` }}
    >
      {children}
    </div>
  );
}
