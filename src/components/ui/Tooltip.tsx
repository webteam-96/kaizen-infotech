'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils/cn';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TooltipProps {
  children: React.ReactNode;
  content: string;
  side?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
}

// ---------------------------------------------------------------------------
// Position + arrow styles per side
// ---------------------------------------------------------------------------

const sideStyles: Record<
  NonNullable<TooltipProps['side']>,
  { tooltip: string; arrow: string; origin: string }
> = {
  top: {
    tooltip: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    arrow:
      'left-1/2 -translate-x-1/2 top-full border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-[var(--color-bg-tertiary)]',
    origin: 'origin-bottom',
  },
  bottom: {
    tooltip: 'top-full left-1/2 -translate-x-1/2 mt-2',
    arrow:
      'left-1/2 -translate-x-1/2 bottom-full border-l-4 border-r-4 border-b-4 border-l-transparent border-r-transparent border-b-[var(--color-bg-tertiary)]',
    origin: 'origin-top',
  },
  left: {
    tooltip: 'right-full top-1/2 -translate-y-1/2 mr-2',
    arrow:
      'top-1/2 -translate-y-1/2 left-full border-t-4 border-b-4 border-l-4 border-t-transparent border-b-transparent border-l-[var(--color-bg-tertiary)]',
    origin: 'origin-right',
  },
  right: {
    tooltip: 'left-full top-1/2 -translate-y-1/2 ml-2',
    arrow:
      'top-1/2 -translate-y-1/2 right-full border-t-4 border-b-4 border-r-4 border-t-transparent border-b-transparent border-r-[var(--color-bg-tertiary)]',
    origin: 'origin-left',
  },
};

// ---------------------------------------------------------------------------
// Tooltip
// ---------------------------------------------------------------------------

export function Tooltip({
  children,
  content,
  side = 'top',
  delay = 300,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback(() => {
    timerRef.current = setTimeout(() => setIsVisible(true), delay);
  }, [delay]);

  const hide = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setIsVisible(false);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const styles = sideStyles[side];

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}

      <AnimatePresence>
        {isVisible && (
          <motion.div
            role="tooltip"
            className={cn(
              'absolute z-[var(--z-toast)] pointer-events-none',
              'whitespace-nowrap',
              styles.tooltip
            )}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
          >
            <div
              className={cn(
                'relative rounded-[var(--radius-md)] px-3 py-1.5',
                'bg-[var(--color-bg-tertiary)] border border-[var(--color-border)]',
                'text-[var(--text-xs)] text-[var(--color-text-primary)]',
                'font-[family-name:var(--font-body)]',
                'shadow-[var(--shadow-md)]',
                styles.origin
              )}
            >
              {content}
              {/* Arrow */}
              <span
                aria-hidden
                className={cn('absolute h-0 w-0', styles.arrow)}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
