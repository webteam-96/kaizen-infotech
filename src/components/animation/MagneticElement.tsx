'use client';

import { useRef } from 'react';
import { useMagnetic, useReducedMotion } from '@/hooks';
import { cn } from '@/lib/utils/cn';

interface MagneticElementProps {
  children: React.ReactNode;
  strength?: number;
  className?: string;
}

export function MagneticElement({
  children,
  strength = 0.3,
  className,
}: MagneticElementProps) {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  useMagnetic(ref, {
    strength: prefersReducedMotion ? 0 : strength,
  });

  return (
    <div ref={ref} className={cn(className)}>
      {children}
    </div>
  );
}
