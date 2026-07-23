'use client';

import { m } from 'framer-motion';
import { ANIMATION_CONFIG } from '@/lib/animations/config';
import { useReducedMotion } from '@/hooks';
import { cn } from '@/lib/utils/cn';

interface FloatingElementProps {
  children: React.ReactNode;
  amplitude?: number;
  duration?: number;
  delay?: number;
  className?: string;
}

export function FloatingElement({
  children,
  amplitude = 10,
  duration = ANIMATION_CONFIG.duration.ambient,
  delay = 0,
  className,
}: FloatingElementProps) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <div className={cn(className)}>{children}</div>;
  }

  return (
    <m.div
      className={cn(className)}
      animate={{
        y: [-amplitude, amplitude, -amplitude],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        repeatType: 'loop',
        ease: 'easeInOut',
      }}
    >
      {children}
    </m.div>
  );
}
