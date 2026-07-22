'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, registerGSAPPlugins } from '@/lib/animations/gsap-setup';
import { ANIMATION_CONFIG } from '@/lib/animations/config';
import { cn } from '@/lib/utils/cn';

interface HorizontalScrollProps {
  children: React.ReactNode;
  className?: string;
  speed?: number;
}

export function HorizontalScroll({
  children,
  className,
  speed = 1,
}: HorizontalScrollProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  registerGSAPPlugins();

  useGSAP(
    () => {
      if (!sectionRef.current || !trackRef.current) return;

      const track = trackRef.current;
      // Re-measure on every ScrollTrigger.refresh() (resize / orientation change)
      // instead of capturing once at mount — a static distance leaves the track
      // panning the wrong amount after a rotation (overshoot or unreachable tail).
      const getDistance = () => track.scrollWidth - track.clientWidth;

      if (getDistance() <= 0) return;

      gsap.to(track, {
        x: () => -getDistance(),
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: () => `+=${getDistance() * speed}`,
          scrub: ANIMATION_CONFIG.scrub.smooth,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });
    },
    { scope: sectionRef, dependencies: [speed] }
  );

  return (
    <div ref={sectionRef} className={cn('overflow-hidden', className)}>
      <div
        ref={trackRef}
        className="flex w-max"
      >
        {children}
      </div>
    </div>
  );
}
