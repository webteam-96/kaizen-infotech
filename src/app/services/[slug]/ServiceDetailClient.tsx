'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { TextReveal } from '@/components/animation/TextReveal';
import { FadeIn } from '@/components/animation/FadeIn';
import { StaggerChildren } from '@/components/animation/StaggerChildren';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils/cn';
import type { Service } from '@/types';

// ---------------------------------------------------------------------------
// Icon mapping (same as services page)
// ---------------------------------------------------------------------------

const serviceIcons: Record<string, React.ReactNode> = {
  Code: (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  ),
  Smartphone: (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
      <line x1="12" y1="18" x2="12.01" y2="18" />
    </svg>
  ),
  Cloud: (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z" />
    </svg>
  ),
  Brain: (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.5 2A5.5 5.5 0 005 7.5c0 .96.25 1.87.7 2.65A5.5 5.5 0 003 15.5 5.5 5.5 0 008.5 21h1V2h0z" />
      <path d="M14.5 2A5.5 5.5 0 0120 7.5c0 .96-.25 1.87-.7 2.65A5.5 5.5 0 0122 15.5a5.5 5.5 0 01-5.5 5.5h-1V2h0z" />
    </svg>
  ),
  Palette: (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c1.1 0 2-.9 2-2 0-.49-.18-.96-.51-1.34A1.98 1.98 0 0113 17c0-1.1.9-2 2-2h2.33C20.47 15 23 12.47 23 9.17 23 5.08 18.03 2 12 2z" />
      <circle cx="7.5" cy="11.5" r="1.5" />
      <circle cx="11" cy="7.5" r="1.5" />
      <circle cx="15.5" cy="7.5" r="1.5" />
      <circle cx="18" cy="11.5" r="1.5" />
    </svg>
  ),
  TrendingUp: (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  ),
  Calendar: (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  Globe: (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
    </svg>
  ),
};

// Small icon version for related cards
const serviceIconsSmall: Record<string, React.ReactNode> = {
  Code: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  ),
  Smartphone: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
      <line x1="12" y1="18" x2="12.01" y2="18" />
    </svg>
  ),
  Cloud: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z" />
    </svg>
  ),
  Brain: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.5 2A5.5 5.5 0 005 7.5c0 .96.25 1.87.7 2.65A5.5 5.5 0 003 15.5 5.5 5.5 0 008.5 21h1V2h0z" />
      <path d="M14.5 2A5.5 5.5 0 0120 7.5c0 .96-.25 1.87-.7 2.65A5.5 5.5 0 0122 15.5a5.5 5.5 0 01-5.5 5.5h-1V2h0z" />
    </svg>
  ),
  Palette: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c1.1 0 2-.9 2-2 0-.49-.18-.96-.51-1.34A1.98 1.98 0 0113 17c0-1.1.9-2 2-2h2.33C20.47 15 23 12.47 23 9.17 23 5.08 18.03 2 12 2z" />
    </svg>
  ),
  TrendingUp: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  ),
  Calendar: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  Globe: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
    </svg>
  ),
};

// ---------------------------------------------------------------------------
// Checkmark icon
// ---------------------------------------------------------------------------

function CheckIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      className="shrink-0 text-[var(--color-accent-primary)]"
    >
      <path
        d="M5 10L8.5 13.5L15 6.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface ServiceDetailClientProps {
  service: Service;
  relatedServices: Service[];
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ServiceDetailClient({
  service,
  relatedServices,
}: ServiceDetailClientProps) {
  return (
    <main className="relative overflow-hidden bg-[var(--color-bg-primary)]">
      {/* ================================================================= */}
      {/* HERO */}
      {/* ================================================================= */}
      <section className="relative flex min-h-[70vh] items-end px-6 pb-20 pt-32">
        {/* Background glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-15"
          style={{
            background:
              'radial-gradient(ellipse 60% 50% at 50% 30%, var(--color-accent-primary) 0%, transparent 70%)',
            filter: 'blur(80px)',
          }}
        />

        <div className="relative z-10 mx-auto w-full max-w-5xl">
          {/* Breadcrumb */}
          <FadeIn>
            <nav className="mb-8 flex items-center gap-2 text-[length:var(--text-sm)] text-[var(--color-text-tertiary)]">
              <Link
                href="/services"
                className="transition-colors hover:text-[var(--color-text-primary)]"
              >
                Services
              </Link>
              <span>/</span>
              <span className="text-[var(--color-text-secondary)]">
                {service.title}
              </span>
            </nav>
          </FadeIn>

          {/* Icon */}
          <FadeIn delay={0.1}>
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-[var(--radius-lg)] bg-[var(--color-surface-glass)] text-[var(--color-accent-primary)]">
              {serviceIcons[service.icon] ?? serviceIcons.Code}
            </div>
          </FadeIn>

          {/* Title */}
          <TextReveal
            as="h1"
            splitBy="words"
            className="text-[clamp(2rem,5vw,4rem)] font-semibold leading-[1.1] text-[var(--color-text-primary)]"
            stagger={0.06}
          >
            {service.title}
          </TextReveal>

          {/* Short description */}
          <FadeIn delay={0.4}>
            <p
              className="mt-6 max-w-2xl text-[length:var(--text-lg)] leading-relaxed text-[var(--color-text-secondary)]"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              {service.description}
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ================================================================= */}
      {/* LONG DESCRIPTION + FEATURES */}
      {/* ================================================================= */}
      <section className="relative px-6 py-32">
        <div className="mx-auto grid max-w-7xl gap-16 md:grid-cols-2 lg:grid-cols-[1.2fr_1fr]">
          {/* Left: Long description */}
          <div>
            <FadeIn>
              <span
                className="mb-4 inline-block text-[length:var(--text-xs)] font-medium uppercase tracking-[0.25em] text-[var(--color-accent-primary)]"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                Overview
              </span>
            </FadeIn>
            <FadeIn delay={0.1}>
              <p
                className="text-[length:var(--text-base)] leading-[1.8] text-[var(--color-text-secondary)]"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                {service.longDescription}
              </p>
            </FadeIn>

            {/* Technologies */}
            <FadeIn delay={0.2}>
              <div className="mt-10">
                <h3
                  className="mb-4 text-[length:var(--text-sm)] font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)]"
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  Technologies
                </h3>
                <div className="flex flex-wrap gap-3">
                  {service.technologies.map((tech) => (
                    <span
                      key={tech}
                      className={cn(
                        'inline-block rounded-[var(--radius-full)] px-4 py-2',
                        'bg-[var(--color-surface-glass)]',
                        'text-[length:var(--text-sm)] text-[var(--color-text-secondary)]',
                        'border border-[var(--color-border)]'
                      )}
                      style={{ fontFamily: 'var(--font-mono)' }}
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </FadeIn>
          </div>

          {/* Right: Feature list */}
          <div>
            <FadeIn>
              <span
                className="mb-4 inline-block text-[length:var(--text-xs)] font-medium uppercase tracking-[0.25em] text-[var(--color-accent-primary)]"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                What We Deliver
              </span>
            </FadeIn>

            <StaggerChildren className="space-y-4">
              {service.features.map((feature, index) => (
                <motion.div
                  key={index}
                  className={cn(
                    'flex items-start gap-4 rounded-[var(--radius-md)] p-4',
                    'bg-[var(--color-bg-tertiary)] border border-[var(--color-border)]',
                    'transition-colors duration-200 hover:border-[var(--color-border-hover)]'
                  )}
                  whileHover={{ x: 4 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                >
                  <CheckIcon />
                  <p
                    className="text-[length:var(--text-sm)] leading-relaxed text-[var(--color-text-secondary)]"
                    style={{ fontFamily: 'var(--font-body)' }}
                  >
                    {feature}
                  </p>
                </motion.div>
              ))}
            </StaggerChildren>
          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* RELATED SERVICES */}
      {/* ================================================================= */}
      <section className="relative px-6 py-32">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12">
            <FadeIn>
              <span
                className="mb-4 inline-block text-[length:var(--text-xs)] font-medium uppercase tracking-[0.25em] text-[var(--color-accent-primary)]"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                Explore More
              </span>
            </FadeIn>
            <TextReveal
              as="h2"
              splitBy="words"
              className="text-[clamp(1.5rem,3vw,2.5rem)] font-semibold leading-tight text-[var(--color-text-primary)]"
            >
              Related Services
            </TextReveal>
          </div>

          <StaggerChildren className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {relatedServices.map((related) => (
              <Link
                key={related.id}
                href={`/services/${related.slug}`}
                className="group block"
              >
                <motion.div
                  className={cn(
                    'flex h-full flex-col rounded-[var(--radius-lg)] p-6',
                    'bg-[var(--color-bg-tertiary)] border border-[var(--color-border)]',
                    'transition-all duration-300',
                    'hover:border-[var(--color-border-hover)]'
                  )}
                  whileHover={{ y: -4 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                >
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--color-surface-glass)] text-[var(--color-accent-primary)]">
                    {serviceIconsSmall[related.icon] ?? serviceIconsSmall.Code}
                  </div>
                  <h3
                    className="mb-2 text-[length:var(--text-lg)] font-semibold text-[var(--color-text-primary)]"
                    style={{ fontFamily: 'var(--font-heading)' }}
                  >
                    {related.title}
                  </h3>
                  <p
                    className="flex-1 text-[length:var(--text-sm)] leading-relaxed text-[var(--color-text-tertiary)]"
                    style={{ fontFamily: 'var(--font-body)' }}
                  >
                    {related.description}
                  </p>
                  <span
                    className="mt-4 inline-flex items-center gap-1 text-[length:var(--text-xs)] font-medium uppercase tracking-wider text-[var(--color-text-tertiary)] transition-colors duration-200 group-hover:text-[var(--color-accent-primary)]"
                    style={{ fontFamily: 'var(--font-heading)' }}
                  >
                    View service
                    <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
                      <path
                        d="M4 10H16M16 10L11 5M16 10L11 15"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </motion.div>
              </Link>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ================================================================= */}
      {/* CTA */}
      {/* ================================================================= */}
      <section className="relative px-6 py-32">
        <div className="mx-auto max-w-3xl text-center">
          <FadeIn>
            <h2
              className="text-[clamp(2rem,4vw,3.5rem)] font-normal leading-[1.2] text-[var(--color-text-primary)]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Ready to Get Started?
            </h2>
          </FadeIn>
          <FadeIn delay={0.15}>
            <p
              className="mx-auto mt-6 max-w-lg text-[length:var(--text-base)] leading-relaxed text-[var(--color-text-secondary)]"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              Tell us about your project and we will put together a tailored plan
              for {service.title.toLowerCase()}.
            </p>
          </FadeIn>
          <FadeIn delay={0.3}>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button variant="primary" size="lg" href="/contact">
                Contact Us
              </Button>
              <Button variant="secondary" size="lg" href="/services">
                All Services
              </Button>
            </div>
          </FadeIn>
        </div>
      </section>
    </main>
  );
}
