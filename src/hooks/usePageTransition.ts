'use client';

import { useRef, useCallback, useState } from 'react';
import gsap from 'gsap';
import { ANIMATION_CONFIG } from '@/lib/animations/config';

export type TransitionState = 'idle' | 'entering' | 'exiting';

export function usePageTransition() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<TransitionState>('idle');

  const animateEnter = useCallback(
    (onComplete?: () => void) => {
      if (!containerRef.current) {
        onComplete?.();
        return;
      }

      setState('entering');

      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: ANIMATION_CONFIG.duration.normal,
          ease: ANIMATION_CONFIG.ease.smooth,
          onComplete: () => {
            setState('idle');
            onComplete?.();
          },
        }
      );
    },
    []
  );

  const animateExit = useCallback(
    (onComplete?: () => void) => {
      if (!containerRef.current) {
        onComplete?.();
        return;
      }

      setState('exiting');

      gsap.to(containerRef.current, {
        opacity: 0,
        y: -20,
        duration: ANIMATION_CONFIG.duration.fast,
        ease: ANIMATION_CONFIG.ease.smooth,
        onComplete: () => {
          setState('idle');
          onComplete?.();
        },
      });
    },
    []
  );

  return {
    containerRef,
    state,
    animateEnter,
    animateExit,
  };
}
