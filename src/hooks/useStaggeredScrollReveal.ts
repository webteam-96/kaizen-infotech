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

      // Use .children for default '> *' to avoid scope-related querySelectorAll issues
      const children = childSelector === '> *'
        ? ref.current.children
        : ref.current.querySelectorAll(childSelector);
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
            immediateRender: false,
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
          // Non-scrub reveals: keep children at their CSS default (visible)
          // until the trigger fires, so a missed trigger on fast scroll never
          // leaves them stuck at the {opacity:0} from-state. Scrub tweens map
          // to scroll position and are self-correcting, so leave those alone.
          immediateRender: scrub ? undefined : false,
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
