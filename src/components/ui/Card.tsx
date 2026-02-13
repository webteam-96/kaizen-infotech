'use client';

import React, { useRef, useCallback } from 'react';
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionStyle,
} from 'framer-motion';
import { cn } from '@/lib/utils/cn';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  tilt?: boolean;
  glow?: boolean;
  glowColor?: string;
  hoverScale?: number;
  as?: 'div' | 'article' | 'li';
}

// ---------------------------------------------------------------------------
// Spring config for smooth tilt physics
// ---------------------------------------------------------------------------

const springConfig = { stiffness: 300, damping: 20, mass: 0.8 };

// ---------------------------------------------------------------------------
// Card component
// ---------------------------------------------------------------------------

export function Card({
  children,
  className,
  tilt = true,
  glow = true,
  glowColor = 'var(--color-accent-primary)',
  hoverScale = 1.02,
  as = 'div',
}: CardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  // Raw motion values from mouse position
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  // Spring-smoothed rotations (max 5 degrees)
  const rotateX = useSpring(useTransform(mouseY, [0, 1], [5, -5]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [0, 1], [-5, 5]), springConfig);
  const scale = useSpring(1, springConfig);

  // Glow gradient position
  const glowX = useTransform(mouseX, [0, 1], [0, 100]);
  const glowY = useTransform(mouseY, [0, 1], [0, 100]);

  // Animated border rotation for conic gradient
  const borderAngle = useMotionValue(0);

  // Pre-compute glow/border transforms (must be called unconditionally)
  const glowBackground = useTransform(
    [glowX, glowY],
    ([x, y]) =>
      `radial-gradient(circle at ${x}% ${y}%, ${glowColor}15 0%, transparent 60%)`
  );
  const borderBackground = useTransform(
    borderAngle,
    (angle) =>
      `conic-gradient(from ${angle}deg, transparent 0%, ${glowColor}40 25%, transparent 50%, ${glowColor}20 75%, transparent 100%)`
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!tilt && !glow) return;
      const el = cardRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;

      mouseX.set(x);
      mouseY.set(y);
    },
    [tilt, glow, mouseX, mouseY]
  );

  const handleMouseEnter = useCallback(() => {
    scale.set(hoverScale);
    // Start border rotation animation
    if (glow) {
      let frame: number;
      let angle = 0;
      const animate = () => {
        angle = (angle + 1) % 360;
        borderAngle.set(angle);
        frame = requestAnimationFrame(animate);
      };
      frame = requestAnimationFrame(animate);
      // Store cleanup on the element
      const el = cardRef.current;
      if (el) {
        (el as unknown as Record<string, number>).__borderFrame = frame;
      }
    }
  }, [scale, hoverScale, glow, borderAngle]);

  const handleMouseLeave = useCallback(() => {
    mouseX.set(0.5);
    mouseY.set(0.5);
    scale.set(1);

    // Stop border rotation
    const el = cardRef.current;
    if (el) {
      const frame = (el as unknown as Record<string, number>).__borderFrame;
      if (frame) cancelAnimationFrame(frame);
    }
  }, [mouseX, mouseY, scale]);

  const Component = motion[as] as typeof motion.div;

  const style: MotionStyle = {
    rotateX: tilt ? rotateX : 0,
    rotateY: tilt ? rotateY : 0,
    scale,
    transformPerspective: 800,
    transformStyle: 'preserve-3d' as const,
  };

  return (
    <Component
      ref={cardRef}
      className={cn(
        'group relative rounded-[var(--radius-lg)] overflow-hidden',
        'bg-[var(--color-bg-tertiary)] border border-[var(--color-border)]',
        'backdrop-blur-[var(--blur-sm)]',
        'transition-[border-color] duration-300',
        'hover:border-[var(--color-border-hover)]',
        className
      )}
      style={style}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Glass shine layer */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: 'var(--gradient-card-shine)',
        }}
      />

      {/* Cursor-following inner glow */}
      {glow && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{ background: glowBackground }}
        />
      )}

      {/* Animated conic gradient border overlay */}
      {glow && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-0 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            padding: '1px',
            background: borderBackground,
            mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            maskComposite: 'exclude',
            WebkitMask:
              'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor',
          }}
        />
      )}

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </Component>
  );
}
