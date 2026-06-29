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
            immediateRender: false,
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

      // ── Reverse-on-scroll-up for touch (phones + ALL iPads) ──────────────
      // On touch we make the reveal SCRUBBED so scroll-up is the exact reverse of
      // scroll-down: opacity + offset are tied directly to scroll progress over a
      // short band, so the element fades/rises in on the way down and
      // fades/sinks back out on the way up — and it's self-correcting (never
      // stuck). The default timed reveal (toggleActions) can't mirror reliably
      // because it uses immediateRender:false (resting opacity 1), so leave-back
      // has nothing to reverse to. Desktop keeps its established timed one-way
      // reveal. Callers that already opt into `scrub` keep their own settings.
      const isTouch =
        typeof window !== 'undefined' &&
        !window.matchMedia('(min-width: 1024px) and (hover: hover) and (pointer: fine)').matches;
      const explicitScrub = scrub !== false && scrub !== undefined;
      const touchScrub = !explicitScrub && isTouch;        // we force scrub on touch
      const effScrub: boolean | number = explicitScrub ? scrub : (touchScrub ? true : false);
      // Reveal completes over a short band (top 85% → top 55% of viewport) then
      // holds; the same band plays in reverse on the way up.
      const effEnd = explicitScrub ? end : (touchScrub ? 'top 55%' : end);

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
          delay: effScrub ? 0 : delay,
          ease: ANIMATION_CONFIG.ease.snappy,
          stagger: stagger || 0,
          // Non-scrub reveals: don't apply the {opacity:0} from-state at load,
          // so if the trigger misfires on fast scroll the element stays visible.
          // Scrub tweens map opacity to scroll position and are self-correcting.
          immediateRender: effScrub ? undefined : false,
          scrollTrigger: {
            trigger: containerRef.current,
            start,
            end: effScrub ? effEnd : undefined,
            scrub: effScrub === true ? ANIMATION_CONFIG.scrub.smooth : effScrub || false,
            toggleActions: effScrub ? undefined : ANIMATION_CONFIG.scrollTrigger.toggleActions,
            once: effScrub ? false : once,
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
