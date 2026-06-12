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
          // Fixed size — no responsive breakpoints. Same dimensions on
          // every viewport so the carousel maths in ServicesScroll stays
          // in lockstep with the visual layout.
          'flex w-full h-auto cursor-pointer flex-col p-10 md:w-[760px] md:h-[760px] md:p-14',
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
              'mb-8 flex h-20 w-20 items-center justify-center rounded-[var(--radius-md)]',
              'bg-[var(--color-surface-glass)] text-[var(--color-accent-primary)]',
              'text-4xl'
            )}
          >
            {icon}
          </div>

          {/* Title — single fixed size */}
          <h3
            className="mb-5 text-4xl font-semibold leading-snug text-[var(--color-text-primary)]"
            style={{ fontFamily: 'var(--font-card-heading), var(--font-heading)' }}
          >
            {title}
          </h3>

          {/* Description — single fixed size */}
          <p
            className="flex-1 text-2xl leading-relaxed text-[var(--color-text-primary)]"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            {description}
          </p>
        </div>
      </Card>
    </motion.div>
  );
}
