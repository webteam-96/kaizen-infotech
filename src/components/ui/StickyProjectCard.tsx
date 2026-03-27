'use client';

import {
  motion,
  useInView,
  useMotionValue,
  useScroll,
  useTransform,
} from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils/cn';

export interface StickyProjectCardProps {
  title: string;
  client: string;
  category: string;
  year: string;
  image: string;
  slug: string;
  index: number;
}

const VERT_MARGIN = 10; // vh — sticky top + top/bottom breathing room

export function StickyProjectCard({
  title,
  client,
  category,
  year,
  image,
  slug,
  index,
}: StickyProjectCardProps) {
  const container = useRef<HTMLDivElement>(null);
  const [maxScrollY, setMaxScrollY] = useState(Infinity);

  // `tilt` drives both the card rotation and the counter-rotation on the inner image
  const tilt = useMotionValue(0);
  const counterTilt = useTransform(tilt, (v) => -v);

  // scale is set manually inside the scrollY listener
  const scale = useMotionValue(1);

  const { scrollY } = useScroll({ target: container });

  // Capture the scroll position the moment this card locks into its sticky position
  const isInView = useInView(container, {
    margin: `0px 0px -${100 - VERT_MARGIN}% 0px`,
    once: true,
  });

  useEffect(() => {
    if (isInView) setMaxScrollY(scrollY.get());
  }, [isInView, scrollY]);

  // Drive scale + tilt from raw scrollY once the card has "stuck"
  useEffect(() => {
    const unsubscribe = scrollY.on('change', (y) => {
      if (y <= maxScrollY) {
        scale.set(1);
        tilt.set(0);
        return;
      }
      const progress = Math.max(0, 1 - (y - maxScrollY) / 10000);
      scale.set(progress);
      tilt.set((1 - progress) * 100);
    });
    return unsubscribe;
  }, [scrollY, maxScrollY, scale, tilt]);

  return (
    <motion.div
      ref={container}
      className="sticky w-full max-w-5xl overflow-hidden"
      style={{
        scale,
        rotate: tilt,
        borderRadius: 'var(--radius-xl)',
        height: `${100 - 2 * VERT_MARGIN}vh`,
        top: `${VERT_MARGIN}vh`,
        background: 'var(--color-bg-secondary)',
      }}
    >
      <Link
        href={`/work/${slug}`}
        className="relative block h-full w-full"
        aria-label={`View project: ${title}`}
      >
        {/* Project image — object-contain so mockups/screenshots aren't cropped */}
        <motion.div
          className="absolute inset-0"
          style={{ rotate: counterTilt }}
        >
          <Image
            src={image}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, 80vw"
            className="object-contain p-6 md:p-10"
            priority={index < 2}
          />
        </motion.div>

        {/* Dark gradient at bottom so text stays legible */}
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg-inverse)]/75 via-[var(--color-bg-inverse)]/15 to-transparent"
        />

        {/* Category pill — top left */}
        <div className="absolute left-6 top-6 md:left-10 md:top-8">
          <span
            className={cn(
              'inline-block rounded-[var(--radius-full)] px-3 py-1',
              'bg-[var(--color-accent-primary)]/10 text-[var(--color-accent-primary)]',
              'text-[length:var(--text-xs)] font-medium uppercase tracking-wider'
            )}
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            {category}
          </span>
        </div>

        {/* Title + client + CTA — bottom */}
        <div className="absolute inset-x-0 bottom-0 p-6 md:p-10">
          <h3
            className="mb-1 text-[clamp(1.5rem,3vw,2.5rem)] font-bold leading-tight text-[var(--color-text-inverse)]"
            style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}
          >
            {title}
          </h3>
          <p
            className="mb-5 text-[length:var(--text-sm)] text-[var(--color-text-inverse)]/60"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            {client}
          </p>
          <span
            className={cn(
              'inline-flex items-center gap-2',
              'border-b border-[var(--color-text-inverse)]/30 pb-0.5',
              'text-[length:var(--text-xs)] font-semibold uppercase tracking-[0.06em]',
              'text-[var(--color-text-inverse)]/70'
            )}
            style={{ fontFamily: 'var(--font-body)' }}
          >
            View Case Study
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m7 17 9.2-9.2M17 17V8H8" />
            </svg>
          </span>
        </div>
      </Link>
    </motion.div>
  );
}
