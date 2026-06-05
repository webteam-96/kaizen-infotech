'use client';

import { TextReveal } from '@/components/animation/TextReveal';
import { FadeIn } from '@/components/animation/FadeIn';
import { StaggerChildren } from '@/components/animation/StaggerChildren';
import { Accordion } from '@/components/ui/Accordion';
import { Card } from '@/components/ui/Card';

// ---------------------------------------------------------------------------
// Benefits data
// ---------------------------------------------------------------------------

const benefits = [
  {
    title: 'Work on Meaningful Projects',
    description:
      'You will build platforms used by government organisations, lakhs of citizens, and global communities — not trivial apps. Every project has real stakes and real impact.',
    icon: '01',
  },
  {
    title: 'Collaborative & Learning Culture',
    description:
      'We believe in learning by doing. Regular knowledge-sharing sessions, code reviews, and mentorship are part of how we work every day.',
    icon: '02',
  },
  {
    title: 'Career Growth Opportunities',
    description:
      'We grow people, not just projects. As the company expands, talented team members have clear paths to senior and leadership roles.',
    icon: '03',
  },
  {
    title: 'Flexible Working Environment',
    description:
      'We offer flexible working hours and hybrid arrangements. [FILL IN - Specify actual policy]',
    icon: '04',
  },
];

// ---------------------------------------------------------------------------
// Open positions
// ---------------------------------------------------------------------------

const positions: {
  title: string;
  department: string;
  location: string;
  type: string;
  description: string;
}[] = [];

const accordionItems = positions.map((pos) => ({
  title: `${pos.title} — ${pos.department} — ${pos.location} — ${pos.type}`,
  content: pos.description,
}));

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function CareersPage() {
  return (
    <main className="min-h-screen bg-[var(--color-bg-primary)]">
      {/* Hero Section */}
      <section className="px-6 pb-16 pt-32 md:px-12 lg:px-24">
        <div className="mx-auto max-w-7xl">
          <TextReveal
            as="h1"
            splitBy="words"
            className="mb-6 text-[length:var(--h-page)] font-bold leading-[1.05] text-[var(--color-text-primary)]"
          >
            Join Our Journey of Continuous Improvement
          </TextReveal>
          <FadeIn delay={0.3}>
            <p
              className="max-w-2xl text-[length:var(--h-sub)] leading-relaxed text-[var(--color-text-secondary)]"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              At Kaizen Infotech, we believe great software is built by curious,
              collaborative people who care deeply about the problems they are
              solving. We are always looking for talented professionals who want
              to build impactful technology for real organisations.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Why Kaizen — Benefits Grid */}
      <section className="px-6 pb-24 md:px-12 lg:px-24">
        <div className="mx-auto max-w-7xl">
          <FadeIn>
            <h2
              className="mb-12 text-[length:var(--h-section)] font-bold text-[var(--color-text-primary)]"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              Why Work at Kaizen?
            </h2>
          </FadeIn>

          <StaggerChildren className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {benefits.map((benefit) => (
              <Card key={benefit.title} tilt glow className="p-8">
                <div className="relative z-10">
                  <span
                    className="mb-4 block text-[length:var(--h-eyebrow)] font-medium text-[var(--color-accent-primary)]"
                    style={{ fontFamily: 'var(--font-mono)' }}
                  >
                    {benefit.icon}
                  </span>
                  <h3
                    className="mb-3 text-[length:var(--h-card)] font-semibold text-[var(--color-text-primary)]"
                    style={{ fontFamily: 'var(--font-heading)' }}
                  >
                    {benefit.title}
                  </h3>
                  <p
                    className="text-[length:var(--text-sm)] leading-relaxed text-[var(--color-text-secondary)]"
                    style={{ fontFamily: 'var(--font-body)' }}
                  >
                    {benefit.description}
                  </p>
                </div>
              </Card>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* Open Positions */}
      <section className="border-t border-[var(--color-border)] px-6 py-24 md:px-12 lg:px-24">
        <div className="mx-auto max-w-4xl">
          <FadeIn>
            <h2
              className="mb-12 text-[length:var(--h-section)] font-bold text-[var(--color-text-primary)]"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              Open Positions
            </h2>
          </FadeIn>

          {positions.length === 0 ? (
            <FadeIn delay={0.2}>
              <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] px-8 py-16 text-center">
                <p
                  className="text-[length:var(--text-lg)] text-[var(--color-text-secondary)]"
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  We don&apos;t have any open roles listed right now, but we&apos;re always growing.
                </p>
              </div>
            </FadeIn>
          ) : (
            <FadeIn delay={0.2}>
              <Accordion items={accordionItems} />
            </FadeIn>
          )}

          <FadeIn delay={0.3}>
            <div className="mt-16 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-8 py-10 text-center">
              <h3
                className="mb-3 text-[length:var(--h-card)] font-semibold text-[var(--color-text-primary)]"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                No suitable role listed?
              </h3>
              <p
                className="text-[length:var(--text-base)] leading-relaxed text-[var(--color-text-secondary)]"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                We are always open to hearing from talented people. Send your CV and a note about
                what you are looking for to{' '}
                <a
                  href="mailto:careers@kaizeninfotech.com"
                  className="text-[var(--color-accent-primary)] underline underline-offset-2 hover:opacity-80"
                >
                  careers@kaizeninfotech.com
                </a>
              </p>
            </div>
          </FadeIn>
        </div>
      </section>
    </main>
  );
}
