'use client';

import { TextReveal } from '@/components/animation/TextReveal';
import { FadeIn } from '@/components/animation/FadeIn';
import { StaggerChildren } from '@/components/animation/StaggerChildren';
import { Accordion } from '@/components/ui/Accordion';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

// ---------------------------------------------------------------------------
// Benefits data
// ---------------------------------------------------------------------------

const benefits = [
  {
    title: 'Remote-First',
    description:
      'Work from anywhere in the world. Our team spans 8 time zones and we embrace asynchronous communication.',
    icon: '01',
  },
  {
    title: 'Learning Budget',
    description:
      '$3,000 annual budget for courses, conferences, books, and any resource that helps you grow.',
    icon: '02',
  },
  {
    title: 'Health Benefits',
    description:
      'Comprehensive medical, dental, and vision coverage for you and your dependents.',
    icon: '03',
  },
  {
    title: 'Flexible Hours',
    description:
      'Structure your day around your life. We care about output and impact, not hours logged.',
    icon: '04',
  },
  {
    title: 'Team Events',
    description:
      'Quarterly team retreats, monthly virtual social events, and an annual company-wide offsite.',
    icon: '05',
  },
  {
    title: 'Stock Options',
    description:
      'Every team member gets equity. When Kaizen wins, you win too.',
    icon: '06',
  },
];

// ---------------------------------------------------------------------------
// Open positions
// ---------------------------------------------------------------------------

const positions = [
  {
    title: 'Senior Full-Stack Engineer',
    department: 'Engineering',
    location: 'Remote',
    type: 'Full-time',
    description:
      'We are looking for a Senior Full-Stack Engineer to join our core product team. You will design and build scalable web applications using Next.js, TypeScript, and Node.js, collaborating closely with designers and product managers to deliver exceptional user experiences. The ideal candidate has 5+ years of experience, strong opinions on architecture, and a passion for writing clean, well-tested code. You will mentor junior developers, contribute to our engineering blog, and help shape the technical direction of client projects.',
  },
  {
    title: 'UI/UX Designer',
    department: 'Design',
    location: 'Remote',
    type: 'Full-time',
    description:
      'We are seeking a talented UI/UX Designer to craft beautiful, intuitive interfaces for our client projects. You will own the design process end-to-end: user research, wireframing, prototyping in Figma, and collaborating with engineers during implementation. You should have 3+ years of product design experience, a strong portfolio showcasing web and mobile work, and comfort with design systems. Experience with motion design and an understanding of front-end development are strong plusses.',
  },
  {
    title: 'DevOps Engineer',
    department: 'Engineering',
    location: 'Hybrid (San Francisco)',
    type: 'Full-time',
    description:
      'We need a DevOps Engineer to build and maintain our cloud infrastructure and CI/CD pipelines. You will work with AWS, Kubernetes, Terraform, and GitHub Actions to ensure our deployments are fast, reliable, and secure. The role involves designing monitoring and alerting systems, optimizing build times, managing database operations, and working with engineering teams to define infrastructure best practices. 4+ years of DevOps or SRE experience required, with strong scripting skills in Python or Go.',
  },
];

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
            className="mb-6 text-[length:var(--text-6xl)] font-bold leading-[1.05] text-[var(--color-text-primary)] md:text-[length:var(--text-7xl)]"
          >
            Join Our Journey of Continuous Improvement
          </TextReveal>
          <FadeIn delay={0.3}>
            <p
              className="max-w-2xl text-[length:var(--text-xl)] leading-relaxed text-[var(--color-text-secondary)]"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              At Kaizen, we believe great software is built by great people. We
              are always looking for curious minds who want to do the best work of
              their careers.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Why Kaizen — Benefits Grid */}
      <section className="px-6 pb-24 md:px-12 lg:px-24">
        <div className="mx-auto max-w-7xl">
          <FadeIn>
            <h2
              className="mb-12 text-[length:var(--text-3xl)] font-bold text-[var(--color-text-primary)] md:text-[length:var(--text-4xl)]"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              Why Kaizen?
            </h2>
          </FadeIn>

          <StaggerChildren className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {benefits.map((benefit) => (
              <Card key={benefit.title} tilt glow className="p-8">
                <div className="relative z-10">
                  <span
                    className="mb-4 block text-[length:var(--text-xs)] font-medium text-[var(--color-accent-primary)]"
                    style={{ fontFamily: 'var(--font-mono)' }}
                  >
                    {benefit.icon}
                  </span>
                  <h3
                    className="mb-3 text-[length:var(--text-xl)] font-semibold text-[var(--color-text-primary)]"
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
            <div className="mb-12 flex items-center justify-between">
              <h2
                className="text-[length:var(--text-3xl)] font-bold text-[var(--color-text-primary)] md:text-[length:var(--text-4xl)]"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                Open Positions
              </h2>
              <Badge variant="accent">{positions.length} Roles</Badge>
            </div>
          </FadeIn>

          <FadeIn delay={0.2}>
            <Accordion items={accordionItems} />
          </FadeIn>

          <FadeIn delay={0.3}>
            <div className="mt-12 text-center">
              <Button href="/careers/apply" size="lg">
                Submit Application
              </Button>
            </div>
          </FadeIn>
        </div>
      </section>
    </main>
  );
}
