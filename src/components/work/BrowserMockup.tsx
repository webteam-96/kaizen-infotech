'use client';

import { useRef, useState, useCallback } from 'react';
import Image from 'next/image';
import { useReducedMotion } from '@/hooks';
import { cn } from '@/lib/utils/cn';

interface BrowserMockupProps {
  src: string;
  alt: string;
  /** URL shown in the fake address bar. */
  url?: string;
  className?: string;
  priority?: boolean;
}

/**
 * BrowserMockup — frames a real product screenshot in a browser chrome with a
 * gentle pointer-driven 3D tilt and a moving sheen. Reduced-motion safe.
 */
export function BrowserMockup({
  src,
  alt,
  url = 'kaizeninfotech.com',
  className,
  priority,
}: BrowserMockupProps) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, gx: 50, gy: 0 });

  const onMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (reduce || !ref.current) return;
      const r = ref.current.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      setTilt({
        ry: (px - 0.5) * 10,
        rx: (0.5 - py) * 10,
        gx: px * 100,
        gy: py * 100,
      });
    },
    [reduce]
  );

  const onLeave = useCallback(() => setTilt({ rx: 0, ry: 0, gx: 50, gy: 0 }), []);

  return (
    <div
      className={cn('group [perspective:1400px]', className)}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      <div
        ref={ref}
        className="relative rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-secondary)] shadow-[0_30px_80px_-24px_rgba(13,38,76,0.45)] transition-transform duration-300 ease-out will-change-transform"
        style={{
          transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Browser chrome */}
        <div className="flex items-center gap-3 border-b border-[var(--color-border)] px-4 py-3">
          <div className="flex gap-1.5">
            <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
            <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
            <span className="h-3 w-3 rounded-full bg-[#28c840]" />
          </div>
          <div className="mx-auto flex w-full max-w-[280px] items-center gap-2 rounded-[var(--radius-full)] bg-[var(--color-bg-primary)] px-3 py-1">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-tertiary)" strokeWidth="2.4" aria-hidden>
              <rect x="4" y="11" width="16" height="9" rx="2" />
              <path d="M8 11V8a4 4 0 0 1 8 0v3" />
            </svg>
            <span
              className="truncate text-[11px] text-[var(--color-text-tertiary)]"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              {url}
            </span>
          </div>
        </div>

        {/* Screenshot */}
        <div className="relative overflow-hidden rounded-b-[var(--radius-lg)] bg-[var(--color-bg-primary)]">
          <Image
            src={src}
            alt={alt}
            width={1200}
            height={760}
            priority={priority}
            sizes="(max-width: 768px) 92vw, 620px"
            className="h-auto w-full object-contain p-6 transition-transform duration-500 group-hover:scale-[1.02]"
          />
          {/* Moving sheen */}
          {!reduce && (
            <div
              className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              style={{
                background: `radial-gradient(420px circle at ${tilt.gx}% ${tilt.gy}%, rgba(33,150,243,0.12), transparent 60%)`,
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
