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
  // Compact = phones + all iPads: smaller padding / icon / type so the spotlight
  // card fits a viewport-fitted box. Desktop (mouse) leaves this false for the
  // large 800×860 deck geometry. Capability-driven by ServicesScroll — NOT a
  // width breakpoint, so an iPad held at ≥820px no longer gets desktop sizing.
  compact?: boolean;
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
  compact = false,
}: ServiceCardProps) {
  return (
    <motion.div
      // h-full w-full: the card must FILL its parent box (the fixed-size deck
      // card / grid cell). Without this the wrapper is auto-height, so the inner
      // Card's `h-full` collapsed to the content height and every card sized to
      // its own copy — visibly different heights. Filling the box makes the
      // `fill` + `justify-center` below actually centre content in a uniform box.
      className="h-full w-full shrink-0"
      animate={{ scale: isActive ? 1.03 : 1 }}
      transition={spring}
    >
      <Card
        className={cn(
          // The card always FILLS its parent box (w-full h-full); ServicesScroll
          // sizes that box per device (a viewport-fitted compact box on touch,
          // the 800×860 deck box on mouse desktops). Padding/type scale via the
          // `compact` prop — capability-driven, not a width breakpoint — so iPads
          // get the smaller card even at ≥820px.
          'card-services',
          'flex w-full h-full cursor-pointer flex-col',
          compact ? 'p-5' : 'p-14',
          'transition-shadow duration-300',
          isActive && 'shadow-[0_0_40px_var(--color-glow)]'
        )}
        tilt
        glow={isActive}
        hoverScale={isActive ? 1.02 : 1.01}
        as="article"
        fill
      >
        {/* justify-center: with a uniform fixed card height, shorter cards would
            leave a big void at the BOTTOM (reads as a stray panel). Centring the
            icon/title/description group splits the slack evenly top & bottom, so
            every card looks intentional and uniform regardless of copy length. */}
        <div className="flex flex-1 flex-col justify-center" onClick={onClick}>
          {/* Icon */}
          <div
            className={cn(
              'flex items-center justify-center rounded-[var(--radius-md)]',
              compact ? 'mb-4 h-12 w-12' : 'mb-8 h-20 w-20',
              'bg-[rgba(192,0,0,0.08)] text-[var(--color-accent-warm)] ring-1 ring-[rgba(192,0,0,0.18)]',
              'text-4xl'
            )}
          >
            {icon}
          </div>

          {/* Title */}
          <h3
            className={cn(
              'font-semibold leading-snug text-[var(--color-text-primary)]',
              compact ? 'mb-2 text-lg' : 'mb-5 text-4xl'
            )}
            style={{ fontFamily: 'var(--font-card-heading), var(--font-heading)' }}
          >
            {title}
          </h3>

          {/* Description — natural height (no flex-1) so the icon/title/desc
              group can centre as a unit; flex-1 would re-introduce a bottom void. */}
          <p
            className={cn(
              'leading-relaxed text-[var(--color-text-primary)]',
              compact ? 'text-sm' : 'text-2xl'
            )}
            style={{ fontFamily: 'var(--font-body)' }}
          >
            {description}
          </p>
        </div>
      </Card>
    </motion.div>
  );
}
