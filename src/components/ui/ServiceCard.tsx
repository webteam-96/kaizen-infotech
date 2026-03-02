'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';
import { Card } from './Card';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ServiceCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  index?: number;
  isActive?: boolean;
  onClick?: () => void;
}

// ---------------------------------------------------------------------------
// Animation spring
// ---------------------------------------------------------------------------

const spring = {
  type: 'spring' as const,
  stiffness: 300,
  damping: 25,
  mass: 0.8,
};

// ---------------------------------------------------------------------------
// ServiceCard component
// ---------------------------------------------------------------------------

export function ServiceCard({
  icon,
  title,
  description,
  isActive = false,
  onClick,
}: ServiceCardProps) {
  return (
    <motion.div
      className="shrink-0"
      animate={{ scale: isActive ? 1.03 : 1 }}
      transition={spring}
    >
      <Card
        className={cn(
          'flex w-[280px] min-h-[340px] cursor-pointer flex-col p-6 sm:w-[320px] sm:min-h-[380px] sm:p-7 md:w-[350px] md:min-h-[400px] md:p-8',
          'transition-shadow duration-300',
          isActive && 'shadow-[0_0_40px_var(--color-glow)]'
        )}
        tilt
        glow={isActive}
        hoverScale={isActive ? 1.02 : 1.01}
        as="article"
      >
        <div className="flex flex-1 flex-col" onClick={onClick}>
          {/* Icon */}
          <div
            className={cn(
              'mb-5 flex h-12 w-12 items-center justify-center rounded-[var(--radius-md)]',
              'bg-[var(--color-surface-glass)] text-[var(--color-accent-primary)]',
              'text-xl'
            )}
          >
            {icon}
          </div>

          {/* Title */}
          <h3
            className="mb-2.5 text-lg font-semibold leading-snug text-[var(--color-text-primary)]"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            {title}
          </h3>

          {/* Description */}
          <p
            className="flex-1 text-sm leading-relaxed text-[var(--color-text-secondary)]"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            {description}
          </p>
        </div>

        {/* CTA link */}
        <div className="mt-5 pt-4 border-t border-[var(--color-border)]">
          <span
            className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-accent-primary)] transition-colors duration-200 group-hover:text-[var(--color-text-primary)]"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            Learn More
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="transition-transform duration-200 group-hover:translate-x-1"
            >
              <path
                d="M3 8H13M13 8L9 4M13 8L9 12"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </div>
      </Card>
    </motion.div>
  );
}
