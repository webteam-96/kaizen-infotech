'use client';

import React, { forwardRef, useId, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils/cn';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  success?: boolean;
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

const shakeVariants = {
  shake: {
    x: [0, -6, 6, -4, 4, -2, 2, 0],
    transition: { duration: 0.5, ease: 'easeInOut' },
  },
  idle: { x: 0 },
};

// ---------------------------------------------------------------------------
// Input component
// ---------------------------------------------------------------------------

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, success, className, id, onFocus, onBlur, onChange: onChangeProp, ...restProps },
  ref
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const errorId = `${inputId}-error`;

  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(
    () => !!restProps.value || !!restProps.defaultValue
  );

  const isFloating = isFocused || hasValue;

  const handleFocus = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      onFocus?.(e);
    },
    [onFocus]
  );

  const handleBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      setHasValue(e.target.value.length > 0);
      onBlur?.(e);
    },
    [onBlur]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setHasValue(e.target.value.length > 0);
      onChangeProp?.(e);
    },
    [onChangeProp]
  );

  // Border color logic
  const borderColor = error
    ? 'var(--color-accent-warm)'
    : success
      ? 'var(--color-accent-secondary)'
      : isFocused
        ? 'var(--color-accent-primary)'
        : 'var(--color-border)';

  // Glow logic
  const glowColor = error
    ? 'rgba(192, 0, 0, 0.15)'
    : success
      ? 'rgba(33, 150, 243, 0.12)'
      : 'rgba(33, 150, 243, 0.1)';

  return (
    <motion.div
      className={cn('relative w-full', className)}
      variants={shakeVariants}
      animate={error ? 'shake' : 'idle'}
    >
      {/* Floating label */}
      <motion.label
        htmlFor={inputId}
        className={cn(
          'pointer-events-none absolute left-0 origin-left',
          'font-[family-name:var(--font-body)]',
          error
            ? 'text-[var(--color-accent-warm)]'
            : isFloating
              ? 'text-[var(--color-text-secondary)]'
              : 'text-[var(--color-text-tertiary)]'
        )}
        animate={{
          y: isFloating ? -22 : 0,
          scale: isFloating ? 0.75 : 1,
          opacity: isFloating ? 1 : 0.7,
        }}
        transition={spring}
        style={{ top: '50%', translateY: '-50%' }}
      >
        {label}
      </motion.label>

      {/* Input */}
      <input
        ref={ref}
        id={inputId}
        className={cn(
          'w-full bg-transparent pb-2 pt-4',
          'text-[length:var(--text-base)] text-[var(--color-text-primary)]',
          'font-[family-name:var(--font-body)]',
          'border-b-2 border-transparent outline-none',
          'transition-colors duration-300',
          'placeholder-transparent'
        )}
        style={{ borderBottomColor: borderColor }}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? errorId : undefined}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onChange={handleChange}
        {...restProps}
      />

      {/* Focus glow */}
      <motion.div
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-px"
        animate={{
          boxShadow: isFocused ? `0 2px 20px 4px ${glowColor}` : '0 0 0 0 transparent',
        }}
        transition={{ duration: 0.3 }}
      />

      {/* Success checkmark */}
      <AnimatePresence>
        {success && !error && (
          <motion.div
            className="absolute right-0 top-1/2 -translate-y-1/2"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={spring}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <motion.path
                d="M4 10.5L8 14.5L16 6.5"
                stroke="var(--color-accent-secondary)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.4, ease: 'easeOut', delay: 0.1 }}
              />
            </svg>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.p
            id={errorId}
            role="alert"
            className="mt-1.5 text-[length:var(--text-xs)] text-[var(--color-accent-warm)]"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
});
