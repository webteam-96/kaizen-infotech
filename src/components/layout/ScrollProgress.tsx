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

    // Only run the hue loop WHILE there is scroll motion to render, then settle
    // and stop — the old version ran a permanent rAF writing backgroundColor on
    // every frame forever (idle waste on every page). It restarts on next scroll.
    let smoothed = 0;
    let rafId = 0;
    let running = false;
    const loop = () => {
      const v = Math.abs(useScrollStore.getState().scrollVelocity);
      const target = Math.min(1, v / 4);
      smoothed = smoothed * 0.88 + target * 0.12;
      const hue = 212 + smoothed * 36;
      const sat = 78 + smoothed * 14;
      bar.style.backgroundColor = `hsl(${hue.toFixed(1)}, ${sat.toFixed(1)}%, 55%)`;
      if (smoothed > 0.001 || target > 0) {
        rafId = requestAnimationFrame(loop);
      } else {
        running = false; // settled — go idle (no rAF, no style writes)
      }
    };
    const start = () => {
      if (running) return;
      running = true;
      rafId = requestAnimationFrame(loop);
    };
    const unsub = useScrollStore.subscribe((s) => {
      if (Math.abs(s.scrollVelocity) > 0.01) start();
    });
    return () => { unsub(); cancelAnimationFrame(rafId); };
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
