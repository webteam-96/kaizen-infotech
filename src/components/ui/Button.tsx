'use client';

import React, { useRef, useState, useCallback, forwardRef } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import Link from 'next/link';
import { cn } from '@/lib/utils/cn';
import { useMagnetic } from '@/hooks/useMagnetic';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'icon' | 'pill';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  magnetic?: boolean;
  href?: string;
}

// ---------------------------------------------------------------------------
// Size maps
// ---------------------------------------------------------------------------

const sizeClasses = {
  sm: 'px-4 py-1.5 text-[var(--text-xs)] gap-1.5',
  md: 'px-6 py-2.5 text-[var(--text-sm)] gap-2',
  lg: 'px-8 py-3.5 text-[var(--text-base)] gap-2.5',
} as const;

const iconSizeClasses = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-12 w-12',
} as const;

const spinnerSizeClasses = {
  sm: 'h-3.5 w-3.5',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
} as const;

const pillSizeClasses = {
  sm: 'px-3 py-1 text-[var(--text-xs)] gap-1',
  md: 'px-4 py-1.5 text-[var(--text-xs)] gap-1.5',
  lg: 'px-6 py-2.5 text-[var(--text-sm)] gap-2',
} as const;

// Framer Motion spring matching design system's --transition-spring
const spring = {
  type: 'spring' as const,
  stiffness: 400,
  damping: 25,
  mass: 0.8,
};

// ---------------------------------------------------------------------------
// Ripple sub-component
// ---------------------------------------------------------------------------

interface RippleItem {
  id: number;
  x: number;
  y: number;
}

function Ripple({
  x,
  y,
  onComplete,
}: {
  x: number;
  y: number;
  onComplete: () => void;
}) {
  return (
    <motion.span
      className="pointer-events-none absolute rounded-full bg-[var(--color-accent-primary)]"
      style={{ left: x, top: y, x: '-50%', y: '-50%' }}
      initial={{ width: 0, height: 0, opacity: 0.35 }}
      animate={{ width: 300, height: 300, opacity: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      onAnimationComplete={onComplete}
    />
  );
}

// ---------------------------------------------------------------------------
// Loading spinner
// ---------------------------------------------------------------------------

function Spinner({ size }: { size: 'sm' | 'md' | 'lg' }) {
  return (
    <svg
      className={cn('animate-spin', spinnerSizeClasses[size])}
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
      />
      <path
        className="opacity-75"
        d="M4 12a8 8 0 018-8v3a5 5 0 00-5 5H4z"
        fill="currentColor"
      />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// AnimatePresence variants for text <-> spinner swap
// ---------------------------------------------------------------------------

const contentVariants: Variants = {
  initial: { opacity: 0, y: 8, filter: 'blur(4px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  exit: { opacity: 0, y: -8, filter: 'blur(4px)' },
};

// ---------------------------------------------------------------------------
// Button
// ---------------------------------------------------------------------------

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      magnetic = false,
      href,
      className,
      children,
      disabled,
      onClick,
      ...props
    },
    forwardedRef
  ) {
    const innerRef = useRef<HTMLButtonElement>(null);
    const buttonRef =
      (forwardedRef as React.RefObject<HTMLButtonElement>) ?? innerRef;

    // Magnetic effect via the existing GSAP hook
    useMagnetic(magnetic ? buttonRef : { current: null }, {
      strength: 0.25,
      distance: 80,
    });

    // ---- Ripple state (primary variant only) ----
    const [ripples, setRipples] = useState<RippleItem[]>([]);
    const rippleIdRef = useRef(0);

    const handleClick = useCallback(
      (e: React.MouseEvent<HTMLButtonElement>) => {
        if (variant === 'primary' && !disabled && !isLoading) {
          const rect = e.currentTarget.getBoundingClientRect();
          const id = ++rippleIdRef.current;
          setRipples((prev) => [
            ...prev,
            { id, x: e.clientX - rect.left, y: e.clientY - rect.top },
          ]);
        }
        onClick?.(e);
      },
      [variant, disabled, isLoading, onClick]
    );

    const removeRipple = useCallback((id: number) => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    }, []);

    // ---- Framer Motion hover/tap per variant ----
    const motionProps = getMotionProps(variant, disabled || isLoading);

    // ---- Class composition ----
    const isDisabled = disabled || isLoading;

    const baseClasses = cn(
      'group relative inline-flex items-center justify-center',
      'font-medium font-[family-name:var(--font-heading)]',
      'select-none overflow-hidden outline-none cursor-pointer',
      'focus-visible:ring-2 focus-visible:ring-[var(--color-accent-primary)]',
      'focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg-primary)]',
      'transition-colors'
    );

    const disabledClasses = isDisabled
      ? 'opacity-50 pointer-events-none cursor-not-allowed'
      : '';

    const variantClasses = getVariantClasses(variant, size);
    const combined = cn(baseClasses, variantClasses, disabledClasses, className);

    // ---- Inner content ----
    const inner = (
      <>
        {/* Primary: accent fill overlay that animates via group-hover */}
        {variant === 'primary' && (
          <span
            aria-hidden
            className={cn(
              'pointer-events-none absolute inset-0',
              'bg-[var(--color-bg-inverse)]',
              'transition-[clip-path] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]',
              '[clip-path:inset(0_100%_0_0)]',
              'group-hover:[clip-path:inset(0_0_0_0)]'
            )}
          />
        )}

        {/* Primary: ripple container */}
        {variant === 'primary' && ripples.length > 0 && (
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 overflow-hidden"
          >
            {ripples.map((r) => (
              <Ripple
                key={r.id}
                x={r.x}
                y={r.y}
                onComplete={() => removeRipple(r.id)}
              />
            ))}
          </span>
        )}

        {/* Ghost: dashed border that appears on hover */}
        {variant === 'ghost' && (
          <span
            aria-hidden
            className={cn(
              'pointer-events-none absolute inset-0 rounded-[inherit]',
              'border border-dashed border-transparent',
              'transition-colors duration-300',
              'group-hover:border-[var(--color-border-hover)]'
            )}
          />
        )}

        {/* Text / spinner with AnimatePresence */}
        <AnimatePresence mode="wait" initial={false}>
          {isLoading ? (
            <motion.span
              key="spinner"
              className="relative z-10 flex items-center justify-center"
              variants={contentVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.2 }}
            >
              <Spinner size={size} />
            </motion.span>
          ) : (
            <motion.span
              key="content"
              className="relative z-10 flex items-center justify-center gap-[inherit]"
              variants={contentVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.2 }}
            >
              {leftIcon && <span className="shrink-0">{leftIcon}</span>}
              {children}
              {rightIcon && <span className="shrink-0">{rightIcon}</span>}
            </motion.span>
          )}
        </AnimatePresence>
      </>
    );

    // ---- Render as Next.js Link when href is provided ----
    if (href) {
      return (
        <motion.span
          ref={buttonRef as React.RefObject<HTMLSpanElement>}
          className={combined}
          role="link"
          {...motionProps}
        >
          <Link
            href={href}
            className="inline-flex h-full w-full items-center justify-center gap-[inherit]"
            tabIndex={isDisabled ? -1 : 0}
          >
            {inner}
          </Link>
        </motion.span>
      );
    }

    // ---- Default: render as <button> ----
    return (
      <motion.button
        ref={buttonRef}
        className={combined}
        disabled={isDisabled}
        onClick={handleClick}
        {...motionProps}
        {...(props as React.ComponentProps<typeof motion.button>)}
      >
        {inner}
      </motion.button>
    );
  }
);

// ---------------------------------------------------------------------------
// Variant classes
// ---------------------------------------------------------------------------

function getVariantClasses(
  variant: ButtonProps['variant'],
  size: NonNullable<ButtonProps['size']>
) {
  switch (variant) {
    case 'primary':
      return cn(
        'rounded-[var(--radius-md)]',
        'bg-[var(--color-accent-primary)] text-[var(--color-text-inverse)]',
        'hover:brightness-110',
        sizeClasses[size]
      );

    case 'secondary':
      return cn(
        'rounded-[var(--radius-md)]',
        'border border-[var(--color-accent-primary)]/40',
        'bg-transparent text-[var(--color-text-primary)]',
        'hover:border-[var(--color-accent-primary)] hover:bg-[var(--color-accent-primary)]/5',
        sizeClasses[size]
      );

    case 'ghost':
      return cn(
        'rounded-[var(--radius-md)]',
        'border border-transparent bg-transparent',
        'text-[var(--color-text-secondary)]',
        'hover:bg-[var(--color-surface-glass)] hover:text-[var(--color-text-primary)]',
        sizeClasses[size]
      );

    case 'icon':
      return cn(
        'rounded-full bg-transparent',
        'text-[var(--color-text-secondary)]',
        'hover:bg-[var(--color-surface-glass)] hover:text-[var(--color-text-primary)]',
        'p-0',
        iconSizeClasses[size]
      );

    case 'pill':
      return cn(
        'rounded-[var(--radius-full)]',
        'bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)]',
        'border border-[var(--color-border)]',
        'hover:text-[var(--color-text-primary)] hover:border-[var(--color-border-hover)]',
        pillSizeClasses[size]
      );

    default:
      return sizeClasses[size];
  }
}

// ---------------------------------------------------------------------------
// Motion props per variant
// ---------------------------------------------------------------------------

function getMotionProps(
  variant: ButtonProps['variant'],
  isDisabled: boolean | undefined
) {
  if (isDisabled) return {};

  const base = {
    whileFocus: { scale: 1.01 },
    transition: spring,
  };

  switch (variant) {
    case 'primary':
      return {
        ...base,
        whileHover: { scale: 1.02 },
        whileTap: { scale: 0.97 },
      };

    case 'secondary':
      return {
        ...base,
        whileHover: { scale: 1.01 },
        whileTap: { scale: 0.98 },
      };

    case 'ghost':
      return {
        ...base,
        whileHover: { scale: 1.01 },
        whileTap: { scale: 0.98 },
      };

    case 'icon':
      return {
        ...base,
        whileHover: { scale: 1.08, rotate: 15 },
        whileTap: { scale: 0.92 },
      };

    case 'pill':
      return {
        ...base,
        whileHover: { y: -2, boxShadow: '0 8px 24px rgba(0,0,0,0.1)' },
        whileTap: { scale: 0.97, y: 0 },
      };

    default:
      return base;
  }
}
