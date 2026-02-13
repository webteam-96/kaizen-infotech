'use client';

import { useGSAP } from '@gsap/react';
import { gsap, registerGSAPPlugins } from '@/lib/animations/gsap-setup';
import { ANIMATION_CONFIG } from '@/lib/animations/config';
import { useReducedMotion } from '@/hooks/useReducedMotion';

export interface UseStaggeredScrollRevealConfig {
  childSelector?: string;
  stagger?: number | gsap.StaggerVars;
  from?: gsap.TweenVars;
  to?: gsap.TweenVars;
  scrub?: boolean | number;
  start?: string;
  end?: string;
  once?: boolean;
  batch?: boolean;
}

export function useStaggeredScrollReveal(
  ref: React.RefObject<Element | null>,
  config: UseStaggeredScrollRevealConfig = {}
) {
  const prefersReducedMotion = useReducedMotion();

  registerGSAPPlugins();

  const {
    childSelector = '> *',
    stagger = ANIMATION_CONFIG.stagger.normal,
    from = { opacity: 0, y: 40 },
    to = { opacity: 1, y: 0 },
    scrub = false,
    start = ANIMATION_CONFIG.scrollTrigger.start,
    end = ANIMATION_CONFIG.scrollTrigger.end,
    once = true,
    batch = false,
  } = config;

  useGSAP(
    () => {
      if (!ref.current) return;

      const children = ref.current.querySelectorAll(childSelector);
      if (children.length === 0) return;

      if (prefersReducedMotion) {
        gsap.fromTo(
          children,
          { opacity: 0 },
          {
            opacity: 1,
            duration: ANIMATION_CONFIG.duration.fast,
            ease: ANIMATION_CONFIG.ease.smooth,
            stagger: typeof stagger === 'number' ? Math.min(stagger, 0.05) : 0.05,
            scrollTrigger: {
              trigger: ref.current,
              start,
              once,
            },
          }
        );
        return;
      }

      gsap.fromTo(
        children,
        from,
        {
          ...to,
          duration: ANIMATION_CONFIG.duration.normal,
          ease: ANIMATION_CONFIG.ease.snappy,
          stagger,
          scrollTrigger: {
            trigger: ref.current,
            start,
            end: scrub ? end : undefined,
            scrub: scrub === true ? ANIMATION_CONFIG.scrub.smooth : scrub || false,
            toggleActions: scrub ? undefined : ANIMATION_CONFIG.scrollTrigger.toggleActions,
            once: scrub ? false : once,
          },
        }
      );
    },
    { scope: ref, dependencies: [childSelector, scrub, start, end, once, batch, prefersReducedMotion] }
  );
}
