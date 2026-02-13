'use client';

import { useRef, useState } from 'react';
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
  const [display, setDisplay] = useState(prefersReducedMotion ? end : 0);
  const hasAnimated = useRef(false);

  registerGSAPPlugins();

  useGSAP(
    () => {
      if (!isInView) return;
      if (once && hasAnimated.current) return;

      hasAnimated.current = true;

      if (prefersReducedMotion) {
        setDisplay(end);
        return;
      }

      valueRef.current.val = 0;

      gsap.to(valueRef.current, {
        val: end,
        duration,
        ease: ANIMATION_CONFIG.ease.cinematic,
        snap: { val: decimals === 0 ? 1 : 1 / Math.pow(10, decimals) },
        onUpdate: () => {
          setDisplay(valueRef.current.val);
        },
      });
    },
    { dependencies: [isInView, end, duration, decimals, once, prefersReducedMotion] }
  );

  const formatted = decimals > 0 ? display.toFixed(decimals) : Math.round(display).toString();

  return (
    <span ref={ref} className={cn(className)}>
      {prefix}{formatted}{suffix}
    </span>
  );
}
