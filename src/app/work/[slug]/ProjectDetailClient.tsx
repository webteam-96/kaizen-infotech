'use client';

import Link from 'next/link';

import { TextReveal } from '@/components/animation/TextReveal';
import { FadeIn } from '@/components/animation/FadeIn';
import { StaggerChildren } from '@/components/animation/StaggerChildren';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { TestimonialCard } from '@/components/ui/TestimonialCard';
import type { Project } from '@/types';

interface ProjectDetailClientProps {
  project: Project;
  prevProject: Project | null;
  nextProject: Project | null;
}

export default function ProjectDetailClient({
  project,
  prevProject,
  nextProject,
}: ProjectDetailClientProps) {
  return (
    <main className="min-h-screen bg-[var(--color-bg-primary)]">
      {/* Hero Section — full-bleed gradient */}
      <section className="relative flex min-h-[60vh] items-end overflow-hidden">
        {/* Gradient background (placeholder for project image) */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(135deg, var(--color-bg-secondary) 0%, var(--color-bg-tertiary) 50%, var(--color-accent-primary)/10 100%)',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg-primary)] via-[var(--color-bg-primary)]/60 to-transparent" />

        <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pb-16 pt-40 md:px-12 lg:px-24">
          <FadeIn delay={0.1}>
            <Link
              href="/work"
              className="mb-6 inline-flex items-center gap-2 text-[length:var(--text-sm)] text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-accent-primary)]"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                className="rotate-180"
              >
                <path
                  d="M6 3L11 8L6 13"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Back to Work
            </Link>
          </FadeIn>

          <TextReveal
            as="h1"
            splitBy="words"
            className="mb-6 text-[length:var(--text-5xl)] font-bold leading-[1.1] text-[var(--color-text-primary)] md:text-[length:var(--text-7xl)]"
          >
            {project.title}
          </TextReveal>

          <FadeIn delay={0.3}>
            <p
              className="max-w-3xl text-[length:var(--text-xl)] leading-relaxed text-[var(--color-text-secondary)]"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              {project.description}
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Project Metadata */}
      <section className="border-b border-[var(--color-border)] px-6 py-12 md:px-12 lg:px-24">
        <div className="mx-auto max-w-7xl">
          <StaggerChildren className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div>
              <p
                className="mb-1 text-[length:var(--text-xs)] uppercase tracking-wider text-[var(--color-text-tertiary)]"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                Client
              </p>
              <p
                className="text-[length:var(--text-base)] font-medium text-[var(--color-text-primary)]"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                {project.client}
              </p>
            </div>
            <div>
              <p
                className="mb-1 text-[length:var(--text-xs)] uppercase tracking-wider text-[var(--color-text-tertiary)]"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                Year
              </p>
              <p
                className="text-[length:var(--text-base)] font-medium text-[var(--color-text-primary)]"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                {project.year}
              </p>
            </div>
            <div>
              <p
                className="mb-1 text-[length:var(--text-xs)] uppercase tracking-wider text-[var(--color-text-tertiary)]"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                Category
              </p>
              <p
                className="text-[length:var(--text-base)] font-medium text-[var(--color-text-primary)]"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                {project.category}
              </p>
            </div>
            <div>
              <p
                className="mb-1 text-[length:var(--text-xs)] uppercase tracking-wider text-[var(--color-text-tertiary)]"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                Technologies
              </p>
              <div className="flex flex-wrap gap-2">
                {project.technologies.map((tech) => (
                  <Badge key={tech} variant="accent">
                    {tech}
                  </Badge>
                ))}
              </div>
            </div>
          </StaggerChildren>
        </div>
      </section>

      {/* Challenge → Solution → Result */}
      <section className="px-6 py-24 md:px-12 lg:px-24">
        <div className="mx-auto max-w-4xl space-y-20">
          {/* Challenge */}
          <FadeIn>
            <div>
              <div className="mb-4 flex items-center gap-3">
                <span className="h-px w-8 bg-[var(--color-accent-warm)]" />
                <span
                  className="text-[length:var(--text-sm)] font-medium uppercase tracking-wider text-[var(--color-accent-warm)]"
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  The Challenge
                </span>
              </div>
              <h2
                className="mb-6 text-[length:var(--text-3xl)] font-bold text-[var(--color-text-primary)]"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                Understanding the Problem
              </h2>
              <p
                className="text-[length:var(--text-lg)] leading-relaxed text-[var(--color-text-secondary)]"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                {project.challenge}
              </p>
            </div>
          </FadeIn>

          {/* Solution */}
          <FadeIn>
            <div>
              <div className="mb-4 flex items-center gap-3">
                <span className="h-px w-8 bg-[var(--color-accent-primary)]" />
                <span
                  className="text-[length:var(--text-sm)] font-medium uppercase tracking-wider text-[var(--color-accent-primary)]"
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  Our Solution
                </span>
              </div>
              <h2
                className="mb-6 text-[length:var(--text-3xl)] font-bold text-[var(--color-text-primary)]"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                Building the Answer
              </h2>
              <p
                className="text-[length:var(--text-lg)] leading-relaxed text-[var(--color-text-secondary)]"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                {project.solution}
              </p>
            </div>
          </FadeIn>

          {/* Result */}
          <FadeIn>
            <div>
              <div className="mb-4 flex items-center gap-3">
                <span className="h-px w-8 bg-[var(--color-accent-secondary)]" />
                <span
                  className="text-[length:var(--text-sm)] font-medium uppercase tracking-wider text-[var(--color-accent-secondary)]"
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  The Result
                </span>
              </div>
              <h2
                className="mb-6 text-[length:var(--text-3xl)] font-bold text-[var(--color-text-primary)]"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                Measurable Impact
              </h2>
              <p
                className="text-[length:var(--text-lg)] leading-relaxed text-[var(--color-text-secondary)]"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                {project.result}
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Testimonial */}
      {project.testimonial && (
        <section className="px-6 py-24 md:px-12 lg:px-24">
          <div className="mx-auto max-w-4xl">
            <FadeIn>
              <TestimonialCard
                quote={project.testimonial.quote}
                clientName={project.testimonial.clientName}
                clientRole={project.testimonial.clientRole}
                clientCompany={project.testimonial.clientCompany}
                clientImage={project.testimonial.clientImage}
              />
            </FadeIn>
          </div>
        </section>
      )}

      {/* Next / Previous Navigation */}
      <section className="border-t border-[var(--color-border)] px-6 py-16 md:px-12 lg:px-24">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 md:grid-cols-2">
          {prevProject ? (
            <Link
              href={`/work/${prevProject.slug}`}
              className="group flex flex-col rounded-[var(--radius-lg)] border border-[var(--color-border)] p-6 transition-colors duration-300 hover:border-[var(--color-border-hover)] hover:bg-[var(--color-surface-glass)]"
            >
              <span
                className="mb-2 text-[length:var(--text-xs)] uppercase tracking-wider text-[var(--color-text-tertiary)]"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                Previous Project
              </span>
              <span
                className="text-[length:var(--text-lg)] font-semibold text-[var(--color-text-primary)] transition-colors group-hover:text-[var(--color-accent-primary)]"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                {prevProject.title}
              </span>
            </Link>
          ) : (
            <div />
          )}

          {nextProject ? (
            <Link
              href={`/work/${nextProject.slug}`}
              className="group flex flex-col items-end rounded-[var(--radius-lg)] border border-[var(--color-border)] p-6 text-right transition-colors duration-300 hover:border-[var(--color-border-hover)] hover:bg-[var(--color-surface-glass)]"
            >
              <span
                className="mb-2 text-[length:var(--text-xs)] uppercase tracking-wider text-[var(--color-text-tertiary)]"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                Next Project
              </span>
              <span
                className="text-[length:var(--text-lg)] font-semibold text-[var(--color-text-primary)] transition-colors group-hover:text-[var(--color-accent-primary)]"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                {nextProject.title}
              </span>
            </Link>
          ) : (
            <div />
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-[var(--color-border)] px-6 py-24 md:px-12 lg:px-24">
        <div className="mx-auto max-w-7xl text-center">
          <FadeIn>
            <h2
              className="mb-6 text-[length:var(--text-4xl)] font-bold text-[var(--color-text-primary)]"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              Ready to Build Something Great?
            </h2>
            <Button href="/contact" size="lg">
              Start Your Project
            </Button>
          </FadeIn>
        </div>
      </section>
    </main>
  );
}
