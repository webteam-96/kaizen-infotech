'use client';

import React, { useRef } from 'react';
import { motion, useInView as useFramerInView } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils/cn';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ProjectCardProps {
  title: string;
  client: string;
  category: string;
  year: string;
  image: string;
  slug: string;
  featured?: boolean;
}

// ---------------------------------------------------------------------------
// Spring config
// ---------------------------------------------------------------------------

const spring = {
  type: 'spring' as const,
  stiffness: 300,
  damping: 25,
  mass: 0.8,
};

// ---------------------------------------------------------------------------
// ProjectCard component
// ---------------------------------------------------------------------------

export function ProjectCard({
  title,
  client,
  category,
  year,
  image,
  slug,
  featured = false,
}: ProjectCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const isInView = useFramerInView(cardRef, { once: true, margin: '-100px' });

  return (
    <motion.div
      ref={cardRef}
      className={cn(
        'group relative overflow-hidden rounded-[var(--radius-lg)]',
        featured ? 'col-span-2 aspect-[16/10]' : 'col-span-1 aspect-[4/5]',
        'cursor-none'
      )}
      data-cursor="view"
      initial={{ clipPath: 'inset(100% 0 0 0)' }}
      animate={isInView ? { clipPath: 'inset(0% 0 0 0)' } : undefined}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link
        href={`/work/${slug}`}
        className="block h-full w-full"
        aria-label={`View project: ${title}`}
      >
        {/* Background image */}
        <motion.div
          className="absolute inset-0"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <Image
            src={image}
            alt={title}
            fill
            sizes={featured ? '(max-width: 768px) 100vw, 66vw' : '(max-width: 768px) 100vw, 33vw'}
            className="object-cover"
          />
        </motion.div>

        {/* Dark gradient overlay — always visible at bottom */}
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg-inverse)]/80 via-[var(--color-bg-inverse)]/20 to-transparent"
        />

        {/* Hover overlay — extra darkening */}
        <div
          aria-hidden
          className="absolute inset-0 bg-[var(--color-bg-inverse)]/0 transition-colors duration-300 group-hover:bg-[var(--color-bg-inverse)]/20"
        />

        {/* Info overlay — slides up from bottom on hover */}
        <div className="absolute inset-x-0 bottom-0 flex flex-col p-6 md:p-8">
          {/* Category pill + Year */}
          <motion.div
            className="mb-3 flex items-center gap-3"
            initial={{ opacity: 0, y: 16 }}
            animate={isInView ? { opacity: 1, y: 0 } : undefined}
            transition={{ delay: 0.3, ...spring }}
          >
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
            <span
              className="text-[length:var(--text-xs)] text-[var(--color-text-inverse)]/70"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              {year}
            </span>
          </motion.div>

          {/* Title */}
          <motion.h3
            className="mb-1 text-[length:var(--text-2xl)] font-bold text-[var(--color-text-inverse)]"
            style={{ fontFamily: 'var(--font-heading)' }}
            initial={{ opacity: 0, y: 16 }}
            animate={isInView ? { opacity: 1, y: 0 } : undefined}
            transition={{ delay: 0.4, ...spring }}
          >
            {title}
          </motion.h3>

          {/* Client — revealed on hover */}
          <motion.p
            className={cn(
              'text-[length:var(--text-sm)] text-[var(--color-text-inverse)]/70',
              'translate-y-4 opacity-0 transition-all duration-300',
              'group-hover:translate-y-0 group-hover:opacity-100'
            )}
            style={{ fontFamily: 'var(--font-body)' }}
          >
            {client}
          </motion.p>
        </div>
      </Link>
    </motion.div>
  );
}
