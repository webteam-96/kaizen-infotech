'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'accent' | 'outline';
  children: React.ReactNode;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const spring = {
  type: 'spring' as const,
  stiffness: 400,
  damping: 25,
  mass: 0.8,
};

const variantClasses: Record<NonNullable<BadgeProps['variant']>, string> = {
  default: cn(
    'bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] border border-[var(--color-border)]',
    'hover:text-[var(--color-text-primary)] hover:border-[var(--color-border-hover)]'
  ),
  accent: cn(
    'bg-[var(--color-accent-primary)]/10 text-[var(--color-accent-primary)] border border-[var(--color-accent-primary)]/20',
    'hover:bg-[var(--color-accent-primary)]/15 hover:border-[var(--color-accent-primary)]/40'
  ),
  outline: cn(
    'bg-transparent text-[var(--color-text-secondary)] border border-[var(--color-border)]',
    'hover:text-[var(--color-text-primary)] hover:border-[var(--color-accent-primary)]/40'
  ),
};

// ---------------------------------------------------------------------------
// Badge component
// ---------------------------------------------------------------------------

export function Badge({
  variant = 'default',
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <motion.span
      className={cn(
        'inline-flex items-center rounded-[var(--radius-full)] px-3 py-1',
        'text-[var(--text-xs)] font-medium font-[family-name:var(--font-heading)]',
        'select-none transition-colors cursor-default',
        variantClasses[variant],
        className
      )}
      whileHover={{ y: -2, boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}
      transition={spring}
      {...(props as React.ComponentProps<typeof motion.span>)}
    >
      {children}
    </motion.span>
  );
}
