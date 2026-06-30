'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FadeIn } from '@/components/animation/FadeIn';
import { StaggerChildren } from '@/components/animation/StaggerChildren';
import { Accordion } from '@/components/ui/Accordion';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { PageHero } from '@/components/sections/PageHero';
import { SITE_CONFIG } from '@/lib/utils/constants';
import { VideoBackdrop } from '@/components/shared/VideoBackdrop';

// ---------------------------------------------------------------------------
// Benefits data
// TODO(client): add flexible-working policy copy when provided
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
  const [talentEmail, setTalentEmail] = useState('');
  const [talentStatus, setTalentStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle');

  const handleTalentSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setTalentStatus('loading');
      try {
        const res = await fetch('/api/newsletter', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: talentEmail }),
        });
        if (res.ok) {
          setTalentStatus('success');
          setTalentEmail('');
        } else {
          setTalentStatus('error');
        }
      } catch {
        setTalentStatus('error');
      }
    },
    [talentEmail]
  );

  return (
    <main className="relative isolate min-h-screen bg-[var(--color-bg-primary)]">
      <VideoBackdrop variant="white" fixed />
      {/* Hero Section */}
      <PageHero
        align="center"
        kicker="Careers"
        title="Join Our Journey of Continuous Improvement"
        accentWords={['Continuous', 'Improvement']}
        description="At Kaizen Infotech, we believe great software is built by curious, collaborative people who care deeply about the problems they are solving. We are always looking for talented professionals who want to build impactful technology for real organisations."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Careers' }]}
      />

      {/* Why Kaizen — Benefits Grid */}
      <section className="section-tint seam-blue relative px-6 pb-24 pt-12 md:px-12 lg:px-24">
        <div className="mx-auto max-w-7xl">
          <FadeIn>
            <h2
              className="mb-12 text-[length:var(--h-section)] font-bold text-[var(--color-text-primary)]"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              Why Work at{' '}
              <span className="text-[var(--red-brand)]">Kaizen?</span>
            </h2>
          </FadeIn>

          <StaggerChildren className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {benefits.map((benefit) => (
              <Card key={benefit.title} tilt glow className="card-accent-top h-full p-8">
                <div className="relative z-10">
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
      <section className="section-light-aura seam-red relative px-6 py-24 md:px-12 lg:px-24">
        <div className="mx-auto max-w-4xl">
          <FadeIn>
            <h2
              className="mb-12 text-[length:var(--h-section)] font-extrabold text-[var(--color-text-primary)]"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              Open{' '}
              <span className="text-[var(--red-brand)]">Positions</span>
            </h2>
          </FadeIn>

          {positions.length === 0 ? (
            <FadeIn delay={0.2}>
              {/* Talent-pool capture instead of a dead end */}
              <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-8 py-14 text-center">
                <h3
                  className="mx-auto mb-4 max-w-xl text-[length:var(--h-card)] font-semibold text-[var(--color-text-primary)]"
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  No open roles right now — but we&apos;re always meeting good
                  people.
                </h3>
                <p
                  className="mx-auto mb-8 max-w-lg text-[length:var(--text-base)] leading-relaxed text-[var(--color-text-secondary)]"
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  Leave your email and we&apos;ll let you know when a role opens
                  up.
                </p>
                <form
                  onSubmit={handleTalentSubmit}
                  className="mx-auto flex max-w-md flex-col items-center gap-4 sm:flex-row"
                >
                  <div className="w-full flex-1">
                    <Input
                      label="Email address"
                      type="email"
                      value={talentEmail}
                      onChange={(e) => setTalentEmail(e.target.value)}
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    size="md"
                    isLoading={talentStatus === 'loading'}
                  >
                    Keep me posted
                  </Button>
                </form>
                <AnimatePresence>
                  {talentStatus === 'success' && (
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="mt-4 text-[length:var(--text-sm)] text-[var(--color-accent-secondary)]"
                      style={{ fontFamily: 'var(--font-body)' }}
                    >
                      You&apos;re on the list — we&apos;ll be in touch when a
                      role opens up.
                    </motion.p>
                  )}
                  {talentStatus === 'error' && (
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="mt-4 text-[length:var(--text-sm)] text-[var(--color-accent-warm)]"
                      style={{ fontFamily: 'var(--font-body)' }}
                    >
                      Something went wrong. Please try again.
                    </motion.p>
                  )}
                </AnimatePresence>
                <p
                  className="mt-8 text-[length:var(--text-sm)] text-[var(--color-text-secondary)]"
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  Or send your CV and a note about what you are looking for to{' '}
                  <a
                    href={`mailto:${SITE_CONFIG.email}`}
                    className="focus-ring text-[var(--color-accent-primary)] underline underline-offset-2 hover:opacity-80"
                  >
                    {SITE_CONFIG.email}
                  </a>
                </p>
              </div>
            </FadeIn>
          ) : (
            <>
              <FadeIn delay={0.2}>
                <Accordion items={accordionItems} />
              </FadeIn>

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
                    We are always open to hearing from talented people. Send
                    your CV and a note about what you are looking for to{' '}
                    <a
                      href={`mailto:${SITE_CONFIG.email}`}
                      className="focus-ring text-[var(--color-accent-primary)] underline underline-offset-2 hover:opacity-80"
                    >
                      {SITE_CONFIG.email}
                    </a>
                  </p>
                </div>
              </FadeIn>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
