'use client';

import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TextReveal } from '@/components/animation/TextReveal';
import { ScrollFadeIn } from '@/components/animation/ScrollFadeIn';
import { SectionDivider } from '@/components/animation/SectionDivider';
import { DrawSVG } from '@/components/animation/DrawSVG';
import { PinnedSection } from '@/components/animation/PinnedSection';
import { CountUp } from '@/components/animation/CountUp';
import { useStaggeredScrollReveal } from '@/hooks/useStaggeredScrollReveal';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils/cn';

// ---------------------------------------------------------------------------
// Milestones data (service capabilities)
// ---------------------------------------------------------------------------

const milestones = [
  {
    year: '01',
    title: 'Custom Software Development',
    description:
      'Enterprise web applications, business process automation, custom ERP and management platforms, dashboards and MIS reporting.',
  },
  {
    year: '02',
    title: 'Mobile App Development',
    description:
      'Android and iOS applications for member engagement, enterprise mobility, field force management, and real-time communication.',
  },
  {
    year: '03',
    title: 'Event Management Systems',
    description:
      'Online registrations, secure payments, QR-based check-in, attendance tracking, and automated communication.',
  },
  {
    year: '04',
    title: 'Enterprise Web Portals',
    description:
      'Secure websites and portals with role-based access, content management, and enterprise system integration.',
  },
  {
    year: '05',
    title: 'Digital Marketing',
    description:
      'SEO, social media marketing, Google and Meta Ads campaigns, content marketing, and conversion optimization.',
  },
];

// ---------------------------------------------------------------------------
// Values data
// ---------------------------------------------------------------------------

const values = [
  {
    title: 'Long-Term Value',
    subtitle: null,
    description: 'We focus on long-term value, not quick fixes. Every solution is built to serve your organization for years.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
        <polyline points="17 6 23 6 23 12" />
      </svg>
    ),
  },
  {
    title: 'Business-First Design',
    subtitle: null,
    description: 'We build solutions around real business workflows, ensuring practical adoption and measurable impact.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
  },
  {
    title: 'Scalable & Future-Ready',
    subtitle: null,
    description: 'Our systems are designed to be scalable and future-ready, growing alongside your organization.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="9" y1="18" x2="15" y2="18" />
        <line x1="10" y1="22" x2="14" y2="22" />
        <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0018 8 6 6 0 006 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 018.91 14" />
      </svg>
    ),
  },
  {
    title: 'Continuous Improvement',
    subtitle: 'Kaizen',
    description: 'We continuously improve through feedback and learning — it is in our name and our DNA.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
  },
];

// ---------------------------------------------------------------------------
// Delivery process steps
// ---------------------------------------------------------------------------

const deliverySteps = [
  { number: '01', title: 'Understand', description: 'We study your organization, users, and operational challenges in detail.' },
  { number: '02', title: 'Design', description: 'We design secure and scalable system architecture aligned with your goals.' },
  { number: '03', title: 'Develop', description: 'We follow clean development practices with strong testing and performance focus.' },
  { number: '04', title: 'Deploy & Support', description: 'We ensure smooth deployment and provide continuous support and enhancements.' },
];

// ---------------------------------------------------------------------------
// About Page
// ---------------------------------------------------------------------------

export default function AboutPage() {
  const [missionVisionProgress, setMissionVisionProgress] = useState(0);

  const statsGridRef = useRef<HTMLDivElement>(null);
  const valuesGridRef = useRef<HTMLDivElement>(null);
  const deliveryGridRef = useRef<HTMLDivElement>(null);

  useStaggeredScrollReveal(statsGridRef, {
    from: { opacity: 0, y: 40 },
    to: { opacity: 1, y: 0 },
    stagger: 0.1,
  });

  useStaggeredScrollReveal(valuesGridRef, {
    from: { opacity: 0, y: 40 },
    to: { opacity: 1, y: 0 },
    stagger: 0.1,
  });

  useStaggeredScrollReveal(deliveryGridRef, {
    from: { opacity: 0, y: 40 },
    to: { opacity: 1, y: 0 },
    stagger: 0.12,
  });

  return (
    <main className="relative overflow-hidden bg-[var(--color-bg-primary)]">
      {/* ================================================================= */}
      {/* HERO SECTION */}
      {/* ================================================================= */}
      <section className="relative flex min-h-screen items-center justify-center px-6">
        {/* Subtle radial glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            background:
              'radial-gradient(ellipse 60% 50% at 50% 40%, var(--color-accent-primary) 0%, transparent 70%)',
            filter: 'blur(80px)',
          }}
        />

        <div className="relative z-10 mx-auto max-w-5xl text-center">
          <ScrollFadeIn delay={0.1}>
            <span
              className="mb-6 inline-block text-[length:var(--text-xs)] font-medium uppercase tracking-[0.25em] text-[var(--color-text-tertiary)]"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              About Kaizen Infotech
            </span>
          </ScrollFadeIn>

          <TextReveal
            as="h1"
            splitBy="words"
            className="text-[clamp(3rem,6vw,5.5rem)] font-normal leading-[1.1] text-[var(--color-text-primary)]"
            stagger={0.06}
          >
            A Technology Partner Focused on Solving Real Business Problems
          </TextReveal>

          <ScrollFadeIn delay={0.6}>
            <p
              className="mx-auto mt-8 max-w-2xl text-[length:var(--text-lg)] leading-relaxed text-[var(--color-text-secondary)]"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              For over a decade, we have partnered with enterprises, government
              bodies, associations, and institutions to design and deliver digital
              platforms that simplify operations, improve engagement, and support
              long-term growth.
            </p>
          </ScrollFadeIn>

          {/* Scroll indicator */}
          <ScrollFadeIn delay={1}>
            <div className="mt-16 flex flex-col items-center gap-2">
              <span className="text-[length:var(--text-xs)] text-[var(--color-text-tertiary)]">
                Scroll to explore
              </span>
              <motion.div
                className="h-12 w-px bg-gradient-to-b from-[var(--color-accent-primary)] to-transparent"
                animate={{ scaleY: [0, 1, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                style={{ transformOrigin: 'top' }}
              />
            </div>
          </ScrollFadeIn>
        </div>
      </section>

      {/* ================================================================= */}
      {/* ORIGIN STORY SECTION */}
      {/* ================================================================= */}
      <section className="relative px-6 py-32">
        <div className="mx-auto grid max-w-7xl gap-16 lg:grid-cols-[1.5fr_1fr]">
          {/* Left: Story text */}
          <div>
            <ScrollFadeIn>
              <span
                className="mb-4 inline-block text-[length:var(--text-xs)] font-medium uppercase tracking-[0.25em] text-[var(--color-accent-primary)]"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                Who We Are
              </span>
            </ScrollFadeIn>

            <ScrollFadeIn delay={0.1}>
              <h2
                className="mb-8 text-[clamp(2.25rem,4vw,3.5rem)] font-semibold leading-tight text-[var(--color-text-primary)]"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                Built on the philosophy of{' '}
                <span className="italic text-[var(--color-accent-primary)]" style={{ fontFamily: 'var(--font-display)' }}>
                  practical solutions
                </span>
              </h2>
            </ScrollFadeIn>

            <ScrollFadeIn delay={0.2}>
              <p
                className="mb-6 text-[length:var(--text-base)] leading-[1.8] text-[var(--color-text-secondary)]"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                Kaizen Infotech Solutions Pvt. Ltd. is a trusted technology partner
                with over a decade of experience in delivering practical and scalable
                digital solutions. We believe technology should simplify operations,
                not complicate them.
              </p>
            </ScrollFadeIn>

            <ScrollFadeIn delay={0.3}>
              <p
                className="mb-8 text-[length:var(--text-base)] leading-[1.8] text-[var(--color-text-secondary)]"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                Our team works closely with stakeholders to understand business
                objectives, design the right solution architecture, and deliver
                reliable systems that are easy to use, secure, and future-ready.
              </p>
            </ScrollFadeIn>

            {/* Quick stats */}
            <div ref={statsGridRef} className="grid grid-cols-1 gap-8 border-t border-[var(--color-border)] pt-8 sm:grid-cols-3">
              <div>
                <CountUp
                  end={10}
                  suffix="+"
                  className="text-[clamp(1.75rem,3vw,3rem)] font-bold text-[var(--color-text-primary)]"
                />
                <p className="mt-1 text-[length:var(--text-sm)] text-[var(--color-text-tertiary)]">
                  Years of Experience
                </p>
              </div>
              <div>
                <CountUp
                  end={100}
                  suffix="+"
                  className="text-[clamp(1.75rem,3vw,3rem)] font-bold text-[var(--color-text-primary)]"
                />
                <p className="mt-1 text-[length:var(--text-sm)] text-[var(--color-text-tertiary)]">
                  Projects Delivered
                </p>
              </div>
              <div>
                <CountUp
                  end={8}
                  suffix="+"
                  className="text-[clamp(1.75rem,3vw,3rem)] font-bold text-[var(--color-text-primary)]"
                />
                <p className="mt-1 text-[length:var(--text-sm)] text-[var(--color-text-tertiary)]">
                  Industries Served
                </p>
              </div>
            </div>
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
        className="relative flex min-h-screen items-center justify-center px-6"
        onProgress={setMissionVisionProgress}
        duration="+=150%"
      >
        <div className="mx-auto max-w-4xl text-center">
          <AnimatePresence mode="wait">
            {missionVisionProgress < 0.5 ? (
              <motion.div
                key="mission"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <span
                  className="mb-4 inline-block text-[length:var(--text-xs)] font-medium uppercase tracking-[0.25em] text-[var(--color-accent-primary)]"
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  Our Mission
                </span>
                <h2
                  className="text-[clamp(2rem,4vw,3.75rem)] font-normal leading-[1.2] text-[var(--color-text-primary)]"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  To make technology work for people, processes, and progress —
                  simplifying operations, improving engagement, and supporting
                  long-term growth for every organization we serve.
                </h2>
              </motion.div>
            ) : (
              <motion.div
                key="vision"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <span
                  className="mb-4 inline-block text-[length:var(--text-xs)] font-medium uppercase tracking-[0.25em] text-[var(--color-accent-primary)]"
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  Our Vision
                </span>
                <h2
                  className="text-[clamp(2rem,4vw,3.75rem)] font-normal leading-[1.2] text-[var(--color-text-primary)]"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  To be the trusted technology partner that organizations choose
                  for building reliable, scalable, and future-ready digital
                  platforms that deliver measurable business impact.
                </h2>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Scroll progress indicator */}
          <div className="mt-12 flex items-center justify-center gap-3">
            <div
              className={cn(
                'h-1.5 w-8 rounded-full transition-colors duration-300',
                missionVisionProgress < 0.5
                  ? 'bg-[var(--color-accent-primary)]'
                  : 'bg-[var(--color-border)]'
              )}
            />
            <div
              className={cn(
                'h-1.5 w-8 rounded-full transition-colors duration-300',
                missionVisionProgress >= 0.5
                  ? 'bg-[var(--color-accent-primary)]'
                  : 'bg-[var(--color-border)]'
              )}
            />
          </div>
        </div>
      </PinnedSection>

      {/* ================================================================= */}
      {/* VALUES SECTION */}
      {/* ================================================================= */}
      <section className="relative px-6 py-32">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <ScrollFadeIn>
              <span
                className="mb-4 inline-block text-[length:var(--text-xs)] font-medium uppercase tracking-[0.25em] text-[var(--color-accent-primary)]"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                Our Philosophy
              </span>
            </ScrollFadeIn>
            <TextReveal
              as="h2"
              splitBy="words"
              className="text-[clamp(2.25rem,4vw,3.5rem)] font-semibold leading-tight text-[var(--color-text-primary)]"
            >
              The Kaizen Way
            </TextReveal>
            <SectionDivider variant="gradient" className="mx-auto mt-4 max-w-xs" />
          </div>

          <div ref={valuesGridRef} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
            {values.map((value) => (
              <div
                key={value.title}
                className={cn(
                  'group relative rounded-[var(--radius-lg)] p-8',
                  'bg-[var(--color-bg-tertiary)] border border-[var(--color-border)]',
                  'transition-all duration-300',
                  'hover:border-[var(--color-border-hover)]',
                  'hover:shadow-[0_0_30px_var(--color-glow)]',
                  'transition-transform hover:-translate-y-1'
                )}
              >
                {/* Icon */}
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-surface-glass)] text-[var(--color-accent-primary)] transition-transform duration-300 group-hover:scale-110">
                  {value.icon}
                </div>

                {/* Title */}
                <h3
                  className="mb-1 text-[length:var(--text-lg)] font-semibold text-[var(--color-text-primary)]"
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  {value.title}
                </h3>

                {value.subtitle && (
                  <span
                    className="mb-2 inline-block text-[length:var(--text-xs)] italic text-[var(--color-accent-primary)]"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    {value.subtitle}
                  </span>
                )}

                {/* Description */}
                <p
                  className="text-[length:var(--text-sm)] leading-relaxed text-[var(--color-text-secondary)]"
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* SERVICES / MILESTONES */}
      {/* ================================================================= */}
      <section className="relative px-6 py-32">
        <div className="mx-auto max-w-5xl">
          <div className="mb-16 text-center">
            <ScrollFadeIn>
              <span
                className="mb-4 inline-block text-[length:var(--text-xs)] font-medium uppercase tracking-[0.25em] text-[var(--color-accent-primary)]"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                What We Do
              </span>
            </ScrollFadeIn>
            <TextReveal
              as="h2"
              splitBy="words"
              className="text-[clamp(2.25rem,4vw,3.5rem)] font-semibold leading-tight text-[var(--color-text-primary)]"
            >
              End-to-End Digital Solutions
            </TextReveal>
          </div>

          {/* Timeline */}
          <div className="relative">
            {/* Vertical connecting line */}
            <DrawSVG className="absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 md:block">
              <svg
                width="2"
                height="100%"
                viewBox="0 0 2 800"
                preserveAspectRatio="none"
                className="h-full w-full"
              >
                <line
                  x1="1"
                  y1="0"
                  x2="1"
                  y2="800"
                  stroke="var(--color-accent-primary)"
                  strokeWidth="2"
                  opacity="0.3"
                />
              </svg>
            </DrawSVG>

            {/* Mobile vertical line */}
            <div className="absolute left-6 top-0 h-full w-px bg-[var(--color-border)] md:hidden" />

            {/* Milestone items */}
            <div className="space-y-12 md:space-y-16">
              {milestones.map((milestone, index) => {
                const isLeft = index % 2 === 0;
                return (
                  <ScrollFadeIn
                    key={milestone.year}
                    direction={isLeft ? 'left' : 'right'}
                    delay={index * 0.05}
                  >
                    <div
                      className={cn(
                        'relative grid items-center gap-8',
                        'pl-14 md:pl-0',
                        'md:grid-cols-[1fr_auto_1fr]'
                      )}
                    >
                      {/* Left content */}
                      <div
                        className={cn(
                          'md:text-right',
                          !isLeft && 'md:order-3 md:text-left'
                        )}
                      >
                        {isLeft ? (
                          <>
                            <h3
                              className="text-[length:var(--text-lg)] font-semibold text-[var(--color-text-primary)]"
                              style={{ fontFamily: 'var(--font-heading)' }}
                            >
                              {milestone.title}
                            </h3>
                            <p
                              className="mt-2 text-[length:var(--text-sm)] leading-relaxed text-[var(--color-text-secondary)]"
                              style={{ fontFamily: 'var(--font-body)' }}
                            >
                              {milestone.description}
                            </p>
                          </>
                        ) : (
                          <span
                            className="hidden text-[clamp(1.75rem,3vw,2.5rem)] font-bold text-[var(--color-text-tertiary)] md:block"
                            style={{ fontFamily: 'var(--font-heading)' }}
                          >
                            {milestone.year}
                          </span>
                        )}
                      </div>

                      {/* Center node */}
                      <div className="absolute left-4 flex h-5 w-5 items-center justify-center md:relative md:left-auto">
                        <motion.div
                          className="h-3 w-3 rounded-full bg-[var(--color-accent-primary)]"
                          whileInView={{
                            boxShadow: [
                              '0 0 0 0 var(--color-accent-primary)',
                              '0 0 0 8px transparent',
                            ],
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: 'easeOut',
                          }}
                          viewport={{ once: false }}
                        />
                      </div>

                      {/* Right content */}
                      <div className={cn(!isLeft && 'md:order-1 md:text-right')}>
                        {isLeft ? (
                          <span
                            className="hidden text-[clamp(1.75rem,3vw,2.5rem)] font-bold text-[var(--color-text-tertiary)] md:block"
                            style={{ fontFamily: 'var(--font-heading)' }}
                          >
                            {milestone.year}
                          </span>
                        ) : (
                          <>
                            <h3
                              className="text-[length:var(--text-lg)] font-semibold text-[var(--color-text-primary)]"
                              style={{ fontFamily: 'var(--font-heading)' }}
                            >
                              {milestone.title}
                            </h3>
                            <p
                              className="mt-2 text-[length:var(--text-sm)] leading-relaxed text-[var(--color-text-secondary)]"
                              style={{ fontFamily: 'var(--font-body)' }}
                            >
                              {milestone.description}
                            </p>
                          </>
                        )}
                      </div>

                      {/* Mobile: number badge */}
                      <span
                        className="absolute -left-0.5 top-0 text-[length:var(--text-xs)] font-bold text-[var(--color-accent-primary)] md:hidden"
                        style={{ fontFamily: 'var(--font-heading)' }}
                      >
                        {milestone.year}
                      </span>
                    </div>
                  </ScrollFadeIn>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* DELIVERY PROCESS SECTION */}
      {/* ================================================================= */}
      <section className="relative px-6 py-32">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <ScrollFadeIn>
              <span
                className="mb-4 inline-block text-[length:var(--text-xs)] font-medium uppercase tracking-[0.25em] text-[var(--color-accent-primary)]"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                How We Work
              </span>
            </ScrollFadeIn>
            <TextReveal
              as="h2"
              splitBy="words"
              className="text-[clamp(2.25rem,4vw,3.5rem)] font-semibold leading-tight text-[var(--color-text-primary)]"
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

          <div ref={deliveryGridRef} className="grid gap-8 sm:grid-cols-2">
            {deliverySteps.map((step) => (
              <div
                key={step.number}
                className={cn(
                  'group relative rounded-[var(--radius-lg)] p-8',
                  'bg-[var(--color-bg-tertiary)] border border-[var(--color-border)]',
                  'transition-all duration-300',
                  'hover:border-[var(--color-border-hover)]',
                  'hover:shadow-[0_0_30px_var(--color-glow)]',
                  'transition-transform hover:-translate-y-1'
                )}
              >
                <span
                  className="mb-4 inline-block text-[clamp(2.25rem,3vw,3.5rem)] font-bold text-[var(--color-accent-primary)] opacity-30"
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  {step.number}
                </span>
                <h3
                  className="mb-2 text-[length:var(--text-lg)] font-semibold text-[var(--color-text-primary)]"
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  {step.title}
                </h3>
                <p
                  className="text-[length:var(--text-sm)] leading-relaxed text-[var(--color-text-secondary)]"
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* CTA SECTION */}
      {/* ================================================================= */}
      <section className="relative px-6 py-32">
        <div className="mx-auto max-w-3xl text-center">
          <ScrollFadeIn>
            <h2
              className="text-[clamp(2.25rem,4vw,4rem)] font-normal leading-[1.2] text-[var(--color-text-primary)]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Let&apos;s Build Technology That Works
            </h2>
          </ScrollFadeIn>
          <ScrollFadeIn delay={0.15}>
            <p
              className="mx-auto mt-6 max-w-lg text-[length:var(--text-base)] leading-relaxed text-[var(--color-text-secondary)]"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              Whether you are planning a new digital platform or modernizing
              existing systems, Kaizen Infotech is ready to support your journey.
            </p>
          </ScrollFadeIn>
          <ScrollFadeIn delay={0.3}>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button variant="primary" size="lg" href="/contact">
                Contact Us
              </Button>
              <Button variant="secondary" size="lg" href="/work">
                View Our Work
              </Button>
            </div>
          </ScrollFadeIn>
        </div>
      </section>
    </main>
  );
}
