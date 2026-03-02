'use client';

import React, {
  forwardRef,
  useId,
  useState,
  useCallback,
  useRef,
  useEffect,
} from 'react';
import { motion, AnimatePresence, useSpring, useTransform } from 'framer-motion';
import { cn } from '@/lib/utils/cn';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  maxLength?: number;
  showCount?: boolean;
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
// Animated character counter
// ---------------------------------------------------------------------------

function CharCounter({ count, max }: { count: number; max: number }) {
  const springCount = useSpring(count, { stiffness: 300, damping: 30 });
  const displayCount = useTransform(springCount, (v) => Math.round(v));
  const [rendered, setRendered] = useState(String(count));

  useEffect(() => {
    springCount.set(count);
  }, [count, springCount]);

  useEffect(() => {
    const unsub = displayCount.on('change', (v) => setRendered(String(v)));
    return unsub;
  }, [displayCount]);

  const isNearLimit = count / max > 0.9;

  return (
    <span
      className={cn(
        'text-[length:var(--text-xs)] tabular-nums transition-colors duration-200',
        isNearLimit
          ? 'text-[var(--color-accent-warm)]'
          : 'text-[var(--color-text-tertiary)]'
      )}
    >
      {rendered}/{max}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Textarea component
// ---------------------------------------------------------------------------

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea(
    {
      label,
      error,
      maxLength,
      showCount = false,
      className,
      id,
      onFocus,
      onBlur,
      onChange: onChangeProp,
      ...restProps
    },
    ref
  ) {
    const autoId = useId();
    const textareaId = id ?? autoId;
    const errorId = `${textareaId}-error`;

    const innerRef = useRef<HTMLTextAreaElement | null>(null);
    const [isFocused, setIsFocused] = useState(false);
    const [hasValue, setHasValue] = useState(
      () => !!restProps.value || !!restProps.defaultValue
    );
    const [charCount, setCharCount] = useState(() => {
      const val = (restProps.value ?? restProps.defaultValue ?? '') as string;
      return val.length;
    });

    const isFloating = isFocused || hasValue;

    // Auto-resize
    const adjustHeight = useCallback(() => {
      const el = innerRef.current;
      if (!el) return;
      el.style.height = 'auto';
      el.style.height = `${el.scrollHeight}px`;
    }, []);

    useEffect(() => {
      adjustHeight();
    }, [restProps.value, adjustHeight]);

    const handleFocus = useCallback(
      (e: React.FocusEvent<HTMLTextAreaElement>) => {
        setIsFocused(true);
        onFocus?.(e);
      },
      [onFocus]
    );

    const handleBlur = useCallback(
      (e: React.FocusEvent<HTMLTextAreaElement>) => {
        setIsFocused(false);
        setHasValue(e.target.value.length > 0);
        onBlur?.(e);
      },
      [onBlur]
    );

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setHasValue(e.target.value.length > 0);
        setCharCount(e.target.value.length);
        adjustHeight();
        onChangeProp?.(e);
      },
      [onChangeProp, adjustHeight]
    );

    // Merge refs
    const mergedRef = useCallback(
      (node: HTMLTextAreaElement | null) => {
        innerRef.current = node;
        if (typeof ref === 'function') ref(node);
        else if (ref) (ref as React.MutableRefObject<HTMLTextAreaElement | null>).current = node;
      },
      [ref]
    );

    // Border color
    const borderColor = error
      ? 'var(--color-accent-warm)'
      : isFocused
        ? 'var(--color-accent-primary)'
        : 'var(--color-border)';

    // Glow color
    const glowColor = error
      ? 'rgba(192, 0, 0, 0.15)'
      : 'rgba(33, 150, 243, 0.1)';

    return (
      <motion.div
        className={cn('relative w-full', className)}
        variants={shakeVariants}
        animate={error ? 'shake' : 'idle'}
      >
        {/* Floating label */}
        <motion.label
          htmlFor={textareaId}
          className={cn(
            'pointer-events-none absolute left-0 top-4 origin-left',
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
        >
          {label}
        </motion.label>

        {/* Textarea */}
        <textarea
          ref={mergedRef}
          id={textareaId}
          className={cn(
            'w-full resize-none overflow-hidden bg-transparent pb-2 pt-4',
            'text-[length:var(--text-base)] text-[var(--color-text-primary)]',
            'font-[family-name:var(--font-body)]',
            'border-b-2 border-transparent outline-none',
            'placeholder-transparent',
            'min-h-[3rem]'
          )}
          style={{
            borderBottomColor: borderColor,
            transition: 'border-color 0.3s, height 0.2s ease',
          }}
          rows={1}
          maxLength={maxLength}
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
            boxShadow: isFocused
              ? `0 2px 20px 4px ${glowColor}`
              : '0 0 0 0 transparent',
          }}
          transition={{ duration: 0.3 }}
        />

        {/* Bottom bar: error + character counter */}
        <div className="mt-1.5 flex items-start justify-between gap-4">
          <AnimatePresence>
            {error && (
              <motion.p
                id={errorId}
                role="alert"
                className="text-[length:var(--text-xs)] text-[var(--color-accent-warm)]"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2 }}
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          {showCount && maxLength && (
            <div className="ml-auto shrink-0">
              <CharCounter count={charCount} max={maxLength} />
            </div>
          )}
        </div>
      </motion.div>
    );
  }
);
