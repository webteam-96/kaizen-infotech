'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, registerGSAPPlugins } from '@/lib/animations/gsap-setup';
import { splitTextIntoSpans, type SplitType, type SplitResult } from '@/lib/animations/utils';
import { ANIMATION_CONFIG } from '@/lib/animations/config';

export interface UseSplitTextConfig {
  type?: SplitType;
  animate?: boolean;
  duration?: number;
  ease?: string;
  stagger?: number;
  y?: string | number;
  delay?: number;
}

export function useSplitText(
  ref: React.RefObject<HTMLElement | null>,
  config: UseSplitTextConfig = {}
) {
  registerGSAPPlugins();

  const splitRef = useRef<SplitResult | null>(null);

  const {
    type = 'words',
    animate = true,
    duration = ANIMATION_CONFIG.duration.slow,
    ease = ANIMATION_CONFIG.ease.textReveal,
    stagger = ANIMATION_CONFIG.stagger.fast,
    y = '110%',
    delay = 0,
  } = config;

  useGSAP(
    () => {
      if (!ref.current) return;
      if (typeof window === 'undefined') return;

      const result = splitTextIntoSpans(ref.current, type);
      splitRef.current = result;

      if (animate && result.elements.length > 0) {
        // Wrap each element in a clip container for the reveal effect
        result.elements.forEach((el) => {
          const wrapper = document.createElement('span');
          wrapper.style.display = 'inline-block';
          wrapper.style.overflow = 'hidden';
          wrapper.style.verticalAlign = 'bottom';
          el.parentNode?.insertBefore(wrapper, el);
          wrapper.appendChild(el);
        });

        gsap.fromTo(
          result.elements,
          { y, opacity: 0 },
          { y: '0%', opacity: 1, duration, ease, stagger, delay }
        );
      }

      return () => {
        result.revert();
        splitRef.current = null;
      };
    },
    { scope: ref, dependencies: [type, animate, duration, ease, stagger, y, delay] }
  );

  return splitRef;
}
