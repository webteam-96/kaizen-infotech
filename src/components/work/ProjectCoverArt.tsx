'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks';
import { cn } from '@/lib/utils/cn';

/**
 * ProjectCoverArt — bespoke, brand-on SVG "cover photography" for each case study.
 * Deterministic per slug, themed by category, and gently animated (reduced-motion aware).
 * Fully owned vector art — no external imagery, no hotlinking, crisp at any size.
 */

const NAVY = '#0a1929';
const NAVY2 = '#0e2238';
const BLUE = '#2196F3';
const SKY = '#87CEEB';
const RED = '#C00000';

function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

type Motif =
  | 'network'
  | 'government'
  | 'enterprise'
  | 'healthcare'
  | 'mobility'
  | 'social';

function motifFor(category: string): Motif {
  const c = category.toLowerCase();
  if (c.includes('government')) return 'government';
  if (c.includes('enterprise')) return 'enterprise';
  if (c.includes('health')) return 'healthcare';
  if (c.includes('mobility')) return 'mobility';
  if (c.includes('social')) return 'social';
  return 'network'; // Global Community + default
}

interface ProjectCoverArtProps {
  slug: string;
  category: string;
  /** Overrides the category-derived motif. */
  motif?: string;
  className?: string;
}

export function ProjectCoverArt({
  slug,
  category,
  motif,
  className,
}: ProjectCoverArtProps) {
  const reduce = useReducedMotion();
  const seed = useMemo(() => hash(slug), [slug]);
  const kind = (motif as Motif) || motifFor(category);

  // A scatter of background "stars" placed deterministically from the seed.
  const stars = useMemo(
    () =>
      Array.from({ length: 26 }, (_, i) => {
        const s = (seed >> (i % 12)) * (i + 7);
        return {
          x: (s % 780) + 10,
          y: ((s >> 4) % 470) + 10,
          r: 0.6 + ((s >> 2) % 16) / 10,
          o: 0.12 + ((s >> 5) % 30) / 100,
          d: ((s >> 3) % 30) / 10,
        };
      }),
    [seed]
  );

  const breathe = reduce
    ? {}
    : {
        animate: { opacity: [0.55, 1, 0.55] },
        transition: { duration: 6, repeat: Infinity, ease: 'easeInOut' as const },
      };

  return (
    <div className={cn('relative overflow-hidden', className)} aria-hidden>
      <svg
        viewBox="0 0 800 500"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full"
      >
        <defs>
          <linearGradient id={`bg-${slug}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={NAVY} />
            <stop offset="55%" stopColor={NAVY2} />
            <stop offset="100%" stopColor={NAVY} />
          </linearGradient>
          <radialGradient id={`glow-${slug}`} cx="50%" cy="42%" r="65%">
            <stop offset="0%" stopColor={BLUE} stopOpacity="0.28" />
            <stop offset="60%" stopColor={BLUE} stopOpacity="0.05" />
            <stop offset="100%" stopColor={BLUE} stopOpacity="0" />
          </radialGradient>
          <pattern
            id={`grid-${slug}`}
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M40 0H0V40"
              fill="none"
              stroke={SKY}
              strokeWidth="0.5"
              opacity="0.08"
            />
          </pattern>
        </defs>

        {/* Base */}
        <rect width="800" height="500" fill={`url(#bg-${slug})`} />
        <rect width="800" height="500" fill={`url(#grid-${slug})`} />
        <rect width="800" height="500" fill={`url(#glow-${slug})`} />

        {/* Star field */}
        <g>
          {stars.map((st, i) =>
            reduce ? (
              <circle key={i} cx={st.x} cy={st.y} r={st.r} fill={SKY} opacity={st.o} />
            ) : (
              <motion.circle
                key={i}
                cx={st.x}
                cy={st.y}
                r={st.r}
                fill={SKY}
                initial={{ opacity: st.o }}
                animate={{ opacity: [st.o, st.o + 0.35, st.o] }}
                transition={{
                  duration: 3 + st.d,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: st.d,
                }}
              />
            )
          )}
        </g>

        {/* Motif */}
        <motion.g {...breathe}>
          {kind === 'network' && <NetworkMotif reduce={reduce} />}
          {kind === 'government' && <GovernmentMotif reduce={reduce} />}
          {kind === 'enterprise' && <EnterpriseMotif reduce={reduce} />}
          {kind === 'healthcare' && <HealthcareMotif reduce={reduce} />}
          {kind === 'mobility' && <MobilityMotif reduce={reduce} />}
          {kind === 'social' && <SocialMotif reduce={reduce} />}
        </motion.g>
      </svg>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Motifs
// ---------------------------------------------------------------------------

const spin = (dur: number, reduce: boolean) =>
  reduce
    ? {}
    : {
        animate: { rotate: 360 },
        transition: { duration: dur, repeat: Infinity, ease: 'linear' as const },
        style: { transformOrigin: '400px 250px' },
      };

function NetworkMotif({ reduce }: { reduce: boolean }) {
  // Orbiting connected nodes around a bright core — global community.
  const nodes = [
    [400, 120],
    [560, 200],
    [560, 320],
    [400, 400],
    [240, 320],
    [240, 200],
  ] as const;
  return (
    <g>
      <motion.g {...spin(60, reduce)}>
        <circle cx="400" cy="250" r="170" fill="none" stroke={BLUE} strokeWidth="1" opacity="0.35" strokeDasharray="4 6" />
        <circle cx="400" cy="250" r="120" fill="none" stroke={SKY} strokeWidth="1" opacity="0.25" />
      </motion.g>
      {nodes.map(([x, y], i) => (
        <line key={i} x1="400" y1="250" x2={x} y2={y} stroke={BLUE} strokeWidth="1" opacity="0.3" />
      ))}
      {nodes.map(([x, y], i) => (
        <motion.circle
          key={i}
          cx={x}
          cy={y}
          r="9"
          fill={i % 5 === 0 ? RED : SKY}
          initial={{ opacity: 0.85 }}
          animate={reduce ? undefined : { y: [0, i % 2 ? -8 : 8, 0] }}
          transition={reduce ? undefined : { duration: 4 + i, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
      <circle cx="400" cy="250" r="34" fill={BLUE} opacity="0.85" />
      <circle cx="400" cy="250" r="16" fill="#fff" opacity="0.9" />
    </g>
  );
}

function GovernmentMotif({ reduce }: { reduce: boolean }) {
  // Classic colonnade + shield — public institutions.
  return (
    <g>
      <motion.g
        initial={{ opacity: 0.9 }}
        animate={reduce ? undefined : { y: [0, -6, 0] }}
        transition={reduce ? undefined : { duration: 7, repeat: Infinity, ease: 'easeInOut' }}
      >
        {/* roof */}
        <path d="M250 170 L400 110 L550 170 Z" fill={BLUE} opacity="0.85" />
        <rect x="262" y="172" width="276" height="14" fill={SKY} opacity="0.55" />
        {/* columns */}
        {[280, 330, 380, 430, 480].map((x, i) => (
          <rect key={i} x={x} y="195" width="20" height="150" rx="3" fill={SKY} opacity="0.35" />
        ))}
        <rect x="258" y="350" width="284" height="16" rx="3" fill={BLUE} opacity="0.7" />
      </motion.g>
      {/* shield */}
      <motion.path
        d="M400 250 L444 266 V300 Q444 338 400 356 Q356 338 356 300 V266 Z"
        fill={RED}
        opacity="0.9"
        initial={{ scale: 1 }}
        animate={reduce ? undefined : { scale: [1, 1.06, 1] }}
        transition={reduce ? undefined : { duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transformOrigin: '400px 300px' }}
      />
      <path d="M384 302 l11 11 l22 -24" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
}

function EnterpriseMotif({ reduce }: { reduce: boolean }) {
  // Secure modular blocks + a lock — enterprise platforms.
  const blocks = [
    [300, 150],
    [360, 150],
    [420, 150],
    [300, 210],
    [420, 210],
    [300, 270],
    [360, 270],
    [420, 270],
  ] as const;
  return (
    <g>
      {blocks.map(([x, y], i) => (
        <motion.rect
          key={i}
          x={x}
          y={y}
          width="48"
          height="48"
          rx="8"
          fill={i === 4 ? RED : BLUE}
          opacity={i === 4 ? 0.9 : 0.3 + (i % 3) * 0.18}
          initial={{ opacity: 0.4 }}
          animate={reduce ? undefined : { opacity: [0.35, 0.8, 0.35] }}
          transition={reduce ? undefined : { duration: 3 + (i % 4), repeat: Infinity, ease: 'easeInOut', delay: i * 0.2 }}
        />
      ))}
      {/* lock */}
      <g transform="translate(372 326)">
        <rect x="-26" y="0" width="52" height="40" rx="7" fill={SKY} opacity="0.9" />
        <path d="M-15 0 V-12 a15 15 0 0 1 30 0 V0" fill="none" stroke={SKY} strokeWidth="6" />
        <circle cx="0" cy="18" r="5" fill={NAVY} />
      </g>
    </g>
  );
}

function HealthcareMotif({ reduce }: { reduce: boolean }) {
  // Vitals pulse + medical cross — clinical platforms.
  return (
    <g>
      <motion.path
        d="M150 250 H320 l24 -60 l34 120 l28 -90 l22 50 H640"
        fill="none"
        stroke={SKY}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.85"
        initial={reduce ? undefined : { pathLength: 0 }}
        animate={reduce ? undefined : { pathLength: 1 }}
        transition={reduce ? undefined : { duration: 2.4, repeat: Infinity, repeatType: 'loop', ease: 'easeInOut', repeatDelay: 0.6 }}
      />
      <motion.g
        initial={{ opacity: 0.95 }}
        animate={reduce ? undefined : { scale: [1, 1.07, 1] }}
        transition={reduce ? undefined : { duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transformOrigin: '400px 330px' }}
      >
        <circle cx="400" cy="330" r="46" fill={BLUE} opacity="0.9" />
        <rect x="392" y="306" width="16" height="48" rx="4" fill="#fff" />
        <rect x="376" y="322" width="48" height="16" rx="4" fill="#fff" />
      </motion.g>
      <circle cx="250" cy="150" r="7" fill={RED} opacity="0.85" />
      <circle cx="560" cy="180" r="5" fill={SKY} opacity="0.7" />
    </g>
  );
}

function MobilityMotif({ reduce }: { reduce: boolean }) {
  // Route line with travelling pin — mobility & logistics.
  const d = 'M120 380 C 240 380 240 180 380 180 S 560 360 690 200';
  return (
    <g>
      <path d={d} fill="none" stroke={SKY} strokeWidth="2" opacity="0.25" strokeDasharray="2 8" strokeLinecap="round" />
      <motion.path
        d={d}
        fill="none"
        stroke={BLUE}
        strokeWidth="3"
        strokeLinecap="round"
        initial={reduce ? undefined : { pathLength: 0 }}
        animate={reduce ? undefined : { pathLength: [0, 1] }}
        transition={reduce ? undefined : { duration: 3.2, repeat: Infinity, ease: 'easeInOut', repeatDelay: 0.4 }}
      />
      {/* waypoint pins */}
      {[
        [120, 380],
        [690, 200],
      ].map(([x, y], i) => (
        <g key={i} transform={`translate(${x} ${y})`}>
          <path d="M0 0 C -16 -22 -16 -34 0 -34 C 16 -34 16 -22 0 0 Z" fill={i ? RED : BLUE} opacity="0.92" />
          <circle cx="0" cy="-24" r="6" fill="#fff" />
        </g>
      ))}
      {!reduce && (
        <motion.g animate={{ offsetDistance: ['0%', '100%'] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }} style={{ offsetPath: `path('${d}')` }}>
          <circle r="7" fill="#fff" />
          <circle r="13" fill="#fff" opacity="0.25" />
        </motion.g>
      )}
    </g>
  );
}

function SocialMotif({ reduce }: { reduce: boolean }) {
  // Heart core linked to a ring of beneficiary nodes — social impact / NGO.
  const ring = Array.from({ length: 8 }, (_, i) => {
    const a = (Math.PI * 2 * i) / 8 - Math.PI / 2;
    return [400 + Math.cos(a) * 150, 260 + Math.sin(a) * 130] as const;
  });
  return (
    <g>
      {ring.map(([x, y], i) => (
        <line key={`l${i}`} x1="400" y1="260" x2={x} y2={y} stroke={BLUE} strokeWidth="1" opacity="0.25" />
      ))}
      {ring.map(([x, y], i) => (
        <motion.circle
          key={`n${i}`}
          cx={x}
          cy={y}
          r="8"
          fill={SKY}
          initial={{ opacity: 0.8 }}
          animate={reduce ? undefined : { scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }}
          transition={reduce ? undefined : { duration: 3, repeat: Infinity, ease: 'easeInOut', delay: i * 0.25 }}
          style={{ transformOrigin: `${x}px ${y}px` }}
        />
      ))}
      <motion.path
        d="M400 300 C 360 262 360 222 388 222 C 400 222 400 234 400 234 C 400 234 400 222 412 222 C 440 222 440 262 400 300 Z"
        fill={RED}
        opacity="0.92"
        initial={{ scale: 1 }}
        animate={reduce ? undefined : { scale: [1, 1.12, 1] }}
        transition={reduce ? undefined : { duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transformOrigin: '400px 260px' }}
      />
    </g>
  );
}
