'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { useScrollStore } from '@/lib/store/scroll-store';

function getSectionCount() {
  if (typeof document === 'undefined') return 0;
  return document.querySelectorAll('[data-section-index]').length;
}

const noopSubscribe = () => () => {};

export default function SectionCounter() {
  const totalSections = useSyncExternalStore(noopSubscribe, getSectionCount, () => 0);
  const activeSection = useScrollStore((s) => s.activeSection);
  const setActiveSection = useScrollStore((s) => s.setActiveSection);
  const [displayIndex, setDisplayIndex] = useState(0);
  const [nextIndex, setNextIndex] = useState(0);
  const [flip, setFlip] = useState(false);
  const [direction, setDirection] = useState<'up' | 'down'>('down');

  // Derived state: detect section change and trigger flip animation
  const [prevActiveSection, setPrevActiveSection] = useState(activeSection);
  if (activeSection !== prevActiveSection) {
    const goingDown = activeSection > prevActiveSection;
    setPrevActiveSection(activeSection);
    setDirection(goingDown ? 'down' : 'up');
    setNextIndex(activeSection);
    setFlip(true);
  }

  // Observe sections for active tracking
  useEffect(() => {
    const sections = document.querySelectorAll<HTMLElement>('[data-section-index]');

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        let maxRatio = 0;
        let bestIndex = -1;

        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > maxRatio) {
            maxRatio = entry.intersectionRatio;
            const idx = Number(
              (entry.target as HTMLElement).dataset.sectionIndex
            );
            if (!isNaN(idx)) {
              bestIndex = idx;
            }
          }
        });

        if (bestIndex >= 0) {
          setActiveSection(bestIndex);
        }
      },
      {
        threshold: [0.1, 0.3, 0.5, 0.7],
        rootMargin: '-10% 0px -10% 0px',
      }
    );

    sections.forEach((section) => observer.observe(section));

    return () => {
      observer.disconnect();
    };
  }, [setActiveSection]);

  // Complete flip animation after delay
  useEffect(() => {
    if (!flip) return;

    const timeout = setTimeout(() => {
      setDisplayIndex(nextIndex);
      setFlip(false);
    }, 300);

    return () => clearTimeout(timeout);
  }, [flip, nextIndex]);

  if (totalSections === 0) return null;

  const currentLabel = String(displayIndex + 1).padStart(2, '0');
  const nextLabel = String(nextIndex + 1).padStart(2, '0');
  const totalLabel = String(totalSections).padStart(2, '0');

  // When flipping down: old slides up and out, new slides up from below
  // When flipping up: old slides down and out, new slides down from above
  const outgoingTransform = flip
    ? direction === 'down'
      ? 'translateY(-100%)'
      : 'translateY(100%)'
    : 'translateY(0)';

  const incomingTransform = flip
    ? 'translateY(0)'
    : direction === 'down'
      ? 'translateY(100%)'
      : 'translateY(-100%)';

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 'var(--space-8)',
        right: 'var(--space-8)',
        zIndex: 100,
        fontFamily: 'var(--font-mono)',
        fontSize: 'var(--text-sm)',
        color: 'var(--color-text-secondary)',
        backdropFilter: 'blur(var(--blur-sm))',
        backgroundColor: 'var(--color-surface-glass)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        padding: 'var(--space-2) var(--space-4)',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-1)',
        pointerEvents: 'none',
        userSelect: 'none',
      }}
    >
      <span
        style={{
          display: 'inline-block',
          overflow: 'hidden',
          height: '1.2em',
          lineHeight: '1.2em',
          position: 'relative',
          width: '1.6em',
          textAlign: 'right',
        }}
      >
        {/* Outgoing digit */}
        <span
          style={{
            display: 'block',
            transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            transform: outgoingTransform,
            color: 'var(--color-accent-primary)',
          }}
        >
          {flip ? currentLabel : nextLabel}
        </span>
        {/* Incoming digit */}
        <span
          style={{
            display: 'block',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            textAlign: 'right',
            transition: flip
              ? 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
              : 'none',
            transform: incomingTransform,
            color: 'var(--color-accent-primary)',
          }}
        >
          {nextLabel}
        </span>
      </span>
      <span style={{ opacity: 0.4 }}>/</span>
      <span style={{ width: '1.6em' }}>{totalLabel}</span>
    </div>
  );
}
