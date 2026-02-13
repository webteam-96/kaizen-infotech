'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { cn } from '@/lib/utils/cn';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TestimonialCardProps {
  quote: string;
  clientName: string;
  clientRole: string;
  clientCompany: string;
  clientImage?: string;
  isActive?: boolean;
}

// ---------------------------------------------------------------------------
// Spring config
// ---------------------------------------------------------------------------

const spring = {
  type: 'spring' as const,
  stiffness: 300,
  damping: 25,
  mass: 0.8,
};

// ---------------------------------------------------------------------------
// TestimonialCard component
// ---------------------------------------------------------------------------

export function TestimonialCard({
  quote,
  clientName,
  clientRole,
  clientCompany,
  clientImage,
  isActive = true,
}: TestimonialCardProps) {
  return (
    <motion.article
      className={cn(
        'relative flex flex-col rounded-[var(--radius-lg)] p-8 md:p-10',
        'border border-[var(--color-border)]',
        'bg-[var(--color-bg-tertiary)]',
        'backdrop-blur-[var(--blur-md)]',
        'transition-all duration-500'
      )}
      style={{
        background: isActive
          ? 'linear-gradient(135deg, var(--color-surface-glass), var(--color-bg-tertiary))'
          : 'var(--color-bg-tertiary)',
      }}
      animate={{
        opacity: isActive ? 1 : 0.4,
        scale: isActive ? 1 : 0.95,
        filter: isActive ? 'blur(0px)' : 'blur(2px)',
      }}
      transition={spring}
    >
      {/* Decorative open quote */}
      <span
        aria-hidden
        className="pointer-events-none absolute -top-2 left-6 select-none text-[8rem] font-bold leading-none text-[var(--color-accent-primary)] opacity-15"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        &ldquo;
      </span>

      {/* Quote text */}
      <blockquote className="relative z-10 mb-8 flex-1">
        <p
          className="text-[length:var(--text-xl)] leading-relaxed text-[var(--color-text-primary)] md:text-[length:var(--text-2xl)]"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {quote}
        </p>
      </blockquote>

      {/* Decorative close quote */}
      <span
        aria-hidden
        className="pointer-events-none absolute -bottom-6 right-6 select-none text-[8rem] font-bold leading-none text-[var(--color-accent-primary)] opacity-10"
        style={{ fontFamily: 'var(--font-display)', transform: 'rotate(180deg)' }}
      >
        &ldquo;
      </span>

      {/* Divider */}
      <div className="mb-6 h-px w-16 bg-[var(--color-accent-primary)] opacity-40" />

      {/* Client info */}
      <div className="relative z-10 flex items-center gap-4">
        {/* Avatar */}
        {clientImage && (
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border border-[var(--color-border)]">
            <Image
              src={clientImage}
              alt={clientName}
              fill
              sizes="48px"
              className="object-cover"
            />
          </div>
        )}

        <div>
          <p
            className="text-[length:var(--text-base)] font-semibold text-[var(--color-text-primary)]"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            {clientName}
          </p>
          <p
            className="text-[length:var(--text-sm)] text-[var(--color-text-secondary)]"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            {clientRole}, {clientCompany}
          </p>
        </div>
      </div>
    </motion.article>
  );
}
