'use client';

import { useEffect } from 'react';
import gsap from 'gsap';

export interface UseMagneticConfig {
  strength?: number;
  distance?: number;
  ease?: number;
}

export function useMagnetic(
  ref: React.RefObject<HTMLElement | null>,
  config: UseMagneticConfig = {}
) {
  const { strength = 0.3, distance = 100, ease = 0.2 } = config;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const element = ref.current;
    if (!element) return;

    let animationFrame: number | undefined;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const deltaX = e.clientX - centerX;
      const deltaY = e.clientY - centerY;
      const dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      if (dist < distance) {
        const factor = (1 - dist / distance) * strength;
        gsap.to(element, {
          x: deltaX * factor,
          y: deltaY * factor,
          duration: ease,
          overwrite: true,
        });
      } else {
        gsap.to(element, {
          x: 0,
          y: 0,
          duration: ease,
          overwrite: true,
        });
      }
    };

    const handleMouseLeave = () => {
      gsap.to(element, {
        x: 0,
        y: 0,
        duration: ease * 2,
        overwrite: true,
      });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    element.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('mouseleave', handleMouseLeave);
      if (animationFrame) cancelAnimationFrame(animationFrame);
      gsap.killTweensOf(element);
    };
  }, [ref, strength, distance, ease]);
}
