'use client';

import { useGSAP } from '@gsap/react';
import { gsap, registerGSAPPlugins } from '@/lib/animations/gsap-setup';

export interface UseMagneticConfig {
  strength?: number;
  distance?: number;
  ease?: number;
}

/**
 * Magnetic-attraction effect: pulls the element toward the cursor when
 * the cursor is within `distance` pixels. Uses gsap.quickTo() so the
 * mousemove handler does cheap interpolated writes instead of spawning
 * a new tween (with overwrite checks) on every pixel of movement.
 */
export function useMagnetic(
  ref: React.RefObject<HTMLElement | null>,
  config: UseMagneticConfig = {}
) {
  const { strength = 0.3, distance = 100, ease = 0.2 } = config;

  registerGSAPPlugins();

  useGSAP(
    (_context, contextSafe) => {
      const element = ref.current;
      if (!element || !contextSafe) return;

      // Pre-built smooth interpolators. quickTo keeps state between calls
      // and lerps toward the target — ideal for cursor-driven motion.
      const xTo = gsap.quickTo(element, 'x', { duration: ease, ease: 'power3.out' });
      const yTo = gsap.quickTo(element, 'y', { duration: ease, ease: 'power3.out' });

      const handleMouseMove = contextSafe((e: MouseEvent) => {
        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const deltaX = e.clientX - centerX;
        const deltaY = e.clientY - centerY;
        // gsap.utils.clamp avoids manual Math.min/max ladders.
        const dist = Math.hypot(deltaX, deltaY);

        if (dist < distance) {
          const factor = (1 - dist / distance) * strength;
          xTo(deltaX * factor);
          yTo(deltaY * factor);
        } else {
          xTo(0);
          yTo(0);
        }
      });

      const handleMouseLeave = contextSafe(() => {
        xTo(0);
        yTo(0);
      });

      window.addEventListener('mousemove', handleMouseMove, { passive: true });
      element.addEventListener('mouseleave', handleMouseLeave);

      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        element.removeEventListener('mouseleave', handleMouseLeave);
        // useGSAP context auto-reverts the quickTo tweens; the explicit
        // listener cleanup above is the only thing needed here.
      };
    },
    { dependencies: [ref, strength, distance, ease] }
  );
}
