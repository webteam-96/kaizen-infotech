'use client';

import { useRef } from 'react';
import { ProjectCard } from '@/components/ui/ProjectCard';
import { ScrollFadeIn } from '@/components/animation/ScrollFadeIn';
import { TextReveal } from '@/components/animation/TextReveal';
import { CountUp } from '@/components/animation/CountUp';
import { Button } from '@/components/ui/Button';
import { useStaggeredScrollReveal } from '@/hooks/useStaggeredScrollReveal';
import { projects } from '@/content/projects';
import { cn } from '@/lib/utils/cn';

export function FeaturedWork() {
  // Take up to 5 projects for the asymmetric grid
  const featured = projects.slice(0, 5);
  const gridRef = useRef<HTMLDivElement>(null);

  useStaggeredScrollReveal(gridRef, {
    from: { opacity: 0, clipPath: 'inset(10% 10% 10% 10%)' },
    to: { opacity: 1, clipPath: 'inset(0% 0% 0% 0%)' },
    stagger: 0.15,
  });

  return (
    <section
      data-section-index={4}
      className="bg-[var(--color-bg-primary)] py-[var(--space-section)]"
    >
      <div className="mx-auto max-w-[var(--container-max)] px-[var(--container-padding)]">
        {/* Section header */}
        <div className="mb-16">
          <div className="flex items-end justify-between">
            <div>
              <ScrollFadeIn direction="up">
                <span
                  className="text-[length:var(--text-xs)] font-medium uppercase tracking-widest text-[var(--color-text-tertiary)]"
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  Selected Work
                </span>
              </ScrollFadeIn>
              <TextReveal
                as="h2"
                splitBy="words"
                className={cn(
                  'mt-3 font-[family-name:var(--font-display)]',
                  'text-[clamp(2rem,4vw,3rem)] leading-tight tracking-tight',
                  'text-[var(--color-text-primary)]'
                )}
              >
                Real-World Digital Solutions Built for Scale
              </TextReveal>
              <ScrollFadeIn direction="up" delay={0.3}>
                <span
                  className="mt-4 inline-block text-[length:var(--text-sm)] text-[var(--color-text-tertiary)]"
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  0<CountUp end={projects.length} /> Projects
                </span>
              </ScrollFadeIn>
            </div>
          </div>
        </div>

        {/* Asymmetric grid: 1 large + 2 medium on first row, 2 on second */}
        <div ref={gridRef} className="grid grid-cols-1 gap-6 md:grid-cols-4">
          {/* Large card - spans 2 cols */}
          {featured[0] && (
            <div className="md:col-span-2">
              <ProjectCard
                title={featured[0].title}
                client={featured[0].client}
                category={featured[0].category}
                year={featured[0].year}
                image={featured[0].image}
                slug={featured[0].slug}
                featured
              />
            </div>
          )}

          {/* Medium cards - 1 col each */}
          {featured[1] && (
            <div className="md:col-span-1">
              <ProjectCard
                title={featured[1].title}
                client={featured[1].client}
                category={featured[1].category}
                year={featured[1].year}
                image={featured[1].image}
                slug={featured[1].slug}
              />
            </div>
          )}
          {featured[2] && (
            <div className="md:col-span-1">
              <ProjectCard
                title={featured[2].title}
                client={featured[2].client}
                category={featured[2].category}
                year={featured[2].year}
                image={featured[2].image}
                slug={featured[2].slug}
              />
            </div>
          )}

          {/* Second row - 2 small cards */}
          {featured[3] && (
            <div className="md:col-span-2">
              <ProjectCard
                title={featured[3].title}
                client={featured[3].client}
                category={featured[3].category}
                year={featured[3].year}
                image={featured[3].image}
                slug={featured[3].slug}
              />
            </div>
          )}
          {featured[4] && (
            <div className="md:col-span-2">
              <ProjectCard
                title={featured[4].title}
                client={featured[4].client}
                category={featured[4].category}
                year={featured[4].year}
                image={featured[4].image}
                slug={featured[4].slug}
              />
            </div>
          )}
        </div>

        {/* CTA */}
        <ScrollFadeIn direction="up" className="mt-12 text-center">
          <Button variant="secondary" size="lg" href="/work">
            View All Projects
          </Button>
        </ScrollFadeIn>
      </div>
    </section>
  );
}
