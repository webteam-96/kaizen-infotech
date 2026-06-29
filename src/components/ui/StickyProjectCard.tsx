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
  description: string;
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
  description,
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
      className="card-red-accent group sticky w-full max-w-5xl overflow-hidden"
      style={{
        // Explicit sticky: the `.card-red-accent` highlight class sets
        // position:relative, which (same specificity, later in the cascade) was
        // overriding the `sticky` utility and killing the scroll pin/scale stack.
        // Inline style wins over both, so the red detailing and the animation coexist.
        position: 'sticky',
        scale,
        rotate: tilt,
        borderRadius: 'var(--radius-xl)',
        height: `${100 - 2 * VERT_MARGIN}vh`,
        top: `${VERT_MARGIN}vh`,
        background: 'var(--color-bg-secondary)',
        // Layered lift so the card clearly rises off the light-blue band: a soft
        // red halo (brand detailing) over the existing blue-tinted depth shadow.
        boxShadow:
          '0 50px 90px -26px rgba(192,0,0,0.22), 0 34px 60px -28px rgba(13,71,161,0.48), 0 16px 28px -16px rgba(0,0,0,0.30)',
      }}
    >
      <Link
        href={`/work/${slug}`}
        className="focus-ring relative block h-full w-full"
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

        {/* Blue gradient at bottom so text stays legible (brand blue, not black) */}
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-[rgba(13,71,161,0.88)] via-[rgba(21,101,192,0.34)] to-transparent"
        />

        {/* Category pill — top left */}
        <div className="absolute left-6 top-6 md:left-10 md:top-8">
          <span
            className={cn(
              'inline-block rounded-[var(--radius-full)] px-4 py-1.5',
              'bg-[var(--red-brand)] text-[var(--color-text-inverse)] shadow-sm',
              'text-[length:var(--text-sm)] font-semibold uppercase tracking-wider'
            )}
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            {category}
          </span>
        </div>

        {/* Title + client + description + CTA — bottom */}
        <div className="absolute inset-x-0 bottom-0 p-8 md:p-12">
          <h3
            className="mb-2 text-[length:var(--h-sub)] font-bold leading-tight text-[var(--color-text-inverse)]"
            style={{ fontFamily: 'var(--font-card-heading), var(--font-display)', letterSpacing: '-0.02em' }}
          >
            {title}
          </h3>
          <p
            className="mb-4 text-[length:var(--text-base)] text-[var(--color-text-inverse)]/70"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            {client}
          </p>
          <p
            className="mb-7 line-clamp-3 max-w-2xl text-[length:var(--text-base)] md:text-[length:var(--text-lg)] leading-relaxed text-[var(--color-text-inverse)]/85"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            {description}
          </p>
          <span
            className={cn(
              'inline-flex items-center gap-2.5',
              'border-b-[1.5px] border-[var(--red-coral)] pb-1',
              'text-[length:var(--text-sm)] font-semibold uppercase tracking-[0.06em]',
              'text-[var(--red-coral)]'
            )}
            style={{ fontFamily: 'var(--font-body)' }}
          >
            View Case Study
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-transform duration-300 group-hover:translate-x-1"
            >
              <path d="m7 17 9.2-9.2M17 17V8H8" />
            </svg>
          </span>
        </div>
      </Link>
    </motion.div>
  );
}
