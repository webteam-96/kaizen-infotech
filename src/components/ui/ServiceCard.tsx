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
  index: number;
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

// Icon entrance variants — unique per index cycle
const iconVariants = [
  {
    initial: { opacity: 0, y: -20, rotate: -15 },
    animate: { opacity: 1, y: 0, rotate: 0 },
  },
  {
    initial: { opacity: 0, scale: 0.5 },
    animate: { opacity: 1, scale: 1 },
  },
  {
    initial: { opacity: 0, x: -20, rotate: 15 },
    animate: { opacity: 1, x: 0, rotate: 0 },
  },
  {
    initial: { opacity: 0, y: 20, scale: 0.8 },
    animate: { opacity: 1, y: 0, scale: 1 },
  },
];

// ---------------------------------------------------------------------------
// ServiceCard component
// ---------------------------------------------------------------------------

export function ServiceCard({
  icon,
  title,
  description,
  index,
  isActive = false,
  onClick,
}: ServiceCardProps) {
  const iconVariant = iconVariants[index % iconVariants.length];

  return (
    <motion.div
      className="shrink-0"
      animate={{
        scale: isActive ? 1.05 : 1,
        filter: isActive ? 'brightness(1)' : 'brightness(0.8)',
      }}
      transition={spring}
    >
      <Card
        className={cn(
          'flex w-[350px] min-h-[400px] cursor-pointer flex-col justify-between p-8',
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
          <motion.div
            className={cn(
              'mb-6 flex h-14 w-14 items-center justify-center rounded-[var(--radius-md)]',
              'bg-[var(--color-surface-glass)] text-[var(--color-accent-primary)]',
              'text-2xl'
            )}
            variants={iconVariant}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            transition={{ ...spring, delay: index * 0.1 }}
          >
            {icon}
          </motion.div>

          {/* Title */}
          <h3
            className="mb-3 text-[length:var(--text-xl)] font-semibold text-[var(--color-text-primary)]"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            {title}
          </h3>

          {/* Description */}
          <p
            className="flex-1 text-[length:var(--text-sm)] leading-relaxed text-[var(--color-text-secondary)]"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            {description}
          </p>
        </div>

        {/* Bottom: arrow CTA that reveals on hover */}
        <motion.div
          className="mt-6 flex items-center justify-between border-t border-[var(--color-border)] pt-4"
          initial={{ opacity: 0, height: 0, marginTop: 0, paddingTop: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <span
            className="text-[length:var(--text-xs)] font-medium uppercase tracking-wider text-[var(--color-text-tertiary)] transition-colors duration-200 group-hover:text-[var(--color-accent-primary)]"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Learn more
          </span>

          {/* Arrow that slides in on hover */}
          <motion.span
            className="text-[var(--color-accent-primary)]"
            initial={{ x: -8, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2, ...spring }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4 10H16M16 10L11 5M16 10L11 15"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </motion.span>
        </motion.div>
      </Card>
    </motion.div>
  );
}
