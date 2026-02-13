'use client';

import { useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, registerGSAPPlugins } from '@/lib/animations/gsap-setup';
import { ANIMATION_CONFIG } from '@/lib/animations/config';
import { ServiceCard } from '@/components/ui/ServiceCard';
import { services } from '@/content/services';

// Icon components for services
function CodeIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
    </svg>
  );
}
function SmartphoneIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="2" width="14" height="20" rx="2" ry="2" /><line x1="12" y1="18" x2="12.01" y2="18" />
    </svg>
  );
}
function CalendarIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}
function GlobeIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
    </svg>
  );
}
function TrendingUpIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
    </svg>
  );
}

const serviceIcons = [
  <CodeIcon key="code" />,
  <SmartphoneIcon key="phone" />,
  <CalendarIcon key="calendar" />,
  <GlobeIcon key="globe" />,
  <TrendingUpIcon key="trending" />,
];

export function ServicesScroll() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);

  registerGSAPPlugins();

  useGSAP(
    () => {
      if (!sectionRef.current || !trackRef.current) return;

      const track = trackRef.current;
      const scrollWidth = track.scrollWidth - track.clientWidth;

      if (scrollWidth <= 0) return;

      gsap.to(track, {
        x: -scrollWidth,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: () => `+=${scrollWidth}`,
          scrub: ANIMATION_CONFIG.scrub.smooth,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            setScrollProgress(self.progress);
            const idx = Math.min(
              services.length - 1,
              Math.floor(self.progress * services.length)
            );
            setActiveIndex(idx);
          },
        },
      });
    },
    { scope: sectionRef, dependencies: [] }
  );

  return (
    <section data-section-index={2}>
      <div ref={sectionRef} className="overflow-hidden bg-[var(--color-bg-primary)]">
        {/* Header */}
        <div className="flex items-end justify-between px-[var(--container-padding)] pt-[var(--space-section)]">
          <div className="flex items-baseline gap-4">
            <span
              className="text-[length:var(--text-xs)] font-medium uppercase tracking-widest text-[var(--color-text-tertiary)]"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              Services
            </span>
            <span
              className="text-[length:var(--text-xs)] text-[var(--color-accent-primary)]"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              01
            </span>
          </div>
          <span
            className="text-[length:var(--text-xs)] text-[var(--color-text-tertiary)]"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            {String(activeIndex + 1).padStart(2, '0')} / {String(services.length).padStart(2, '0')}
          </span>
        </div>

        {/* Track */}
        <div
          ref={trackRef}
          className="flex w-max items-center gap-8 px-[var(--container-padding)] py-16"
        >
          {services.map((service, i) => (
            <ServiceCard
              key={service.id}
              icon={serviceIcons[i] || serviceIcons[0]}
              title={service.title}
              description={service.description}
              index={i}
              isActive={i === activeIndex}
            />
          ))}
        </div>

        {/* Progress bar */}
        <div className="mx-[var(--container-padding)] mb-8 h-px bg-[var(--color-border)]">
          <div
            className="h-full bg-[var(--color-accent-primary)] transition-all duration-100"
            style={{ width: `${scrollProgress * 100}%` }}
          />
        </div>
      </div>
    </section>
  );
}
