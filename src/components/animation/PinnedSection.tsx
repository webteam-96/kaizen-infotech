'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger, registerGSAPPlugins } from '@/lib/animations/gsap-setup';
import { ANIMATION_CONFIG } from '@/lib/animations/config';
import { cn } from '@/lib/utils/cn';

interface PinnedSectionProps {
  children: React.ReactNode;
  pinSpacing?: boolean;
  duration?: string;
  className?: string;
  onProgress?: (progress: number) => void;
}

export function PinnedSection({
  children,
  pinSpacing = true,
  duration = '+=200%',
  className,
  onProgress,
}: PinnedSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);

  registerGSAPPlugins();

  useGSAP(
    () => {
      if (!sectionRef.current) return;

      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top top',
        end: duration,
        pin: true,
        pinSpacing,
        scrub: ANIMATION_CONFIG.scrub.smooth,
        onUpdate: onProgress
          ? (self) => onProgress(self.progress)
          : undefined,
      });
    },
    { scope: sectionRef, dependencies: [pinSpacing, duration] }
  );

  return (
    <div ref={sectionRef} className={cn(className)}>
      {children}
    </div>
  );
}
