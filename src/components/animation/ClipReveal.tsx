'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, registerGSAPPlugins } from '@/lib/animations/gsap-setup';
import { ANIMATION_CONFIG } from '@/lib/animations/config';
import { useReducedMotion } from '@/hooks';
import { cn } from '@/lib/utils/cn';

interface ClipRevealProps {
  children: React.ReactNode;
  shape?: 'rect-bottom' | 'rect-top' | 'circle' | 'inset';
  duration?: number;
  delay?: number;
  className?: string;
}

const clipPaths: Record<string, { from: string; to: string }> = {
  'rect-bottom': {
    from: 'inset(100% 0% 0% 0%)',
    to: 'inset(0% 0% 0% 0%)',
  },
  'rect-top': {
    from: 'inset(0% 0% 100% 0%)',
    to: 'inset(0% 0% 0% 0%)',
  },
  circle: {
    from: 'circle(0% at 50% 50%)',
    to: 'circle(75% at 50% 50%)',
  },
  inset: {
    from: 'inset(10% 10% 10% 10%)',
    to: 'inset(0% 0% 0% 0%)',
  },
};

export function ClipReveal({
  children,
  shape = 'rect-bottom',
  duration = ANIMATION_CONFIG.duration.slow,
  delay = 0,
  className,
}: ClipRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  registerGSAPPlugins();

  useGSAP(
    () => {
      if (!ref.current) return;

      if (prefersReducedMotion) {
        gsap.fromTo(
          ref.current,
          { opacity: 0 },
          {
            opacity: 1,
            duration: ANIMATION_CONFIG.duration.fast,
            ease: ANIMATION_CONFIG.ease.smooth,
            scrollTrigger: {
              trigger: ref.current,
              start: ANIMATION_CONFIG.scrollTrigger.start,
            },
          }
        );
        return;
      }

      const clip = clipPaths[shape] ?? clipPaths['rect-bottom'];

      gsap.fromTo(
        ref.current,
        { clipPath: clip.from },
        {
          clipPath: clip.to,
          duration,
          delay,
          ease: ANIMATION_CONFIG.ease.cinematic,
          scrollTrigger: {
            trigger: ref.current,
            start: ANIMATION_CONFIG.scrollTrigger.start,
            toggleActions: ANIMATION_CONFIG.scrollTrigger.toggleActions,
          },
        }
      );
    },
    { scope: ref, dependencies: [shape, duration, delay, prefersReducedMotion] }
  );

  return (
    <div ref={ref} className={cn(className)}>
      {children}
    </div>
  );
}
