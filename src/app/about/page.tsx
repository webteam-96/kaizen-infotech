'use client';

import { useRef, useState } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import KaizenValues from '@/components/about/KaizenValues';
import DeliveryProcess from '@/components/about/DeliveryProcess';
import { TextReveal } from '@/components/animation/TextReveal';
import { ScrollFadeIn } from '@/components/animation/ScrollFadeIn';
import { DrawSVG } from '@/components/animation/DrawSVG';
import { PinnedSection } from '@/components/animation/PinnedSection';
import { PageHero } from '@/components/sections/PageHero';
import { useStaggeredScrollReveal } from '@/hooks/useStaggeredScrollReveal';
import { Button } from '@/components/ui/Button';
import { FlowingLightWaves } from '@/components/shared/FlowingLightWaves';
import { HexGridBackground } from '@/components/shared/HexGridBackground';
import { CtaGlowBackdrop } from '@/components/shared/CtaGlowBackdrop';
import { cn } from '@/lib/utils/cn';

// ---------------------------------------------------------------------------
// Milestones data — facts only, no invented dates.
// TODO(client): add real years to milestones when provided
// ---------------------------------------------------------------------------

const milestones = [
  {
    kicker: 'Where it started',
    title: 'Founded in Mumbai',
    description:
      'Built on a founding belief that technology should simplify life, not complicate it.',
  },
  {
    kicker: 'Rotary International',
    title: 'A Digital Ecosystem at Scale',
    description:
      'Serving 4,500 clubs and over 1.8 lakh Rotarians across Zones 4–7 in India.',
  },
  {
    kicker: 'Government scale',
    title: 'Trusted by Public Institutions',
    description:
      'Digitising operations at Mumbai Port Trust and the Income Tax Department.',
  },
  {
    kicker: 'Today',
    title: '3Mn+ Users on Our Platforms',
    description:
      'Our platforms serve over 3 million users across 8+ industries.',
  },
];

// ---------------------------------------------------------------------------
// Delivery process steps
// ---------------------------------------------------------------------------

const deliverySteps = [
  { number: '01', title: 'Understand', description: 'We study your organisation, users, and operational challenges in detail.' },
  { number: '02', title: 'Design', description: 'We design secure and scalable system architecture aligned with your goals.' },
  { number: '03', title: 'Develop', description: 'We follow clean development practices with strong testing and performance focus.' },
  { number: '04', title: 'Deploy & Support', description: 'We ensure smooth deployment and provide continuous support and enhancements.' },
];

// ---------------------------------------------------------------------------
// About Page
// ---------------------------------------------------------------------------

export default function AboutPage() {
  const [missionVisionProgress, setMissionVisionProgress] = useState(0);

  const milestonesGridRef = useRef<HTMLDivElement>(null);

  useStaggeredScrollReveal(milestonesGridRef, {
    from: { opacity: 0, y: 40 },
    to: { opacity: 1, y: 0 },
    stagger: 0.1,
  });

  return (
    <main className="relative isolate overflow-x-clip bg-[var(--color-bg-primary)]">
      {/* ================================================================= */}
      {/* HERO SECTION — interactive hex-grid backdrop (replaces the video) */}
      {/* ================================================================= */}
      <PageHero
        align="center"
        backdrop={<HexGridBackground />}
        kicker="About Kaizen Infotech"
        title="A Technology Partner Focused on Solving Real Business Problems"
        accentWords={['Solving', 'Real']}
        description="For over a decade, we have partnered with enterprises, government bodies, associations, and institutions across India to design and deliver digital platforms that simplify operations, improve engagement, and support long-term growth."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'About' }]}
        stats={[
          { value: '10+', label: 'Years of Experience' },
          { value: '100+', label: 'Projects Delivered' },
          { value: '8+', label: 'Industries Served' },
        ]}
      />

      {/* ================================================================= */}
      {/* ORIGIN STORY SECTION */}
      {/* ================================================================= */}
      <section className="section-tint seam-blue relative px-6 py-32">
        <div className="mx-auto grid max-w-7xl gap-16 lg:grid-cols-[1.5fr_1fr]">
          {/* Left: Story text */}
          <div>
            <ScrollFadeIn>
              <span
                className="mb-4 inline-block text-[length:var(--h-eyebrow)] font-medium uppercase tracking-[0.25em] text-[var(--color-text-tertiary)]"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                Who We Are
              </span>
            </ScrollFadeIn>

            <ScrollFadeIn delay={0.1}>
              <h2
                className="mb-8 text-[length:var(--h-section)] font-semibold leading-tight text-[var(--color-text-primary)]"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                Headquartered in Mumbai, trusted across{' '}
                <span className="italic text-[var(--red-brand)]" style={{ fontFamily: 'var(--font-display)' }}>
                  India
                </span>
              </h2>
            </ScrollFadeIn>

            <ScrollFadeIn delay={0.2}>
              <p
                className="mb-6 text-[length:var(--text-base)] leading-[1.8] text-[var(--color-text-secondary)]"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                Kaizen Infotech Solutions Pvt. Ltd. is a trusted technology partner
                headquartered in Mumbai, India. With over a decade of experience
                building enterprise-grade and government digital platforms, we have
                earned a reputation for delivering solutions that genuinely work -
                not just technically, but operationally.
              </p>
            </ScrollFadeIn>

            <ScrollFadeIn delay={0.3}>
              <p
                className="mb-6 text-[length:var(--text-base)] leading-[1.8] text-[var(--color-text-secondary)]"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                Our name comes from the Japanese philosophy of Kaizen - continuous,
                deliberate improvement. That principle drives everything we do: how
                we engage with clients, how we design systems, and how we deliver
                long-term support. We believe great technology is built through deep
                understanding, not quick assumptions.
              </p>
            </ScrollFadeIn>

            <ScrollFadeIn delay={0.35}>
              <p
                className="mb-8 text-[length:var(--text-base)] leading-[1.8] text-[var(--color-text-secondary)]"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                From powering Rotary International across India to digitising
                operations at Mumbai Port Trust and the Income Tax Department, our
                platforms serve hundreds of thousands of users every day. Each
                engagement reinforces our core belief: technology should simplify
                life, not complicate it.
              </p>
            </ScrollFadeIn>

          </div>

          {/* Right: Decorative kaizen symbol / timeline visualization */}
          <div className="relative flex items-center justify-center">
            <DrawSVG className="w-full max-w-xs">
              <svg
                viewBox="0 0 300 400"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full"
              >
                {/* Circular Kaizen symbol */}
                <circle
                  cx="150"
                  cy="200"
                  r="120"
                  stroke="var(--color-accent-primary)"
                  strokeWidth="1"
                  opacity="0.3"
                />
                <circle
                  cx="150"
                  cy="200"
                  r="90"
                  stroke="var(--color-accent-primary)"
                  strokeWidth="1.5"
                  opacity="0.5"
                />
                <circle
                  cx="150"
                  cy="200"
                  r="60"
                  stroke="var(--color-accent-primary)"
                  strokeWidth="2"
                  opacity="0.7"
                />
                {/* Upward spiral path */}
                <path
                  d="M150 320 Q90 280 90 240 Q90 200 150 200 Q210 200 210 160 Q210 120 150 120 Q90 120 90 80"
                  stroke="var(--color-accent-primary)"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                {/* Progress arrow */}
                <path
                  d="M85 90 L90 75 L95 90"
                  stroke="var(--color-accent-primary)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </DrawSVG>
          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* MISSION & VISION — PINNED SCROLL TRANSITION */}
      {/* ================================================================= */}
      <PinnedSection
        className="section-ink seam-red relative isolate flex min-h-screen items-center justify-center px-6"
        onProgress={setMissionVisionProgress}
        duration="+=150%"
      >
        <FlowingLightWaves />
        <div className="mx-auto max-w-4xl text-center">
          <AnimatePresence mode="wait">
            {missionVisionProgress < 0.5 ? (
              <m.div
                key="mission"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <span
                  className="ink-accent mb-4 inline-block text-[length:var(--h-eyebrow)] font-medium uppercase tracking-[0.25em]"
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  Our Mission
                </span>
                <h2
                  className="text-[length:var(--h-section)] font-normal leading-[1.2] text-[var(--text-on-ink)]"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  To make technology work for people, processes, and progress —
                  simplifying operations, improving engagement, and supporting
                  long-term growth for every organisation we serve.
                </h2>
              </m.div>
            ) : (
              <m.div
                key="vision"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <span
                  className="ink-accent mb-4 inline-block text-[length:var(--h-eyebrow)] font-medium uppercase tracking-[0.25em]"
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  Our Vision
                </span>
                <h2
                  className="text-[length:var(--h-section)] font-normal leading-[1.2] text-[var(--text-on-ink)]"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  To be the most trusted technology partner for organisations
                  across India and beyond - building reliable, scalable, and
                  future-ready digital platforms that deliver measurable
                  business impact.
                </h2>
              </m.div>
            )}
          </AnimatePresence>

          {/* Scroll progress indicator */}
          <div className="mt-12 flex items-center justify-center gap-3">
            <div
              className={cn(
                'h-1.5 w-8 rounded-full transition-colors duration-300',
                missionVisionProgress < 0.5
                  ? 'bg-[var(--accent-on-ink)]'
                  : 'bg-[rgba(245,248,252,0.25)]'
              )}
            />
            <div
              className={cn(
                'h-1.5 w-8 rounded-full transition-colors duration-300',
                missionVisionProgress >= 0.5
                  ? 'bg-[var(--accent-on-ink)]'
                  : 'bg-[rgba(245,248,252,0.25)]'
              )}
            />
          </div>
        </div>
      </PinnedSection>

      {/* ================================================================= */}
      {/* VALUES SECTION — pinned, scroll-driven card deck */}
      {/* ================================================================= */}
      <KaizenValues />

      {/* ================================================================= */}
      {/* SERVICES / MILESTONES */}
      {/* ================================================================= */}
      <section className="section-light-aura seam-red relative py-32">
        {/* Uses the global responsive utilities (.container / .heading-responsive /
            .grid-responsive from globals.css) instead of the token-based layout. */}
        <div className="container">
          <div className="mb-16 text-center">
            <ScrollFadeIn>
              <span
                className="mb-4 inline-block text-[length:var(--h-eyebrow)] font-medium uppercase tracking-[0.25em] text-[var(--color-text-tertiary)]"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                Our Journey
              </span>
            </ScrollFadeIn>
            <TextReveal
              as="h2"
              splitBy="words"
              className="text-[length:var(--h-section)] font-semibold leading-tight text-[var(--color-text-primary)]"
            >
              A Decade of Delivering Impact
            </TextReveal>
          </div>

          {/* Milestone strip — facts only; years added when the client provides them */}
          <div
            ref={milestonesGridRef}
            className="grid-responsive"
          >
            {milestones.map((milestone) => (
              <div
                key={milestone.kicker}
                className={cn(
                  'card-accent-spine group relative overflow-hidden rounded-[var(--radius-lg)] p-7 pl-8',
                  'bg-[var(--color-bg-primary)] border border-[var(--color-border)]',
                  'transition-all duration-300',
                  'hover:border-[var(--color-border-hover)]',
                  'hover:shadow-[0_0_30px_var(--color-glow)]',
                  'hover:-translate-y-1'
                )}
              >
                <span className="mb-4 inline-block font-mono text-xs font-medium uppercase tracking-[0.18em] text-[var(--red-brand)]">
                  {milestone.kicker}
                </span>
                <h3
                  className="mb-2 text-[length:var(--h-card)] font-semibold leading-snug text-[var(--color-text-primary)]"
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  {milestone.title}
                </h3>
                <p
                  className="text-[length:var(--text-sm)] leading-relaxed text-[var(--color-text-secondary)]"
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  {milestone.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* DELIVERY PROCESS SECTION */}
      {/* ================================================================= */}
      <section className="section-tint seam-blue relative px-6 py-32">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <ScrollFadeIn>
              <span
                className="mb-4 inline-block text-[length:var(--h-eyebrow)] font-medium uppercase tracking-[0.25em] text-[var(--color-text-tertiary)]"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                How We Work
              </span>
            </ScrollFadeIn>
            <TextReveal
              as="h2"
              splitBy="words"
              className="text-[length:var(--h-section)] font-semibold leading-tight text-[var(--color-text-primary)]"
            >
              Our Delivery Process
            </TextReveal>
            <ScrollFadeIn delay={0.2}>
              <p
                className="mx-auto mt-4 max-w-2xl text-[length:var(--text-base)] leading-relaxed text-[var(--color-text-secondary)]"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                Our delivery process is structured, transparent, and collaborative
                — ensuring reliability, adoption, and long-term success.
              </p>
            </ScrollFadeIn>
          </div>

          <ScrollFadeIn>
            <DeliveryProcess steps={deliverySteps} />
            <p className="mt-6 text-center text-[length:var(--text-sm)] text-[var(--color-text-secondary)] desk:hidden">
              Tap a step to expand it.
            </p>
          </ScrollFadeIn>
        </div>
      </section>

      {/* ================================================================= */}
      {/* CTA SECTION */}
      {/* ================================================================= */}
      <section className="section-ink cta-glow-host seam-red relative isolate px-6 py-32">
        <CtaGlowBackdrop />
        <div className="mx-auto max-w-3xl text-center">
          <ScrollFadeIn>
            <h2
              className="text-[length:var(--h-section)] font-normal leading-[1.2] text-[var(--text-on-ink)]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Let&apos;s Build Technology That{' '}
              <span className="text-[var(--accent-on-ink)]">Works</span>
            </h2>
          </ScrollFadeIn>
          <ScrollFadeIn delay={0.15}>
            <p
              className="mx-auto mt-6 max-w-lg text-[length:var(--text-base)] leading-relaxed text-[var(--text-on-ink-muted)]"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              Whether you are planning a new digital platform or modernising
              your existing systems, Kaizen Infotech is ready to support your journey.
            </p>
          </ScrollFadeIn>
          <ScrollFadeIn delay={0.3}>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              {/* Equal-width buttons on mobile (stacked, w-full) and iPad (row,
                  flex-1) so the pair looks balanced; natural widths on desktop. */}
              <Button
                variant="primary"
                size="lg"
                href="/contact"
                className="w-full sm:flex-1 lg:w-auto lg:flex-none"
              >
                Contact Us
              </Button>
              <Button
                variant="secondary"
                size="lg"
                href="/work"
                className="on-ink-secondary w-full sm:flex-1 lg:w-auto lg:flex-none"
              >
                View Our Work
              </Button>
            </div>
          </ScrollFadeIn>
        </div>
      </section>
    </main>
  );
}
