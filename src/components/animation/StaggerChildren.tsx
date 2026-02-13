'use client';

import { motion, type Variants } from 'framer-motion';
import { ANIMATION_CONFIG } from '@/lib/animations/config';
import { useReducedMotion } from '@/hooks';
import { cn } from '@/lib/utils/cn';

interface StaggerChildrenProps {
  children: React.ReactNode;
  stagger?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  className?: string;
  once?: boolean;
}

const directionOffsets: Record<string, { x: number; y: number }> = {
  up: { x: 0, y: 30 },
  down: { x: 0, y: -30 },
  left: { x: -30, y: 0 },
  right: { x: 30, y: 0 },
};

export function StaggerChildren({
  children,
  stagger = ANIMATION_CONFIG.stagger.normal,
  direction = 'up',
  className,
  once = true,
}: StaggerChildrenProps) {
  const prefersReducedMotion = useReducedMotion();

  const offset = directionOffsets[direction] ?? directionOffsets.up;

  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: stagger,
      },
    },
  };

  const itemVariants: Variants = prefersReducedMotion
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
          x: offset.x,
          y: offset.y,
        },
        visible: {
          opacity: 1,
          x: 0,
          y: 0,
          transition: {
            duration: ANIMATION_CONFIG.duration.normal,
            ease: [0.25, 0.46, 0.45, 0.94],
          },
        },
      };

  return (
    <motion.div
      className={cn(className)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: '-15%' }}
      variants={containerVariants}
    >
      {Array.isArray(children)
        ? children.map((child, i) => (
            <motion.div key={i} variants={itemVariants}>
              {child}
            </motion.div>
          ))
        : (
          <motion.div variants={itemVariants}>
            {children}
          </motion.div>
        )}
    </motion.div>
  );
}
