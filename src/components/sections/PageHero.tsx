'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, registerGSAPPlugins } from '@/lib/animations/gsap-setup';
import { ANIMATION_CONFIG } from '@/lib/animations/config';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/utils/cn';

registerGSAPPlugins();

interface Crumb {
  label: string;
  href?: string;
}

interface Stat {
  value: string;
  label: string;
}

interface PageHeroProps {
  kicker: string;
  title: string;
  /** Words within title rendered in the accent color (matched case-insensitively). */
  accentWords?: string[];
  description?: string;
  breadcrumbs?: Crumb[];
  stats?: Stat[];
  align?: 'left' | 'center';
  /** Extra content under the description (e.g. rotating keyword). */
  children?: React.ReactNode;
}

const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E\")";

export function PageHero({
  kicker,
  title,
  accentWords = [],
  description,
  stats,
  align = 'left',
  children,
}: PageHeroProps) {
  const rootRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const accentSet = new Set(accentWords.map((w) => w.toLowerCase().replace(/[^\w]/g, '')));

  useGSAP(
    () => {
      if (!rootRef.current) return;
      const words = rootRef.current.querySelectorAll<HTMLElement>('[data-ph-word] > span');
      const rest = rootRef.current.querySelectorAll<HTMLElement>('[data-ph-rest]');
      if (prefersReducedMotion) {
        gsap.set([words, rest], { opacity: 1, yPercent: 0, y: 0 });
        return;
      }
      const tl = gsap.timeline({ defaults: { ease: ANIMATION_CONFIG.ease.textReveal } });
      tl.fromTo(
        words,
        { yPercent: 112 },
        {
          yPercent: 0,
          duration: ANIMATION_CONFIG.duration.slow,
          stagger: ANIMATION_CONFIG.stagger.fast,
        }
      ).fromTo(
        rest,
        { opacity: 0, y: 18 },
        {
          opacity: 1,
          y: 0,
          duration: ANIMATION_CONFIG.duration.normal,
          stagger: ANIMATION_CONFIG.stagger.normal,
          ease: ANIMATION_CONFIG.ease.smooth,
        },
        '-=0.45'
      );
    },
    { scope: rootRef, dependencies: [prefersReducedMotion] }
  );

  const centered = align === 'center';

  return (
    <section
      ref={rootRef}
      className="relative flex min-h-[72vh] items-end overflow-hidden px-6 pb-[clamp(3rem,6vw,6rem)] pt-[clamp(8rem,14vh,11rem)]"
    >
      {/* Gradient mesh backdrop */}
      <div aria-hidden className="absolute inset-0 -z-10">
        <div
          className="ph-blob absolute left-[-12%] top-[-18%] h-[55vmax] w-[55vmax] rounded-full opacity-60 blur-3xl"
          style={{
            background:
              'radial-gradient(circle at 35% 35%, var(--accent-20), transparent 65%)',
            animation: 'ph-drift-a 22s ease-in-out infinite',
          }}
        />
        <div
          className="ph-blob absolute bottom-[-25%] right-[-10%] h-[48vmax] w-[48vmax] rounded-full opacity-50 blur-3xl"
          style={{
            background:
              'radial-gradient(circle at 60% 60%, rgba(135, 206, 235, 0.25), transparent 65%)',
            animation: 'ph-drift-b 26s ease-in-out infinite',
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.035] mix-blend-multiply"
          style={{ backgroundImage: GRAIN }}
        />
      </div>

      <div className={cn('mx-auto w-full max-w-7xl', centered && 'text-center')}>
        <p
          data-ph-rest
          className="mb-5 font-mono text-xs uppercase tracking-[0.24em] text-[var(--color-accent-primary)] opacity-0"
        >
          {kicker}
        </p>

        <h1
          className={cn(
            'max-w-[16ch] font-display text-[clamp(2.75rem,7vw,5.5rem)] font-semibold leading-[1.02] tracking-tight text-[var(--color-text-primary)]',
            centered && 'mx-auto'
          )}
        >
          {title.split(' ').map((word, i) => (
            <span
              key={i}
              data-ph-word
              className="inline-block overflow-hidden pb-[0.08em] align-bottom"
            >
              <span
                className={cn(
                  'inline-block',
                  accentSet.has(word.toLowerCase().replace(/[^\w]/g, '')) &&
                    'text-[var(--color-accent-primary)]'
                )}
              >
                {word}
              </span>
              {' '}
            </span>
          ))}
        </h1>

        {description && (
          <p
            data-ph-rest
            className={cn(
              'mt-7 max-w-[52ch] text-lg leading-relaxed text-[var(--color-text-secondary)] opacity-0',
              centered && 'mx-auto'
            )}
          >
            {description}
          </p>
        )}

        {children && (
          <div data-ph-rest className={cn('mt-6 opacity-0', centered && 'flex justify-center')}>
            {children}
          </div>
        )}

        {stats && stats.length > 0 && (
          <div
            data-ph-rest
            className={cn(
              'mt-12 flex flex-wrap gap-x-14 gap-y-6 border-t border-[var(--color-border)] pt-8 opacity-0',
              centered && 'justify-center'
            )}
          >
            {stats.map((stat) => (
              <div key={stat.label}>
                <div className="font-display text-3xl font-semibold text-[var(--color-text-primary)]">
                  {stat.value}
                </div>
                <div className="mt-1 text-sm text-[var(--color-text-tertiary)]">{stat.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
