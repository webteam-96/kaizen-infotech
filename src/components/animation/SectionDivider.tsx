'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, registerGSAPPlugins } from '@/lib/animations/gsap-setup';
import { ANIMATION_CONFIG } from '@/lib/animations/config';
import { useReducedMotion } from '@/hooks';
import { cn } from '@/lib/utils/cn';

interface SectionDividerProps {
  variant?: 'line' | 'gradient' | 'dots';
  direction?: 'horizontal' | 'vertical';
  scrub?: boolean | number;
  className?: string;
  color?: string;
}

export function SectionDivider({
  variant = 'line',
  direction = 'horizontal',
  scrub = true,
  className,
  color,
}: SectionDividerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  registerGSAPPlugins();

  useGSAP(
    () => {
      if (!containerRef.current) return;

      if (prefersReducedMotion) {
        gsap.to(containerRef.current, {
          opacity: 1,
          duration: ANIMATION_CONFIG.duration.fast,
          scrollTrigger: {
            trigger: containerRef.current,
            start: ANIMATION_CONFIG.scrollTrigger.start,
            once: true,
          },
        });
        return;
      }

      if (variant === 'dots') {
        const dots = containerRef.current.querySelectorAll('.section-divider-dot');
        if (dots.length > 0) {
          gsap.fromTo(
            dots,
            { scale: 0, opacity: 0 },
            {
              scale: 1,
              opacity: 1,
              duration: ANIMATION_CONFIG.duration.fast,
              ease: ANIMATION_CONFIG.ease.snappy,
              stagger: ANIMATION_CONFIG.stagger.fast,
              scrollTrigger: {
                trigger: containerRef.current,
                start: ANIMATION_CONFIG.scrollTrigger.start,
                end: scrub ? ANIMATION_CONFIG.scrollTrigger.end : undefined,
                scrub: scrub === true ? ANIMATION_CONFIG.scrub.smooth : scrub || false,
                toggleActions: scrub ? undefined : ANIMATION_CONFIG.scrollTrigger.toggleActions,
              },
            }
          );
        }
        return;
      }

      // Line and gradient variants use SVG stroke animation
      const path = containerRef.current.querySelector('line, path');
      if (!path) return;

      if ('getTotalLength' in path && typeof path.getTotalLength === 'function') {
        const length = (path as SVGGeometryElement).getTotalLength();
        gsap.set(path, {
          strokeDasharray: length,
          strokeDashoffset: length,
        });

        gsap.to(path, {
          strokeDashoffset: 0,
          duration: ANIMATION_CONFIG.duration.cinematic,
          ease: ANIMATION_CONFIG.ease.cinematic,
          scrollTrigger: {
            trigger: containerRef.current,
            start: ANIMATION_CONFIG.scrollTrigger.start,
            end: scrub ? ANIMATION_CONFIG.scrollTrigger.end : undefined,
            scrub: scrub === true ? ANIMATION_CONFIG.scrub.smooth : scrub || false,
            toggleActions: scrub ? undefined : ANIMATION_CONFIG.scrollTrigger.toggleActions,
          },
        });
      }
    },
    { scope: containerRef, dependencies: [variant, scrub, prefersReducedMotion] }
  );

  const strokeColor = color || 'var(--color-accent-primary)';
  const isHorizontal = direction === 'horizontal';

  if (variant === 'dots') {
    return (
      <div
        ref={containerRef}
        className={cn(
          'flex items-center justify-center gap-2 opacity-0',
          isHorizontal ? 'flex-row' : 'flex-col',
          className
        )}
        aria-hidden
      >
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="section-divider-dot h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: strokeColor }}
          />
        ))}
      </div>
    );
  }

  if (variant === 'gradient') {
    return (
      <div
        ref={containerRef}
        className={cn(
          isHorizontal ? 'h-px w-full' : 'h-full w-px',
          className
        )}
        aria-hidden
      >
        <svg
          width="100%"
          height="100%"
          viewBox={isHorizontal ? '0 0 1000 2' : '0 0 2 1000'}
          preserveAspectRatio="none"
          className="h-full w-full"
        >
          <defs>
            <linearGradient
              id="divider-gradient"
              x1="0"
              y1="0"
              x2={isHorizontal ? '1' : '0'}
              y2={isHorizontal ? '0' : '1'}
            >
              <stop offset="0%" stopColor={strokeColor} stopOpacity="0" />
              <stop offset="50%" stopColor={strokeColor} stopOpacity="0.6" />
              <stop offset="100%" stopColor={strokeColor} stopOpacity="0" />
            </linearGradient>
          </defs>
          <line
            x1="0"
            y1={isHorizontal ? '1' : '0'}
            x2={isHorizontal ? '1000' : '1'}
            y2={isHorizontal ? '1' : '1000'}
            stroke="url(#divider-gradient)"
            strokeWidth="2"
          />
        </svg>
      </div>
    );
  }

  // Default: line variant
  return (
    <div
      ref={containerRef}
      className={cn(
        isHorizontal ? 'h-px w-full' : 'h-full w-px',
        className
      )}
      aria-hidden
    >
      <svg
        width="100%"
        height="100%"
        viewBox={isHorizontal ? '0 0 1000 2' : '0 0 2 1000'}
        preserveAspectRatio="none"
        className="h-full w-full"
      >
        <line
          x1="0"
          y1={isHorizontal ? '1' : '0'}
          x2={isHorizontal ? '1000' : '1'}
          y2={isHorizontal ? '1' : '1000'}
          stroke={strokeColor}
          strokeWidth="2"
          opacity="0.3"
        />
      </svg>
    </div>
  );
}
