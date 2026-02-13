'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useInView } from '@/hooks';
import { cn } from '@/lib/utils/cn';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface StatNumberProps {
  number: number;
  suffix?: string;
  label: string;
  className?: string;
}

// ---------------------------------------------------------------------------
// StatNumber — animated stat counter with label fade-in
// ---------------------------------------------------------------------------

export function StatNumber({
  number: target,
  suffix,
  label,
  className,
}: StatNumberProps) {
  const { ref, isInView } = useInView<HTMLDivElement>({
    once: true,
    threshold: 0.3,
  });

  const [current, setCurrent] = useState(0);
  const [showLabel, setShowLabel] = useState(false);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!isInView || hasAnimated.current) return;
    hasAnimated.current = true;

    const duration = 2000; // ms
    const steps = 60;
    const stepDuration = duration / steps;
    const labelThreshold = 0.8;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      // Ease-out quad
      const eased = 1 - (1 - progress) * (1 - progress);
      const value = Math.round(eased * target);

      setCurrent(value);

      if (progress >= labelThreshold && !showLabel) {
        setShowLabel(true);
      }

      if (step >= steps) {
        clearInterval(timer);
        setCurrent(target);
        setShowLabel(true);
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [isInView, target, showLabel]);

  return (
    <div ref={ref} className={cn('text-center', className)}>
      {/* Number */}
      <div
        className={cn(
          'font-[family-name:var(--font-display)]',
          'text-[length:var(--text-mega)]',
          'leading-none tracking-tight',
          'text-[var(--color-text-primary)]'
        )}
      >
        {current}
        {suffix && (
          <span className="text-[var(--color-accent-primary)]">{suffix}</span>
        )}
      </div>

      {/* Label — fades in after number reaches ~80% */}
      <p
        className={cn(
          'mt-2 text-[var(--text-sm)] text-[var(--color-text-secondary)]',
          'font-[family-name:var(--font-heading)]',
          'transition-opacity duration-500 ease-[var(--ease-out-expo)]',
          showLabel ? 'opacity-100' : 'opacity-0'
        )}
      >
        {label}
      </p>
    </div>
  );
}
