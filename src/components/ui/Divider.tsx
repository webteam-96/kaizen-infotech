'use client';

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { cn } from '@/lib/utils/cn';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  accent?: boolean;
  animated?: boolean;
  className?: string;
}

// ---------------------------------------------------------------------------
// Divider component
// ---------------------------------------------------------------------------

export function Divider({
  orientation = 'horizontal',
  accent = false,
  animated = false,
  className,
}: DividerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  const isHorizontal = orientation === 'horizontal';

  // Static (non-animated) divider
  if (!animated) {
    return (
      <div
        className={cn(
          isHorizontal ? 'h-px w-full' : 'h-full w-px',
          accent
            ? 'bg-gradient-to-r from-transparent via-[var(--color-accent-primary)]/40 to-transparent'
            : 'bg-[var(--color-border)]',
          !isHorizontal &&
            accent &&
            'bg-gradient-to-b from-transparent via-[var(--color-accent-primary)]/40 to-transparent',
          className
        )}
        role="separator"
        aria-orientation={orientation}
      />
    );
  }

  // Animated: line draws from center outward on scroll
  return (
    <div
      ref={ref}
      className={cn(
        isHorizontal ? 'h-px w-full' : 'h-full w-px',
        'overflow-hidden',
        className
      )}
      role="separator"
      aria-orientation={orientation}
    >
      <motion.div
        className={cn(
          'h-full w-full',
          accent
            ? isHorizontal
              ? 'bg-gradient-to-r from-transparent via-[var(--color-accent-primary)]/40 to-transparent'
              : 'bg-gradient-to-b from-transparent via-[var(--color-accent-primary)]/40 to-transparent'
            : 'bg-[var(--color-border)]'
        )}
        initial={{
          scaleX: isHorizontal ? 0 : 1,
          scaleY: isHorizontal ? 1 : 0,
        }}
        animate={
          isInView
            ? { scaleX: 1, scaleY: 1 }
            : {
                scaleX: isHorizontal ? 0 : 1,
                scaleY: isHorizontal ? 1 : 0,
              }
        }
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        style={{ transformOrigin: 'center' }}
      />
    </div>
  );
}
