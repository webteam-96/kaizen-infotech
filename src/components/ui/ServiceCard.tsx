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
          // The card always FILLS its parent deck cell (w-full h-full). On
          // phones / iPad-portrait that cell is a measured, viewport-fitted box
          // sized by ServicesScroll; at >=820px the explicit 800×860 below pins
          // it to the desktop geometry the carousel maths depends on.
          // NB: no `sm:` step — in this Tailwind v4 setup `sm:` sorts AFTER an
          // arbitrary `min-[820px]:` and would override it, leaving desktop at the
          // tablet size. base -> min-[820px]: keeps the >=820 desktop box intact.
          'card-services',
          'flex w-full h-full cursor-pointer flex-col p-6 min-[820px]:w-[800px] min-[820px]:h-[860px] min-[820px]:p-14',
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
              'mb-5 min-[820px]:mb-8 flex h-14 w-14 min-[820px]:h-20 min-[820px]:w-20 items-center justify-center rounded-[var(--radius-md)]',
              'bg-[rgba(192,0,0,0.08)] text-[var(--color-accent-warm)] ring-1 ring-[rgba(192,0,0,0.18)]',
              'text-4xl'
            )}
          >
            {icon}
          </div>

          {/* Title — single fixed size */}
          <h3
            className="mb-3 min-[820px]:mb-5 text-xl min-[820px]:text-4xl font-semibold leading-snug text-[var(--color-text-primary)]"
            style={{ fontFamily: 'var(--font-card-heading), var(--font-heading)' }}
          >
            {title}
          </h3>

          {/* Description — single fixed size */}
          <p
            className="flex-1 text-base min-[820px]:text-2xl leading-relaxed text-[var(--color-text-primary)]"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            {description}
          </p>
        </div>
      </Card>
    </motion.div>
  );
}
