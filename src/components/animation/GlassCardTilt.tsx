'use client';

import { useEffect, useRef, type ReactNode, type CSSProperties } from 'react';
import { useScrollStore } from '@/lib/store/scroll-store';

interface GlassCardTiltProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  /** Max rotation in degrees on each axis. Default 6. */
  maxTilt?: number;
  /** Perspective applied to the tilt container. Default 1000. */
  perspective?: number;
  /** Disable tilt entirely (e.g. for static demos / reduced motion). */
  disabled?: boolean;
}

/**
 * Opt-in mouse-tracked 3D tilt for glass cards. Suspends while the page is
 * mid-scroll so it doesn't fight scroll-driven transforms elsewhere (the
 * Rubik's-cube hero owns its own glass cards via RAF — do NOT wrap those).
 */
export default function GlassCardTilt({
  children,
  className,
  style,
  maxTilt = 6,
  perspective = 1000,
  disabled = false,
}: GlassCardTiltProps) {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (disabled) return;
    const outer = outerRef.current;
    const inner = innerRef.current;
    if (!outer || !inner) return;

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    if (prefersReducedMotion) return;

    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let rafId = 0;
    let hovering = false;

    const apply = () => {
      currentX += (targetX - currentX) * 0.12;
      currentY += (targetY - currentY) * 0.12;
      inner.style.transform = `rotateX(${currentY.toFixed(2)}deg) rotateY(${currentX.toFixed(2)}deg)`;
      if (hovering || Math.abs(currentX - targetX) > 0.05 || Math.abs(currentY - targetY) > 0.05) {
        rafId = requestAnimationFrame(apply);
      } else {
        rafId = 0;
      }
    };

    const onMove = (e: MouseEvent) => {
      if (useScrollStore.getState().isScrolling) {
        targetX = 0;
        targetY = 0;
      } else {
        const rect = outer.getBoundingClientRect();
        const nx = (e.clientX - rect.left) / rect.width - 0.5;
        const ny = (e.clientY - rect.top) / rect.height - 0.5;
        targetX = -nx * maxTilt;
        targetY = ny * maxTilt;
      }
      if (!rafId) rafId = requestAnimationFrame(apply);
    };

    const onEnter = () => {
      hovering = true;
      if (!rafId) rafId = requestAnimationFrame(apply);
    };

    const onLeave = () => {
      hovering = false;
      targetX = 0;
      targetY = 0;
      if (!rafId) rafId = requestAnimationFrame(apply);
    };

    outer.addEventListener('mousemove', onMove);
    outer.addEventListener('mouseenter', onEnter);
    outer.addEventListener('mouseleave', onLeave);
    return () => {
      outer.removeEventListener('mousemove', onMove);
      outer.removeEventListener('mouseenter', onEnter);
      outer.removeEventListener('mouseleave', onLeave);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [maxTilt, disabled]);

  return (
    <div
      ref={outerRef}
      className={className}
      style={{ perspective: `${perspective}px`, ...style }}
    >
      <div
        ref={innerRef}
        style={{
          transformStyle: 'preserve-3d',
          willChange: 'transform',
          transition: 'transform 0s',
        }}
      >
        {children}
      </div>
    </div>
  );
}
