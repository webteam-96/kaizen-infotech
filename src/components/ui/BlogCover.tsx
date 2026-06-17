import { cn } from '@/lib/utils/cn';

/** Deterministic per-post cover art: brand-blue geometric compositions seeded by slug. */

const PALETTES: Record<string, [string, string, string]> = {
  'government-tech': ['#0e1b2c', '#2196F3', '#5ab6f7'],
  'enterprise-software': ['#10243a', '#1976d2', '#87CEEB'],
  'mobile-development': ['#0d2030', '#29a3f4', '#bfe3fb'],
  'event-technology': ['#142a40', '#42a5f5', '#90caf9'],
  'digital-marketing': ['#102136', '#1e88e5', '#a8d8f8'],
  default: ['#0e1b2c', '#2196F3', '#87CEEB'],
};

function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

interface BlogCoverProps {
  slug: string;
  category?: string;
  className?: string;
}

export function BlogCover({ slug, category = 'default', className }: BlogCoverProps) {
  const seed = hash(slug);
  const key = category.toLowerCase().replace(/\s+/g, '-');
  const [bg, mid, hi] = PALETTES[key] ?? PALETTES.default;
  const variant = seed % 3;
  const rot = (seed % 4) * 90;
  const cx = 25 + (seed % 50);
  const cy = 25 + ((seed >> 3) % 50);

  return (
    <div className={cn('relative overflow-hidden', className)} aria-hidden>
      <svg
        viewBox="0 0 400 250"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full"
      >
        <rect width="400" height="250" fill={bg} />
        <g transform={`rotate(${rot} 200 125)`} opacity="0.9">
          {variant === 0 && (
            <>
              <circle cx={cx * 4} cy={cy * 2.5} r="150" fill="none" stroke={mid} strokeWidth="1.5" opacity="0.5" />
              <circle cx={cx * 4} cy={cy * 2.5} r="105" fill="none" stroke={mid} strokeWidth="1.5" opacity="0.7" />
              <circle cx={cx * 4} cy={cy * 2.5} r="60" fill={mid} opacity="0.55" />
              <circle cx={cx * 4} cy={cy * 2.5} r="24" fill={hi} />
            </>
          )}
          {variant === 1 && (
            <>
              {Array.from({ length: 7 }, (_, i) => (
                <rect
                  key={i}
                  x={i * 62 - 30}
                  y={((seed >> i) % 5) * 28}
                  width="34"
                  height="250"
                  fill={i % 2 ? mid : hi}
                  opacity={0.16 + (i % 3) * 0.18}
                />
              ))}
              <circle cx={cx * 4} cy={cy * 2.5} r="46" fill={hi} opacity="0.9" />
            </>
          )}
          {variant === 2 && (
            <>
              <path
                d={`M 0 ${125 + (seed % 60)} Q 130 ${30 + (seed % 80)} 230 ${110 + (seed % 50)} T 430 ${100 + (seed % 70)}`}
                fill="none"
                stroke={mid}
                strokeWidth="40"
                opacity="0.4"
                strokeLinecap="round"
              />
              <path
                d={`M -20 ${165 + (seed % 40)} Q 150 ${70 + (seed % 60)} 260 ${140 + (seed % 40)} T 440 ${130 + (seed % 60)}`}
                fill="none"
                stroke={hi}
                strokeWidth="14"
                opacity="0.85"
                strokeLinecap="round"
              />
            </>
          )}
        </g>
      </svg>
    </div>
  );
}
