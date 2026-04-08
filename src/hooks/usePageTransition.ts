'use client';

import { useRef, useCallback, useState } from 'react';
import { gsap, EASE, DURATION } from '@/lib/animations/gsap-setup';

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
          duration: DURATION.normal,
          ease: EASE.entrance,
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
        duration: DURATION.fast,
        // power2.in for exit — accelerates as it leaves the screen.
        ease: EASE.exit,
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
