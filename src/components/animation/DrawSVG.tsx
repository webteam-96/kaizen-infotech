'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, registerGSAPPlugins } from '@/lib/animations/gsap-setup';
import { ANIMATION_CONFIG } from '@/lib/animations/config';
import { useReducedMotion } from '@/hooks';
import { cn } from '@/lib/utils/cn';

interface DrawSVGProps {
  children: React.ReactNode;
  duration?: number;
  scrub?: boolean;
  className?: string;
}

export function DrawSVG({
  children,
  duration = ANIMATION_CONFIG.duration.cinematic,
  scrub = false,
  className,
}: DrawSVGProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  registerGSAPPlugins();

  useGSAP(
    () => {
      if (!containerRef.current) return;

      const paths = containerRef.current.querySelectorAll<SVGPathElement | SVGLineElement | SVGCircleElement | SVGEllipseElement | SVGRectElement | SVGPolylineElement | SVGPolygonElement>(
        'path, line, circle, ellipse, rect, polyline, polygon'
      );

      if (paths.length === 0) return;

      if (prefersReducedMotion) {
        gsap.fromTo(
          containerRef.current,
          { opacity: 0 },
          {
            opacity: 1,
            duration: ANIMATION_CONFIG.duration.fast,
            ease: ANIMATION_CONFIG.ease.smooth,
            scrollTrigger: {
              trigger: containerRef.current,
              start: ANIMATION_CONFIG.scrollTrigger.start,
            },
          }
        );
        return;
      }

      paths.forEach((path) => {
        if ('getTotalLength' in path && typeof path.getTotalLength === 'function') {
          const length = path.getTotalLength();
          gsap.set(path, {
            strokeDasharray: length,
            strokeDashoffset: length,
          });
        }
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: ANIMATION_CONFIG.scrollTrigger.start,
          end: scrub ? ANIMATION_CONFIG.scrollTrigger.end : undefined,
          scrub: scrub ? ANIMATION_CONFIG.scrub.smooth : false,
          toggleActions: scrub ? undefined : ANIMATION_CONFIG.scrollTrigger.toggleActions,
        },
      });

      paths.forEach((path, i) => {
        tl.to(
          path,
          {
            strokeDashoffset: 0,
            duration,
            ease: ANIMATION_CONFIG.ease.cinematic,
          },
          i * 0.1
        );
      });
    },
    { scope: containerRef, dependencies: [duration, scrub, prefersReducedMotion] }
  );

  return (
    <div ref={containerRef} className={cn(className)}>
      {children}
    </div>
  );
}
