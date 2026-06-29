'use client';

import { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { TextReveal } from '@/components/animation/TextReveal';
import { ScrollFadeIn } from '@/components/animation/ScrollFadeIn';
import { useStaggeredScrollReveal } from '@/hooks/useStaggeredScrollReveal';
import { Accordion } from '@/components/ui/Accordion';
import { Button } from '@/components/ui/Button';
import { PageHero } from '@/components/sections/PageHero';
import { ServiceCardDeck } from '@/components/sections/ServiceCardDeck';

// Short keywords for hero rotation
const keywords = ['Software', 'Mobile', 'Events', 'Portals', 'Marketing'];

// Why choose us data
const whyChooseUs = [
  {
    title: '10+ Years Experience',
    description:
      'Deep industry knowledge built over a decade of delivering enterprise and government projects across multiple sectors.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" />
        <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" />
      </svg>
    ),
  },
  {
    title: 'Business-First Approach',
    description:
      'We understand your business processes first, then design technology solutions that align with real operational workflows.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
      </svg>
    ),
  },
  {
    title: 'Dedicated Support',
    description:
      'Your project gets continuous post-launch support, maintenance, and enhancements. We are a long-term technology partner, not just a vendor.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
  },
];

// FAQ data
const faqItems = [
  {
    title: 'What industries do you serve?',
    content:
      'We work with government and public sector organisations, enterprises, associations and membership-based organisations, event organisers, healthcare providers, and SMEs across India.',
  },
  {
    title: 'What technologies do you use?',
    content:
      'We use proven enterprise technologies including ASP.NET, JavaScript, SQL Server, MySQL, Android, iOS, REST APIs, Payment Gateways, WhatsApp API, and email communication systems.',
  },
  {
    title: 'Do you offer post-launch support?',
    content:
      'Yes. We provide dedicated post-launch support and maintenance. Our engagement continues well beyond deployment with continuous enhancements, monitoring, and technical support.',
  },
  {
    title: 'How do you ensure project quality?',
    content:
      'We follow structured delivery with clean coding practices, comprehensive testing, and performance optimisation at every stage - from discovery and design through to deployment.',
  },
  {
    title: 'Can you integrate with our existing systems?',
    content:
      'Yes. API integration with existing enterprise backends, legacy systems, and third-party platforms is a core capability. We design solutions that work alongside your current infrastructure.',
  },
];

// ---------------------------------------------------------------------------
// Services Page
// ---------------------------------------------------------------------------

export default function ServicesPage() {
  // Keyword rotation
  const [keywordIndex, setKeywordIndex] = useState(0);

  // Refs for staggered scroll reveal
  const whyChooseGridRef = useRef<HTMLDivElement>(null);

  useStaggeredScrollReveal(whyChooseGridRef, {
    from: { opacity: 0, y: 40 },
    to: { opacity: 1, y: 0 },
    stagger: 0.1,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setKeywordIndex((prev) => (prev + 1) % keywords.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="relative overflow-x-clip bg-[var(--color-bg-primary)]">
      {/* ================================================================= */}
      {/* HERO SECTION */}
      {/* ================================================================= */}
      <PageHero
        align="center"
        kicker="Our Services"
        title="What We Do Best"
        accentWords={['Best']}
        description="From custom enterprise software and mobile apps to event management systems and digital marketing - we deliver complete digital solutions designed to simplify operations, improve engagement, and drive measurable results."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Services' }]}
      >
        {/* Animated keyword rotation — keep AnimatePresence for interaction-driven animation */}
        <div className="flex flex-wrap items-center gap-3">
          <span
            className="text-[length:var(--h-section)] text-[var(--color-text-secondary)]"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            We specialize in
          </span>
          <div className="relative h-12 w-56 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.span
                key={keywords[keywordIndex]}
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -30, opacity: 0 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="absolute left-0 top-0 text-[length:var(--h-section)] font-semibold text-[var(--color-accent-primary)]"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                {keywords[keywordIndex]}
              </motion.span>
            </AnimatePresence>
          </div>
        </div>
      </PageHero>

      {/* ================================================================= */}
      {/* SERVICE CARD DECK */}
      {/* ================================================================= */}
      <section className="section-tint seam-blue relative">
        <div className="mx-auto mb-16 max-w-7xl px-6 pt-32 text-center">
          <ScrollFadeIn>
            <span
              className="mb-4 inline-block text-[length:var(--h-eyebrow)] font-medium uppercase tracking-[0.25em] text-[var(--color-text-tertiary)]"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              Capabilities
            </span>
          </ScrollFadeIn>
          <TextReveal
            as="h2"
            splitBy="words"
            className="text-[length:var(--h-section)] font-semibold leading-tight text-[var(--color-text-primary)]"
          >
            End-to-End Technology Services
          </TextReveal>
        </div>

        <ServiceCardDeck />
      </section>

      {/* ================================================================= */}
      {/* WHY CHOOSE US */}
      {/* ================================================================= */}
      <section className="section-light-aura seam-red relative px-6 py-32">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <ScrollFadeIn>
              <span
                className="mb-4 inline-block text-[length:var(--h-eyebrow)] font-medium uppercase tracking-[0.25em] text-[var(--color-text-tertiary)]"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                The Kaizen Difference
              </span>
            </ScrollFadeIn>
            <TextReveal
              as="h2"
              splitBy="words"
              className="text-[length:var(--h-section)] font-semibold leading-tight text-[var(--color-text-primary)]"
            >
              Why Choose Us
            </TextReveal>
          </div>

          <div ref={whyChooseGridRef} className="grid gap-8 sm:grid-cols-2 md:grid-cols-3">
            {whyChooseUs.map((item) => (
              <div
                key={item.title}
                className="card-accent-top group relative overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-primary)] p-8 text-center transition-all duration-300 hover:border-[var(--color-border-hover)] hover:shadow-[0_0_30px_var(--color-glow)] hover:-translate-y-1"
              >
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--red-soft)] text-[var(--red-brand)]">
                  {item.icon}
                </div>
                <h3
                  className="mb-3 text-[length:var(--h-card)] font-semibold text-[var(--color-text-primary)]"
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  {item.title}
                </h3>
                <p
                  className="text-[length:var(--text-sm)] leading-relaxed text-[var(--color-text-secondary)]"
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* FAQ SECTION */}
      {/* ================================================================= */}
      <section className="section-tint seam-blue relative px-6 py-32">
        <div className="mx-auto max-w-3xl">
          <div className="mb-16 text-center">
            <ScrollFadeIn>
              <span
                className="mb-4 inline-block text-[length:var(--h-eyebrow)] font-medium uppercase tracking-[0.25em] text-[var(--color-text-tertiary)]"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                Common Questions
              </span>
            </ScrollFadeIn>
            <TextReveal
              as="h2"
              splitBy="words"
              className="text-[length:var(--h-section)] font-semibold leading-tight text-[var(--color-text-primary)]"
            >
              Frequently Asked Questions
            </TextReveal>
          </div>

          <ScrollFadeIn>
            <Accordion items={faqItems} revealOnHover />
          </ScrollFadeIn>
        </div>
      </section>

      {/* ================================================================= */}
      {/* CTA SECTION */}
      {/* ================================================================= */}
      <section className="section-ink seam-red relative px-6 py-32">
        <div className="mx-auto max-w-3xl text-center">
          <ScrollFadeIn>
            <h2
              className="text-[length:var(--h-section)] font-extrabold leading-[1.2] text-[var(--text-on-ink)]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Let&apos;s Discuss Your{' '}
              <span className="text-[var(--accent-on-ink)]">Project</span>
            </h2>
          </ScrollFadeIn>
          <ScrollFadeIn delay={0.15}>
            <p
              className="mx-auto mt-6 max-w-lg text-[length:var(--text-base)] leading-relaxed text-[var(--text-on-ink-muted)]"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              Ready to digitalize your operations? Tell us about your challenges
              and we will show you how we can help.
            </p>
          </ScrollFadeIn>
          <ScrollFadeIn delay={0.3}>
            <div className="mt-10">
              <Button variant="primary" size="lg" href="/contact">
                Start a Conversation
              </Button>
            </div>
          </ScrollFadeIn>
        </div>
      </section>
    </main>
  );
}
