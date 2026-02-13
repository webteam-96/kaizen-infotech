'use client';

import { useRef } from 'react';
import { useParallax } from '@/hooks';
import { cn } from '@/lib/utils/cn';

interface ParallaxLayerProps {
  children: React.ReactNode;
  speed?: number;
  direction?: 'vertical' | 'horizontal';
  className?: string;
}

export function ParallaxLayer({
  children,
  speed = 0.5,
  direction = 'vertical',
  className,
}: ParallaxLayerProps) {
  const ref = useRef<HTMLDivElement>(null);

  useParallax(ref, { speed, direction });

  return (
    <div ref={ref} className={cn('will-change-transform', className)}>
      {children}
    </div>
  );
}
