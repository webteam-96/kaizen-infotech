'use client';

import { useEffect, useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, ScrollTrigger, registerGSAPPlugins } from '@/lib/animations/gsap-setup';
import { useScrollStore } from '@/lib/store/scroll-store';

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

  // Velocity-driven hue shift: hue eases between the brand accent (rest)
  // and a warmer/cooler tone (peak burst) so the bar reads as a kinetic
  // signal of scroll intensity. Smoothed so it doesn't strobe.
  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    if (prefersReducedMotion) return;

    let smoothed = 0;
    let rafId = 0;
    const loop = () => {
      const v = Math.abs(useScrollStore.getState().scrollVelocity);
      const target = Math.min(1, v / 4);
      smoothed = smoothed * 0.88 + target * 0.12;
      const hue = 212 + smoothed * 36;
      const sat = 78 + smoothed * 14;
      bar.style.backgroundColor = `hsl(${hue.toFixed(1)}, ${sat.toFixed(1)}%, 55%)`;
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, []);

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
          willChange: 'transform, background-color',
        }}
      />
    </div>
  );
}
