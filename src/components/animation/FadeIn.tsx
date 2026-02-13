'use client';

import { motion, type Variants } from 'framer-motion';
import { ANIMATION_CONFIG } from '@/lib/animations/config';
import { useReducedMotion } from '@/hooks';
import { cn } from '@/lib/utils/cn';

type MotionTag = 'div' | 'section' | 'article' | 'aside' | 'main' | 'span' | 'p' | 'li' | 'header' | 'footer';

interface FadeInProps {
  children: React.ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  distance?: number;
  duration?: number;
  delay?: number;
  className?: string;
  once?: boolean;
  as?: MotionTag;
}

const directionOffsets: Record<string, { x: number; y: number }> = {
  up: { x: 0, y: 1 },
  down: { x: 0, y: -1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
  none: { x: 0, y: 0 },
};

export function FadeIn({
  children,
  direction = 'up',
  distance = 30,
  duration = ANIMATION_CONFIG.duration.normal,
  delay = 0,
  className,
  once = true,
  as = 'div',
}: FadeInProps) {
  const prefersReducedMotion = useReducedMotion();

  const offset = directionOffsets[direction] ?? directionOffsets.none;

  const variants: Variants = prefersReducedMotion
    ? {
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            duration: ANIMATION_CONFIG.duration.fast,
            ease: 'easeOut',
          },
        },
      }
    : {
        hidden: {
          opacity: 0,
          x: offset.x * distance,
          y: offset.y * distance,
        },
        visible: {
          opacity: 1,
          x: 0,
          y: 0,
          transition: {
            duration,
            delay,
            ease: [0.25, 0.46, 0.45, 0.94],
          },
        },
      };

  const MotionTag = motion[as];

  return (
    <MotionTag
      className={cn(className)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: '-15%' }}
      variants={variants}
    >
      {children}
    </MotionTag>
  );
}
