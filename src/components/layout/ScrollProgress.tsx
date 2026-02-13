'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    // Set initial state
    gsap.set(bar, { scaleX: 0, transformOrigin: 'left center' });

    const trigger = ScrollTrigger.create({
      trigger: document.documentElement,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        if (prefersReducedMotion) {
          gsap.set(bar, { scaleX: self.progress });
        } else {
          gsap.to(bar, {
            scaleX: self.progress,
            duration: 0.15,
            ease: 'none',
            overwrite: true,
          });
        }
      },
    });

    return () => {
      trigger.kill();
    };
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
          willChange: 'transform',
        }}
      />
    </div>
  );
}
