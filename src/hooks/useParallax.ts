'use client';

import { useGSAP } from '@gsap/react';
import { gsap, registerGSAPPlugins } from '@/lib/animations/gsap-setup';
import { ANIMATION_CONFIG } from '@/lib/animations/config';

export interface UseParallaxConfig {
  speed?: number;
  direction?: 'vertical' | 'horizontal';
  start?: string;
  end?: string;
}

export function useParallax(
  ref: React.RefObject<Element | null>,
  config: UseParallaxConfig = {}
) {
  registerGSAPPlugins();

  const {
    speed = 0.5,
    direction = 'vertical',
    start = 'top bottom',
    end = 'bottom top',
  } = config;

  useGSAP(
    () => {
      if (!ref.current) return;

      const distance = speed * 100;
      const prop = direction === 'vertical' ? 'y' : 'x';

      gsap.fromTo(
        ref.current,
        { [prop]: -distance },
        {
          [prop]: distance,
          ease: 'none',
          scrollTrigger: {
            trigger: ref.current,
            start,
            end,
            scrub: ANIMATION_CONFIG.scrub.smooth,
          },
        }
      );
    },
    { scope: ref, dependencies: [speed, direction] }
  );
}
