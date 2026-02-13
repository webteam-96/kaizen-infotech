'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, registerGSAPPlugins } from '@/lib/animations/gsap-setup';
import { splitTextIntoSpans, type SplitType } from '@/lib/animations/utils';
import { ANIMATION_CONFIG } from '@/lib/animations/config';
import { useReducedMotion } from '@/hooks';
import { cn } from '@/lib/utils/cn';

interface TextRevealProps {
  children: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span';
  splitBy?: SplitType;
  stagger?: number;
  duration?: number;
  delay?: number;
  scrub?: boolean | number;
  className?: string;
  once?: boolean;
}

export function TextReveal({
  children,
  as: Tag = 'p',
  splitBy = 'words',
  stagger = ANIMATION_CONFIG.stagger.fast,
  duration = ANIMATION_CONFIG.duration.slow,
  delay = 0,
  scrub = false,
  className,
  once = true,
}: TextRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion();

  registerGSAPPlugins();

  useGSAP(
    () => {
      if (!textRef.current || !containerRef.current) return;
      if (typeof window === 'undefined') return;

      if (prefersReducedMotion) {
        gsap.fromTo(
          textRef.current,
          { opacity: 0 },
          {
            opacity: 1,
            duration: ANIMATION_CONFIG.duration.fast,
            ease: ANIMATION_CONFIG.ease.smooth,
            scrollTrigger: {
              trigger: containerRef.current,
              start: ANIMATION_CONFIG.scrollTrigger.start,
              once,
            },
          }
        );
        return;
      }

      const result = splitTextIntoSpans(textRef.current, splitBy);

      if (result.elements.length === 0) return;

      // Wrap each element for overflow hidden clip effect
      result.elements.forEach((el) => {
        const wrapper = document.createElement('span');
        wrapper.style.display = 'inline-block';
        wrapper.style.overflow = 'hidden';
        wrapper.style.verticalAlign = 'bottom';
        el.parentNode?.insertBefore(wrapper, el);
        wrapper.appendChild(el);
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: ANIMATION_CONFIG.scrollTrigger.start,
          end: scrub ? ANIMATION_CONFIG.scrollTrigger.end : undefined,
          scrub: scrub === true ? ANIMATION_CONFIG.scrub.smooth : scrub || false,
          toggleActions: scrub ? undefined : ANIMATION_CONFIG.scrollTrigger.toggleActions,
          once: scrub ? false : once,
        },
      });

      tl.fromTo(
        result.elements,
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration,
          ease: ANIMATION_CONFIG.ease.textReveal,
          stagger,
          delay,
        }
      );

      return () => {
        result.revert();
      };
    },
    { scope: containerRef, dependencies: [splitBy, stagger, duration, delay, scrub, once, prefersReducedMotion, children] }
  );

  return (
    <div ref={containerRef} className={cn(className)}>
      <Tag ref={textRef as React.RefObject<never>}>{children}</Tag>
    </div>
  );
}
