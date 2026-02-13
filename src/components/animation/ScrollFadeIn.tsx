'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, registerGSAPPlugins } from '@/lib/animations/gsap-setup';
import { ANIMATION_CONFIG } from '@/lib/animations/config';
import { useReducedMotion } from '@/hooks';
import { cn } from '@/lib/utils/cn';

interface ScrollFadeInProps {
  children: React.ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  distance?: number;
  duration?: number;
  delay?: number;
  stagger?: number;
  scrub?: boolean | number;
  start?: string;
  end?: string;
  once?: boolean;
  className?: string;
  as?: 'div' | 'section' | 'article' | 'aside' | 'span' | 'p' | 'header' | 'footer';
}

const directionOffsets: Record<string, { x: number; y: number }> = {
  up: { x: 0, y: 1 },
  down: { x: 0, y: -1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
  none: { x: 0, y: 0 },
};

export function ScrollFadeIn({
  children,
  direction = 'up',
  distance = 40,
  duration = ANIMATION_CONFIG.duration.normal,
  delay = 0,
  stagger = 0,
  scrub = false,
  start = ANIMATION_CONFIG.scrollTrigger.start,
  end = ANIMATION_CONFIG.scrollTrigger.end,
  once = true,
  className,
  as: Tag = 'div',
}: ScrollFadeInProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  registerGSAPPlugins();

  useGSAP(
    () => {
      if (!containerRef.current) return;

      const targets = stagger
        ? containerRef.current.children
        : containerRef.current;

      if (stagger && containerRef.current.children.length === 0) return;

      if (prefersReducedMotion) {
        gsap.fromTo(
          targets,
          { opacity: 0 },
          {
            opacity: 1,
            duration: ANIMATION_CONFIG.duration.fast,
            ease: ANIMATION_CONFIG.ease.smooth,
            stagger: stagger ? ANIMATION_CONFIG.stagger.fast : 0,
            scrollTrigger: {
              trigger: containerRef.current,
              start,
              once,
            },
          }
        );
        return;
      }

      const offset = directionOffsets[direction] ?? directionOffsets.none;

      gsap.fromTo(
        targets,
        {
          opacity: 0,
          x: offset.x * distance,
          y: offset.y * distance,
        },
        {
          opacity: 1,
          x: 0,
          y: 0,
          duration,
          delay: scrub ? 0 : delay,
          ease: ANIMATION_CONFIG.ease.snappy,
          stagger: stagger || 0,
          scrollTrigger: {
            trigger: containerRef.current,
            start,
            end: scrub ? end : undefined,
            scrub: scrub === true ? ANIMATION_CONFIG.scrub.smooth : scrub || false,
            toggleActions: scrub ? undefined : ANIMATION_CONFIG.scrollTrigger.toggleActions,
            once: scrub ? false : once,
          },
        }
      );
    },
    { scope: containerRef, dependencies: [direction, distance, duration, delay, stagger, scrub, start, end, once, prefersReducedMotion] }
  );

  return (
    <Tag ref={containerRef as React.RefObject<never>} className={cn(className)}>
      {children}
    </Tag>
  );
}
