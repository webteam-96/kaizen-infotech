'use client';

import { TeamCard } from '@/components/ui/TeamCard';
import { FadeIn } from '@/components/animation/FadeIn';
import { cn } from '@/lib/utils/cn';
import { team } from '@/content/team';

export function TeamGrid() {
  return (
    <section
      data-section-index={8}
      className="bg-[var(--color-bg-secondary)] py-[var(--space-section)]"
    >
      <div className="mx-auto max-w-[var(--container-max)] px-[var(--container-padding)]">
        {/* Section header */}
        <FadeIn direction="up" className="mb-16">
          <span
            className="text-[length:var(--text-xs)] font-medium uppercase tracking-widest text-[var(--color-text-tertiary)]"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            The People
          </span>
          <h2
            className={cn(
              'mt-3 font-[family-name:var(--font-display)]',
              'text-[clamp(2rem,4vw,3rem)] leading-tight tracking-tight',
              'text-[var(--color-text-primary)]'
            )}
          >
            Meet the team behind the work
          </h2>
        </FadeIn>

        {/* Team cards - horizontal scroll on smaller, grid on larger */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {team.map((member, i) => (
            <TeamCard
              key={member.id}
              name={member.name}
              role={member.role}
              image={member.image}
              bio={member.bio}
              social={member.social}
              index={i}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
