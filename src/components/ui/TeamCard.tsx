'use client';

import React, { useRef } from 'react';
import { motion, useInView as useFramerInView } from 'framer-motion';
import Image from 'next/image';
import { cn } from '@/lib/utils/cn';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TeamCardProps {
  name: string;
  role: string;
  image: string;
  bio?: string;
  social?: {
    linkedin?: string;
    twitter?: string;
    github?: string;
  };
  index?: number;
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
// Social icon SVGs
// ---------------------------------------------------------------------------

function LinkedInIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-4 0v7h-4v-7a6 6 0 016-6zM2 9h4v12H2zM4 6a2 2 0 100-4 2 2 0 000 4z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TwitterIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Height variations for staggered layout
// ---------------------------------------------------------------------------

const heightVariations = [
  'min-h-[420px]',
  'min-h-[460px]',
  'min-h-[440px]',
  'min-h-[480px]',
];

// ---------------------------------------------------------------------------
// TeamCard component
// ---------------------------------------------------------------------------

export function TeamCard({
  name,
  role,
  image,
  bio,
  social,
  index = 0,
}: TeamCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const isInView = useFramerInView(cardRef, { once: true, margin: '-50px' });

  const hasSocial = social && (social.linkedin || social.twitter || social.github);
  const heightClass = heightVariations[index % heightVariations.length];

  return (
    <motion.article
      ref={cardRef}
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-[var(--radius-lg)]',
        'bg-[var(--color-bg-tertiary)] border border-[var(--color-border)]',
        'transition-[border-color] duration-300 hover:border-[var(--color-border-hover)]',
        heightClass
      )}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : undefined}
      transition={{ delay: index * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Portrait image with clip-path circle reveal */}
      <div className="relative flex-1 overflow-hidden">
        <motion.div
          className="absolute inset-0"
          initial={{ clipPath: 'circle(0% at 50% 50%)' }}
          animate={isInView ? { clipPath: 'circle(75% at 50% 50%)' } : undefined}
          transition={{ duration: 1, delay: index * 0.1 + 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <Image
            src={image}
            alt={name}
            fill
            sizes="(max-width: 768px) 100vw, 25vw"
            className={cn(
              'object-cover transition-all duration-500',
              'group-hover:scale-105 group-hover:saturate-[1.2]'
            )}
          />
        </motion.div>

        {/* Duotone overlay on hover */}
        <div
          aria-hidden
          className={cn(
            'absolute inset-0 mix-blend-color opacity-0 transition-opacity duration-500',
            'group-hover:opacity-20'
          )}
          style={{ backgroundColor: 'var(--color-accent-primary)' }}
        />
      </div>

      {/* Info section */}
      <div className="relative p-6">
        {/* Name */}
        <h3
          className={cn(
            'mb-1 text-[length:var(--text-lg)] font-semibold text-[var(--color-text-primary)]',
            'relative inline-block'
          )}
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          {name}
          {/* Underline on hover */}
          <span
            aria-hidden
            className="absolute bottom-0 left-0 h-[2px] w-0 bg-[var(--color-accent-primary)] transition-all duration-300 group-hover:w-full"
          />
        </h3>

        {/* Role */}
        <p
          className="text-[length:var(--text-sm)] text-[var(--color-text-secondary)]"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          {role}
        </p>

        {/* Bio (optional) */}
        {bio && (
          <p
            className="mt-2 text-[length:var(--text-xs)] leading-relaxed text-[var(--color-text-tertiary)]"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            {bio}
          </p>
        )}

        {/* Social links — float in from bottom on hover */}
        {hasSocial && (
          <div className="mt-4 flex items-center gap-3">
            {social.linkedin && (
              <motion.a
                href={social.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--color-text-tertiary)] transition-colors duration-200 hover:text-[var(--color-accent-primary)]"
                aria-label={`${name} on LinkedIn`}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1, ...spring }}
                whileHover={{ scale: 1.15 }}
              >
                <LinkedInIcon />
              </motion.a>
            )}
            {social.twitter && (
              <motion.a
                href={social.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--color-text-tertiary)] transition-colors duration-200 hover:text-[var(--color-accent-primary)]"
                aria-label={`${name} on Twitter`}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, ...spring }}
                whileHover={{ scale: 1.15 }}
              >
                <TwitterIcon />
              </motion.a>
            )}
            {social.github && (
              <motion.a
                href={social.github}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--color-text-tertiary)] transition-colors duration-200 hover:text-[var(--color-accent-primary)]"
                aria-label={`${name} on GitHub`}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, ...spring }}
                whileHover={{ scale: 1.15 }}
              >
                <GitHubIcon />
              </motion.a>
            )}
          </div>
        )}
      </div>
    </motion.article>
  );
}
