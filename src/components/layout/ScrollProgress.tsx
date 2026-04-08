'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, ScrollTrigger, registerGSAPPlugins } from '@/lib/animations/gsap-setup';

export default function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null);

  registerGSAPPlugins();

  useGSAP(
    () => {
      const bar = barRef.current;
      if (!bar) return;

      const prefersReducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches;

      // Cache a quickTo for scaleX so onUpdate doesn't allocate a new
      // tween every scroll tick. quickTo gives us tween-like smoothing
      // (built-in lerp toward target) at ~zero per-frame cost.
      gsap.set(bar, { scaleX: 0, transformOrigin: 'left center' });
      const xTo = gsap.quickTo(bar, 'scaleX', {
        duration: 0.15,
        ease: 'none',
      });

      ScrollTrigger.create({
        trigger: document.documentElement,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: (self) => {
          if (prefersReducedMotion) {
            bar.style.transform = `scaleX(${self.progress})`;
          } else {
            xTo(self.progress);
          }
        },
      });
    },
    { scope: barRef }
  );

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '3px',
        zIndex: 'var(--z-sticky)' as unknown as number,
        pointerEvents: 'none',
      }}
    >
      <div
        ref={barRef}
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: 'var(--color-accent-primary)',
          transformOrigin: 'left center',
          willChange: 'transform',
        }}
      />
    </div>
  );
}
