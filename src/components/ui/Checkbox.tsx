'use client';

import React, { useId, useCallback } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CheckboxProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  label?: React.ReactNode;
  disabled?: boolean;
  id?: string;
  className?: string;
  name?: string;
}

// ---------------------------------------------------------------------------
// Animation config
// ---------------------------------------------------------------------------

const spring = {
  type: 'spring' as const,
  stiffness: 400,
  damping: 25,
  mass: 0.8,
};

// ---------------------------------------------------------------------------
// Checkbox component
// ---------------------------------------------------------------------------

export function Checkbox({
  checked = false,
  onChange,
  label,
  disabled = false,
  id,
  className,
  name,
}: CheckboxProps) {
  const autoId = useId();
  const checkboxId = id ?? autoId;

  const toggle = useCallback(() => {
    if (!disabled) onChange?.(!checked);
  }, [checked, disabled, onChange]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        toggle();
      }
    },
    [toggle]
  );

  return (
    <label
      htmlFor={checkboxId}
      className={cn(
        'inline-flex cursor-pointer items-center gap-3 select-none',
        disabled && 'pointer-events-none opacity-50',
        className
      )}
    >
      {/* Hidden native checkbox for form compatibility */}
      <input
        type="checkbox"
        id={checkboxId}
        name={name}
        checked={checked}
        onChange={toggle}
        disabled={disabled}
        className="sr-only"
      />

      {/* Custom checkbox */}
      <motion.div
        role="checkbox"
        aria-checked={checked}
        tabIndex={disabled ? -1 : 0}
        onKeyDown={handleKeyDown}
        className={cn(
          'relative flex h-5 w-5 shrink-0 items-center justify-center rounded-[var(--radius-sm)]',
          'border-2 transition-colors duration-200 outline-none',
          'focus-visible:ring-2 focus-visible:ring-[var(--color-accent-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg-primary)]',
          checked
            ? 'border-[var(--color-accent-primary)] bg-[var(--color-accent-primary)]'
            : 'border-[var(--color-border)] bg-transparent hover:border-[var(--color-border-hover)]'
        )}
        whileTap={disabled ? undefined : { scale: 0.9 }}
        transition={spring}
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-[var(--color-text-inverse)]"
        >
          <motion.path
            d="M2 6.5L4.5 9L10 3"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={false}
            animate={{
              pathLength: checked ? 1 : 0,
              opacity: checked ? 1 : 0,
            }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          />
        </svg>
      </motion.div>

      {/* Label */}
      {label && (
        <span
          className={cn(
            'text-[var(--text-sm)] text-[var(--color-text-secondary)]',
            'font-[family-name:var(--font-body)]',
            'transition-colors duration-200',
            checked && 'text-[var(--color-text-primary)]'
          )}
        >
          {label}
        </span>
      )}
    </label>
  );
}
