'use client';

import { useRef, useCallback } from 'react';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger, registerGSAPPlugins } from '@/lib/animations/gsap-setup';
import { ANIMATION_CONFIG } from '@/lib/animations/config';

export interface UseScrollTriggerConfig {
  start?: string;
  end?: string;
  scrub?: boolean | number;
  pin?: boolean;
  markers?: boolean;
  toggleActions?: string;
  once?: boolean;
}

export function useScrollTrigger(
  ref: React.RefObject<Element | null>,
  config: UseScrollTriggerConfig = {},
  callback?: (self: ScrollTrigger) => void
) {
  registerGSAPPlugins();

  const triggersRef = useRef<ScrollTrigger[]>([]);

  const {
    start = ANIMATION_CONFIG.scrollTrigger.start,
    end = ANIMATION_CONFIG.scrollTrigger.end,
    scrub = false,
    pin = false,
    markers = false,
    toggleActions = ANIMATION_CONFIG.scrollTrigger.toggleActions,
    once = false,
  } = config;

  useGSAP(
    () => {
      if (!ref.current) return;

      const trigger = ScrollTrigger.create({
        trigger: ref.current,
        start,
        end,
        scrub,
        pin,
        markers,
        toggleActions: scrub ? undefined : toggleActions,
        once,
        onEnter: callback ? (self) => callback(self) : undefined,
        onEnterBack: callback && !once ? (self) => callback(self) : undefined,
      });

      triggersRef.current.push(trigger);
    },
    { scope: ref, dependencies: [start, end, scrub, pin, once] }
  );

  const kill = useCallback(() => {
    triggersRef.current.forEach((t) => t.kill());
    triggersRef.current = [];
  }, []);

  return { kill, triggers: triggersRef };
}
