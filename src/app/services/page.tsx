'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { TextReveal } from '@/components/animation/TextReveal';
import { ScrollFadeIn } from '@/components/animation/ScrollFadeIn';
import { useStaggeredScrollReveal } from '@/hooks/useStaggeredScrollReveal';
import { Accordion } from '@/components/ui/Accordion';
import { Button } from '@/components/ui/Button';
import { services } from '@/content/services';
import { cn } from '@/lib/utils/cn';

// ---------------------------------------------------------------------------
// Service icon mapping
// ---------------------------------------------------------------------------

const serviceIcons: Record<string, React.ReactNode> = {
  Code: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  ),
  Smartphone: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
      <line x1="12" y1="18" x2="12.01" y2="18" />
    </svg>
  ),
  Cloud: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z" />
    </svg>
  ),
  Brain: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.5 2A5.5 5.5 0 005 7.5c0 .96.25 1.87.7 2.65A5.5 5.5 0 003 15.5 5.5 5.5 0 008.5 21h1V2h0z" />
      <path d="M14.5 2A5.5 5.5 0 0120 7.5c0 .96-.25 1.87-.7 2.65A5.5 5.5 0 0122 15.5a5.5 5.5 0 01-5.5 5.5h-1V2h0z" />
    </svg>
  ),
  Palette: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c1.1 0 2-.9 2-2 0-.49-.18-.96-.51-1.34A1.98 1.98 0 0113 17c0-1.1.9-2 2-2h2.33C20.47 15 23 12.47 23 9.17 23 5.08 18.03 2 12 2z" />
      <circle cx="7.5" cy="11.5" r="1.5" />
      <circle cx="11" cy="7.5" r="1.5" />
      <circle cx="15.5" cy="7.5" r="1.5" />
      <circle cx="18" cy="11.5" r="1.5" />
    </svg>
  ),
  TrendingUp: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  ),
  Calendar: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  Globe: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
    </svg>
  ),
};

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
      'We work with government and public sector organizations, enterprises, associations and membership-based organizations, event organizers, and SMEs. Our cross-industry experience lets us bring best practices from one domain to solve challenges in another.',
  },
  {
    title: 'What technologies do you use?',
    content:
      'We use reliable and proven technologies including ASP.NET, HTML, CSS, JavaScript, MySQL, SQL Server, Android, iOS, APIs, payment gateway integrations, WhatsApp, and email systems.',
  },
  {
    title: 'Do you offer post-launch support?',
    content:
      'Yes, we provide dedicated post-launch support and maintenance. Our engagement does not end at deployment — we provide continuous enhancements, monitoring, and technical support.',
  },
  {
    title: 'How do you ensure project quality?',
    content:
      'We follow clean coding practices, strong testing protocols, and performance optimization throughout development. Our structured delivery process includes discovery, design, development, and deployment with support at each stage.',
  },
  {
    title: 'Can you work with existing systems?',
    content:
      'Yes, we specialize in integrating with existing enterprise systems through APIs and custom connectors. Whether you need to modernize legacy systems or add new capabilities, we design solutions that work alongside your current infrastructure.',
  },
];

// ---------------------------------------------------------------------------
// Services Page
// ---------------------------------------------------------------------------

export default function ServicesPage() {
  // Keyword rotation
  const [keywordIndex, setKeywordIndex] = useState(0);

  // Refs for staggered scroll reveal
  const serviceGridRef = useRef<HTMLDivElement>(null);
  const whyChooseGridRef = useRef<HTMLDivElement>(null);

  useStaggeredScrollReveal(serviceGridRef, {
    from: { opacity: 0, y: 40 },
    to: { opacity: 1, y: 0 },
    stagger: 0.1,
  });

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
    <main className="relative overflow-hidden bg-[var(--color-bg-primary)]">
      {/* ================================================================= */}
      {/* HERO SECTION */}
      {/* ================================================================= */}
      <section className="relative flex min-h-screen items-center justify-center px-6">
        {/* Background glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            background:
              'radial-gradient(ellipse 50% 40% at 50% 50%, var(--color-accent-primary) 0%, transparent 70%)',
            filter: 'blur(100px)',
          }}
        />

        <div className="relative z-10 mx-auto max-w-5xl text-center">
          <ScrollFadeIn delay={0.1}>
            <span
              className="mb-6 inline-block text-[length:var(--text-xs)] font-medium uppercase tracking-[0.25em] text-[var(--color-text-tertiary)]"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              Our Services
            </span>
          </ScrollFadeIn>

          <div className="flex flex-col items-center">
            <TextReveal
              as="h1"
              splitBy="words"
              className="text-[clamp(2.5rem,6vw,5rem)] font-normal leading-[1.1] text-[var(--color-text-primary)]"
              stagger={0.06}
            >
              What We Do Best
            </TextReveal>

            {/* Animated keyword rotation — keep AnimatePresence for interaction-driven animation */}
            <ScrollFadeIn delay={0.5}>
              <div className="mt-6 flex items-center gap-3">
                <span
                  className="text-[length:var(--text-lg)] text-[var(--color-text-secondary)]"
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  We specialize in
                </span>
                <div className="relative h-8 w-36 overflow-hidden">
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={keywords[keywordIndex]}
                      initial={{ y: 24, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -24, opacity: 0 }}
                      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute left-0 top-0 text-[length:var(--text-lg)] font-semibold text-[var(--color-accent-primary)]"
                      style={{ fontFamily: 'var(--font-heading)' }}
                    >
                      {keywords[keywordIndex]}
                    </motion.span>
                  </AnimatePresence>
                </div>
              </div>
            </ScrollFadeIn>
          </div>

          <ScrollFadeIn delay={0.7}>
            <p
              className="mx-auto mt-8 max-w-2xl text-[length:var(--text-base)] leading-relaxed text-[var(--color-text-secondary)]"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              From custom software and mobile apps to event management systems and
              digital marketing — we deliver end-to-end digital solutions
              designed for modern organizations.
            </p>
          </ScrollFadeIn>
        </div>
      </section>

      {/* ================================================================= */}
      {/* SERVICE OVERVIEW GRID */}
      {/* ================================================================= */}
      <section className="relative px-6 py-32">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <ScrollFadeIn>
              <span
                className="mb-4 inline-block text-[length:var(--text-xs)] font-medium uppercase tracking-[0.25em] text-[var(--color-accent-primary)]"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                Capabilities
              </span>
            </ScrollFadeIn>
            <TextReveal
              as="h2"
              splitBy="words"
              className="text-[clamp(2rem,4vw,3rem)] font-semibold leading-tight text-[var(--color-text-primary)]"
            >
              End-to-End Technology Services
            </TextReveal>
          </div>

          <div ref={serviceGridRef} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <Link
                key={service.id}
                href={`/services/${service.slug}`}
                className="group block"
              >
                <div
                  className={cn(
                    'relative flex h-full flex-col rounded-[var(--radius-lg)] p-8',
                    'bg-[var(--color-bg-tertiary)] border border-[var(--color-border)]',
                    'transition-all duration-300',
                    'hover:border-[var(--color-border-hover)]',
                    'hover:shadow-[0_0_40px_var(--color-glow)]',
                    'hover:-translate-y-1.5'
                  )}
                >
                  {/* Icon */}
                  <div
                    className="mb-6 flex h-14 w-14 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-surface-glass)] text-[var(--color-accent-primary)] transition-transform duration-300 group-hover:rotate-[5deg] group-hover:scale-110"
                  >
                    {serviceIcons[service.icon] ?? serviceIcons.Code}
                  </div>

                  {/* Title */}
                  <h3
                    className="mb-3 text-[length:var(--text-xl)] font-semibold text-[var(--color-text-primary)]"
                    style={{ fontFamily: 'var(--font-heading)' }}
                  >
                    {service.title}
                  </h3>

                  {/* Description */}
                  <p
                    className="mb-6 flex-1 text-[length:var(--text-sm)] leading-relaxed text-[var(--color-text-secondary)]"
                    style={{ fontFamily: 'var(--font-body)' }}
                  >
                    {service.description}
                  </p>

                  {/* Technologies */}
                  <div className="mb-6 flex flex-wrap gap-2">
                    {service.technologies.map((tech) => (
                      <span
                        key={tech}
                        className={cn(
                          'inline-block rounded-[var(--radius-full)] px-3 py-1',
                          'bg-[var(--color-surface-glass)] text-[length:var(--text-xs)]',
                          'text-[var(--color-text-tertiary)]',
                          'border border-[var(--color-border)]'
                        )}
                        style={{ fontFamily: 'var(--font-mono)' }}
                      >
                        {tech}
                      </span>
                    ))}
                  </div>

                  {/* Arrow CTA */}
                  <div className="flex items-center justify-between border-t border-[var(--color-border)] pt-4">
                    <span
                      className="text-[length:var(--text-xs)] font-medium uppercase tracking-wider text-[var(--color-text-tertiary)] transition-colors duration-200 group-hover:text-[var(--color-accent-primary)]"
                      style={{ fontFamily: 'var(--font-heading)' }}
                    >
                      Learn more
                    </span>
                    <span
                      className="text-[var(--color-text-tertiary)] transition-all duration-200 group-hover:translate-x-1 group-hover:text-[var(--color-accent-primary)]"
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                      >
                        <path
                          d="M4 10H16M16 10L11 5M16 10L11 15"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* WHY CHOOSE US */}
      {/* ================================================================= */}
      <section className="relative px-6 py-32">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <ScrollFadeIn>
              <span
                className="mb-4 inline-block text-[length:var(--text-xs)] font-medium uppercase tracking-[0.25em] text-[var(--color-accent-primary)]"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                The Kaizen Difference
              </span>
            </ScrollFadeIn>
            <TextReveal
              as="h2"
              splitBy="words"
              className="text-[clamp(2rem,4vw,3rem)] font-semibold leading-tight text-[var(--color-text-primary)]"
            >
              Why Choose Us
            </TextReveal>
          </div>

          <div ref={whyChooseGridRef} className="grid gap-8 sm:grid-cols-2 md:grid-cols-3">
            {whyChooseUs.map((item) => (
              <div key={item.title} className="text-center">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-surface-glass)] text-[var(--color-accent-primary)]">
                  {item.icon}
                </div>
                <h3
                  className="mb-3 text-[length:var(--text-xl)] font-semibold text-[var(--color-text-primary)]"
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
      <section className="relative px-6 py-32">
        <div className="mx-auto max-w-3xl">
          <div className="mb-16 text-center">
            <ScrollFadeIn>
              <span
                className="mb-4 inline-block text-[length:var(--text-xs)] font-medium uppercase tracking-[0.25em] text-[var(--color-accent-primary)]"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                Common Questions
              </span>
            </ScrollFadeIn>
            <TextReveal
              as="h2"
              splitBy="words"
              className="text-[clamp(2rem,4vw,3rem)] font-semibold leading-tight text-[var(--color-text-primary)]"
            >
              Frequently Asked Questions
            </TextReveal>
          </div>

          <ScrollFadeIn>
            <Accordion items={faqItems} />
          </ScrollFadeIn>
        </div>
      </section>

      {/* ================================================================= */}
      {/* CTA SECTION */}
      {/* ================================================================= */}
      <section className="relative px-6 py-32">
        <div className="mx-auto max-w-3xl text-center">
          <ScrollFadeIn>
            <h2
              className="text-[clamp(2rem,4vw,3.5rem)] font-normal leading-[1.2] text-[var(--color-text-primary)]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Let&apos;s Discuss Your Project
            </h2>
          </ScrollFadeIn>
          <ScrollFadeIn delay={0.15}>
            <p
              className="mx-auto mt-6 max-w-lg text-[length:var(--text-base)] leading-relaxed text-[var(--color-text-secondary)]"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              Ready to digitize your operations? Tell us about your challenges
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
