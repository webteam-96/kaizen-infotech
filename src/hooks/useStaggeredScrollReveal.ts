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

      const isTouch =
        typeof window !== 'undefined' &&
        !window.matchMedia('(min-width: 1024px) and (hover: hover) and (pointer: fine)').matches;
      const explicitScrub = scrub !== false && scrub !== undefined;

      // ── TOUCH (phones + ALL iPads): reveal EACH child as IT personally enters
      // the viewport, scrubbed so scroll-up is the exact reverse of scroll-down.
      //
      // A single grid-wide trigger maps the ENTIRE stagger into one narrow band
      // anchored to the grid's TOP. On a tall mobile grid (e.g. a 1-column stack
      // taller than the screen) every card below the first finishes revealing
      // while still BELOW the fold — so by the time you scroll to it, it is
      // already at its end state and never appears to animate. Per-child triggers
      // fix this: every card runs its own 'top 90% → top 60%' window, so each one
      // animates in view, and reverses cleanly on the way back up.
      if (!explicitScrub && isTouch) {
        const items = Array.from(children) as Element[];
        items.forEach((el) => {
          gsap.fromTo(
            el,
            from,
            {
              ...to,
              ease: 'none', // scrub → linear, position-linked
              immediateRender: true,
              scrollTrigger: {
                trigger: el,
                start: 'top 90%',
                end: 'top 60%',
                scrub: ANIMATION_CONFIG.scrub.smooth,
              },
            }
          );
        });
        return;
      }

      // ── DESKTOP (+ explicit-scrub callers): one staggered tween for the whole
      // group. Desktop grids fit ~a viewport, so the cards enter together and the
      // group cascade reads correctly; this preserves the established feel. ──
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
          immediateRender: explicitScrub ? undefined : false,
          scrollTrigger: {
            trigger: ref.current,
            start,
            end: explicitScrub ? end : undefined,
            scrub: explicitScrub
              ? (scrub === true ? ANIMATION_CONFIG.scrub.smooth : scrub)
              : false,
            toggleActions: explicitScrub ? undefined : ANIMATION_CONFIG.scrollTrigger.toggleActions,
            once: explicitScrub ? false : once,
          },
        }
      );
    },
    { scope: ref, dependencies: [childSelector, scrub, start, end, once, batch, prefersReducedMotion] }
  );
}
