'use client';

import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/utils/cn';

const CLIENTS = [
  'Rotary International Zones 4–7',
  'Mumbai Port Trust',
  'Income Tax Department',
  'JITO',
  'MRPL',
  'Orion Gametes',
];

export function LogoMarquee({ className }: { className?: string }) {
  const prefersReducedMotion = useReducedMotion();

  const items = (keyPrefix: string, ariaHidden = false) => (
    <div
      aria-hidden={ariaHidden || undefined}
      className="flex shrink-0 items-center gap-[clamp(2.5rem,6vw,5.5rem)] pr-[clamp(2.5rem,6vw,5.5rem)]"
    >
      {CLIENTS.map((name) => (
        <span
          key={`${keyPrefix}-${name}`}
          className="whitespace-nowrap font-display text-xl font-medium tracking-tight text-[var(--color-text-tertiary)] transition-colors duration-300 hover:text-[var(--color-text-primary)] md:text-2xl"
        >
          {name}
        </span>
      ))}
    </div>
  );

  return (
    <section className={cn('overflow-hidden py-[clamp(3.5rem,7vw,6rem)]', className)}>
      <p className="mx-auto mb-8 w-full max-w-7xl px-6 font-mono text-xs uppercase tracking-[0.24em] text-[var(--color-text-tertiary)]">
        Trusted by organisations that can&apos;t afford downtime
      </p>
      {prefersReducedMotion ? (
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center gap-x-10 gap-y-4 px-6">
          {CLIENTS.map((name) => (
            <span
              key={`static-${name}`}
              className="font-display text-xl font-medium tracking-tight text-[var(--color-text-tertiary)] md:text-2xl"
            >
              {name}
            </span>
          ))}
        </div>
      ) : (
        <div
          className="marquee-mask flex"
          style={{
            maskImage:
              'linear-gradient(90deg, transparent, black 8%, black 92%, transparent)',
          }}
        >
          <div className="marquee-track flex">
            {items('a')}
            {items('b', true)}
          </div>
        </div>
      )}
    </section>
  );
}
