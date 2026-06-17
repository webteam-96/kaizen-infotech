'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, registerGSAPPlugins } from '@/lib/animations/gsap-setup';
import { ANIMATION_CONFIG } from '@/lib/animations/config';
import { useInView, useReducedMotion } from '@/hooks';
import { cn } from '@/lib/utils/cn';

interface CountUpProps {
  end: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  className?: string;
  once?: boolean;
}

export function CountUp({
  end,
  duration = ANIMATION_CONFIG.duration.cinematic,
  suffix = '',
  prefix = '',
  decimals = 0,
  className,
  once = true,
}: CountUpProps) {
  const prefersReducedMotion = useReducedMotion();
  const { ref, isInView } = useInView<HTMLSpanElement>({ once, threshold: 0.3 });
  const valueRef = useRef({ val: 0 });
  // The displayed number is written directly to the DOM (textContent) from the
  // GSAP onUpdate — no React state, so the ~60fps tween causes zero re-renders.
  const displayRef = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  registerGSAPPlugins();

  const format = (val: number) =>
    `${prefix}${decimals > 0 ? val.toFixed(decimals) : Math.round(val).toString()}${suffix}`;

  useGSAP(
    () => {
      if (!isInView) return;
      if (once && hasAnimated.current) return;

      hasAnimated.current = true;

      if (prefersReducedMotion) {
        if (displayRef.current) displayRef.current.textContent = format(end);
        return;
      }

      valueRef.current.val = 0;

      gsap.to(valueRef.current, {
        val: end,
        duration,
        ease: ANIMATION_CONFIG.ease.cinematic,
        snap: { val: decimals === 0 ? 1 : 1 / Math.pow(10, decimals) },
        onUpdate: () => {
          if (displayRef.current) displayRef.current.textContent = format(valueRef.current.val);
        },
        onComplete: () => {
          // Guarantee the exact final value (no float/snap residue).
          if (displayRef.current) displayRef.current.textContent = format(end);
        },
      });
    },
    { dependencies: [isInView, end, duration, decimals, once, prefersReducedMotion] }
  );

  return (
    <span ref={ref} className={cn(className)}>
      <span ref={displayRef}>{format(prefersReducedMotion ? end : 0)}</span>
    </span>
  );
}
