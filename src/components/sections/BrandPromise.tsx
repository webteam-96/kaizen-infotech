'use client';

import { useState, useCallback } from 'react';
import { PinnedSection } from '@/components/animation/PinnedSection';
import { cn } from '@/lib/utils/cn';

const lines = [
  { text: 'Solve real business problems', verb: 'Solve' },
  { text: 'Deliver measurable results', verb: 'Deliver' },
  { text: 'Build systems that scale', verb: 'Build' },
];

export function BrandPromise() {
  const [progress, setProgress] = useState(0);

  const handleProgress = useCallback((p: number) => {
    setProgress(p);
  }, []);

  return (
    <section data-section-index={1}>
      <PinnedSection
        onProgress={handleProgress}
        duration="+=200%"
        className="flex min-h-screen items-center justify-center bg-[var(--color-bg-primary)]"
      >
        <div className="mx-auto max-w-[var(--container-max)] px-[var(--container-padding)] text-center">
          <div className="space-y-4">
            {lines.map((line, lineIndex) => {
              // Each line reveals across a third of progress
              const lineStart = lineIndex / lines.length;
              const lineEnd = (lineIndex + 1) / lines.length;
              const lineProgress = Math.max(
                0,
                Math.min(1, (progress - lineStart) / (lineEnd - lineStart))
              );

              const words = line.text.split(' ');

              return (
                <p
                  key={lineIndex}
                  className={cn(
                    'font-[family-name:var(--font-display)]',
                    'text-[clamp(1.75rem,4.5vw,3.5rem)] leading-[1.2] tracking-tight'
                  )}
                >
                  {words.map((word, wordIndex) => {
                    const wordStart = wordIndex / words.length;
                    const wordEnd = (wordIndex + 1) / words.length;
                    const wordProgress = Math.max(
                      0,
                      Math.min(
                        1,
                        (lineProgress - wordStart) / (wordEnd - wordStart)
                      )
                    );

                    const isVerb = word === line.verb;
                    const isRevealed = wordProgress > 0.3;

                    return (
                      <span
                        key={wordIndex}
                        className={cn(
                          'inline-block transition-all duration-300',
                          isRevealed
                            ? 'opacity-100 translate-y-0'
                            : 'opacity-15 translate-y-2'
                        )}
                      >
                        {isVerb ? (
                          <span className="relative inline-block">
                            <span
                              className={cn(
                                'relative z-10',
                                isRevealed
                                  ? 'text-[var(--color-accent-primary)]'
                                  : 'text-[var(--color-text-primary)]'
                              )}
                              style={{
                                transition: 'color 0.4s ease',
                              }}
                            >
                              {word}
                            </span>
                            {/* Accent underline wipe */}
                            <span
                              className="absolute bottom-0 left-0 h-[3px] bg-[var(--color-accent-primary)] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
                              style={{
                                width: isRevealed ? '100%' : '0%',
                              }}
                            />
                          </span>
                        ) : (
                          <span className="text-[var(--color-text-primary)]">
                            {word}
                          </span>
                        )}
                        {wordIndex < words.length - 1 && (
                          <span>&nbsp;</span>
                        )}
                      </span>
                    );
                  })}
                </p>
              );
            })}
          </div>
        </div>
      </PinnedSection>
    </section>
  );
}
