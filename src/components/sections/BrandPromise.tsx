'use client';

import { useState, useCallback } from 'react';
import { PinnedSection } from '@/components/animation/PinnedSection';
import { cn } from '@/lib/utils/cn';

const lines = [
  { text: 'Solve real business problems.', verb: 'Solve' },
  { text: 'Deliver measurable results.', verb: 'Deliver' },
  { text: 'Build systems that scale.', verb: 'Build' },
];

export function BrandPromise() {
  const [progress, setProgress] = useState(0);

  const handleProgress = useCallback((p: number) => {
    setProgress(p);
  }, []);

  return (
    <section data-section-index={1} className="seam-blue">
      <PinnedSection
        onProgress={handleProgress}
        duration="+=200%"
        className="flex min-h-screen items-center justify-center section-tint"
      >
        <div className="mx-auto max-w-[var(--container-max)] px-[var(--container-padding)] text-center">
          {/* Single server-rendered <h1> for the homepage — the primary value
              proposition. The 3D hero's headings render client-side (ssr:false),
              so this is the page's crawlable H1 for SEO/AI engines. */}
          <h1 className="space-y-4">
            {lines.map((line, lineIndex) => {
              const lineStart = lineIndex / lines.length;
              const lineEnd = (lineIndex + 1) / lines.length;
              const lineProgress = Math.max(
                0,
                Math.min(1, (progress - lineStart) / (lineEnd - lineStart))
              );
              const isRevealed = lineProgress > 0.3;

              // Split text around the verb so we can highlight it inline
              // without animating it independently.
              const verbIdx = line.text.indexOf(line.verb);
              const before = line.text.slice(0, verbIdx);
              const after = line.text.slice(verbIdx + line.verb.length);

              return (
                <span
                  key={lineIndex}
                  className={cn(
                    'block',
                    'font-[family-name:var(--font-display)]',
                    'text-[clamp(1.75rem,4.5vw,3.5rem)] leading-[1.2] tracking-tight',
                    'transition-all duration-300',
                    isRevealed
                      ? 'opacity-100 translate-y-0'
                      : 'opacity-15 translate-y-2'
                  )}
                >
                  <span className="text-[var(--color-text-primary)]">{before}</span>
                  <span className="relative inline-block">
                    <span
                      className="relative z-10"
                      style={{
                        color: isRevealed ? 'var(--color-accent-warm)' : 'var(--color-text-primary)',
                        transition: 'color 0.4s ease',
                      }}
                    >
                      {line.verb}
                    </span>
                    {/* Accent underline wipe */}
                    <span
                      className="absolute bottom-0 left-0 h-[3px] bg-[var(--color-accent-warm)] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
                      style={{ width: isRevealed ? '100%' : '0%' }}
                    />
                  </span>
                  <span className="text-[var(--color-text-primary)]">{after}</span>
                </span>
              );
            })}
          </h1>
        </div>
      </PinnedSection>
    </section>
  );
}
