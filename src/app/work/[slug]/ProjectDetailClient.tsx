'use client';

import { createElement, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import {
  motion,
  animate,
  useInView,
  useScroll,
  useSpring,
} from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  TrendingUp,
} from 'lucide-react';

import { TextReveal } from '@/components/animation/TextReveal';
import { FadeIn } from '@/components/animation/FadeIn';
import { StaggerChildren } from '@/components/animation/StaggerChildren';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { TestimonialCard } from '@/components/ui/TestimonialCard';
import { ProjectCoverArt } from '@/components/work/ProjectCoverArt';
import { BrowserMockup } from '@/components/work/BrowserMockup';
import { getFeatureIcon } from '@/components/work/featureIcons';
import { useReducedMotion } from '@/hooks';
import { cn } from '@/lib/utils/cn';
import type { Project, ProjectMetric } from '@/types';

const EASE = [0.16, 1, 0.3, 1] as const;

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
      <ReadingProgress />

      {/* ---- Hero — dramatic dark cover band ---- */}
      <section className="relative isolate flex min-h-[82vh] items-center overflow-hidden pt-28">
        <ProjectCoverArt
          slug={project.slug}
          category={project.category}
          motif={project.coverArt}
          className="absolute inset-0 -z-10"
        />
        <div
          className="absolute inset-0 -z-10"
          style={{
            background:
              'radial-gradient(125% 95% at 50% 28%, rgba(10,25,41,0.15), rgba(10,25,41,0.88))',
          }}
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-32 bg-gradient-to-t from-[var(--color-bg-primary)] to-transparent" />

        <div className="relative mx-auto w-full max-w-7xl px-6 pb-20 md:px-12 lg:px-24">
          <FadeIn direction="none" duration={0.5}>
            <Link
              href="/work"
              className="focus-ring group mb-8 inline-flex items-center gap-2 text-[length:var(--text-sm)] text-white/70 transition-colors hover:text-white"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
              All Work
            </Link>
          </FadeIn>

          <StaggerChildren className="mb-7 flex flex-wrap items-center gap-2.5" stagger={0.06}>
            <Chip>{project.category}</Chip>
            <Chip>{project.year}</Chip>
            {project.location && <Chip>{project.location}</Chip>}
          </StaggerChildren>

          <TextReveal
            as="h1"
            splitBy="words"
            className="max-w-4xl text-[length:var(--h-page)] font-bold leading-[1.05] tracking-tight text-white"
          >
            {project.title}
          </TextReveal>

          {project.tagline && (
            <FadeIn delay={0.25} duration={0.7}>
              <p
                className="mt-6 max-w-2xl text-[length:var(--h-sub)] leading-relaxed text-[color-mix(in_srgb,var(--color-accent-secondary)_85%,white)]"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                {project.tagline}
              </p>
            </FadeIn>
          )}

          <FadeIn delay={0.45} duration={0.8}>
            <p
              className="mt-5 max-w-3xl text-[length:var(--text-base)] leading-relaxed text-white/65"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              {project.description}
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ---- Showcase — real screenshot in a browser frame, pulled over the seam ---- */}
      <section className="relative z-10 px-6 md:px-12 lg:px-24">
        <FadeIn direction="up" duration={0.8}>
          <div className="mx-auto -mt-20 max-w-3xl md:-mt-28">
            <BrowserMockup
              src={project.image}
              alt={`${project.title} interface`}
              url={`kaizeninfotech.com/work/${project.slug}`}
              priority
            />
          </div>
        </FadeIn>
      </section>

      {/* ---- Metrics band ---- */}
      {project.metrics && project.metrics.length > 0 && (
        <section className="px-6 py-16 md:px-12 md:py-20 lg:px-24">
          <div className="mx-auto max-w-7xl rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-8 py-12 md:px-12">
            <StaggerChildren
              className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4"
              stagger={0.1}
            >
              {project.metrics.map((m) => (
                <MetricStat key={m.label} value={m.value} label={m.label} />
              ))}
            </StaggerChildren>
          </div>
        </section>
      )}

      {/* ---- Overview + project facts ---- */}
      <section className="section-light-aura seam-blue px-6 py-16 md:px-12 md:py-24 lg:px-24">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
          {/* Facts */}
          <FadeIn direction="left">
            <div className="grid grid-cols-2 gap-x-6 gap-y-8">
              <Fact label="Client" value={project.client} />
              <Fact label="Industry" value={project.category} />
              <Fact label="Year" value={project.year} />
              {project.location && <Fact label="Where" value={project.location} />}
              <div className="col-span-2">
                <FactLabel>Technologies</FactLabel>
                <div className="mt-3 flex flex-wrap gap-2">
                  {project.technologies.map((tech) => (
                    <Badge key={tech} variant="accent">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </FadeIn>

          {/* Overview copy */}
          <FadeIn direction="right">
            <div>
              <SectionEyebrow label="Overview" color="var(--color-accent-primary)" />
              <h2
                className="mb-6 text-[length:var(--h-section)] font-bold leading-tight text-[var(--color-text-primary)]"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                At a Glance
              </h2>
              <p
                className="text-[length:var(--text-lg)] leading-relaxed text-[var(--color-text-secondary)]"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                {project.overview ?? project.description}
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ---- Challenge → Solution → Result ---- */}
      <section className="section-tint seam-red px-6 py-20 md:px-12 md:py-28 lg:px-24">
        <div className="mx-auto max-w-4xl space-y-20 md:space-y-28">
          <StoryBlock
            index="01"
            eyebrow="The Challenge"
            heading="Understanding the Problem"
            body={project.challenge}
            color="var(--color-accent-warm)"
          />
          <StoryBlock
            index="02"
            eyebrow="Our Solution"
            heading="Building the Answer"
            body={project.solution}
            color="var(--color-accent-primary)"
          />
          <StoryBlock
            index="03"
            eyebrow="The Result"
            heading="Measurable Impact"
            body={project.result}
            color="var(--color-accent-secondary)"
          />
        </div>
      </section>

      {/* ---- Features / capabilities ---- */}
      {project.features && project.features.length > 0 && (
        <section className="section-light-aura seam-blue px-6 py-20 md:px-12 md:py-28 lg:px-24">
          <div className="mx-auto max-w-7xl">
            <FadeIn>
              <div className="mb-12 max-w-2xl md:mb-16">
                <SectionEyebrow label="Capabilities" color="var(--color-accent-primary)" />
                <h2
                  className="text-[length:var(--h-section)] font-bold leading-tight text-[var(--color-text-primary)]"
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  What We <span className="text-[var(--red-brand)]">Built</span>
                </h2>
              </div>
            </FadeIn>

            <StaggerChildren
              className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
              stagger={0.07}
            >
              {project.features.map((feature) => (
                <FeatureCard key={feature.title} feature={feature} />
              ))}
            </StaggerChildren>
          </div>
        </section>
      )}

      {/* ---- Benefits + Impact ---- */}
      {((project.benefits && project.benefits.length > 0) ||
        (project.impact && project.impact.length > 0)) && (
        <section className="section-tint seam-red px-6 py-20 md:px-12 md:py-28 lg:px-24">
          <div className="mx-auto grid max-w-7xl gap-14 md:grid-cols-2 md:gap-20">
            {project.benefits && project.benefits.length > 0 && (
              <div>
                <FadeIn>
                  <SectionEyebrow label="Why It Matters" color="var(--color-accent-primary)" />
                  <h2
                    className="mb-8 text-[length:var(--h-sub)] font-bold text-[var(--color-text-primary)]"
                    style={{ fontFamily: 'var(--font-heading)' }}
                  >
                    Benefits
                  </h2>
                </FadeIn>
                <CheckList items={project.benefits} variant="benefit" />
              </div>
            )}
            {project.impact && project.impact.length > 0 && (
              <div>
                <FadeIn>
                  <SectionEyebrow label="The Outcome" color="var(--color-accent-secondary)" />
                  <h2
                    className="mb-8 text-[length:var(--h-sub)] font-bold text-[var(--color-text-primary)]"
                    style={{ fontFamily: 'var(--font-heading)' }}
                  >
                    Impact
                  </h2>
                </FadeIn>
                <CheckList items={project.impact} variant="impact" />
              </div>
            )}
          </div>
        </section>
      )}

      {/* ---- Visual showcase band ---- */}
      {project.tagline && (
        <section className="relative isolate overflow-hidden py-28 md:py-36">
          <ProjectCoverArt
            slug={`${project.slug}-band`}
            category={project.category}
            motif={project.coverArt}
            className="absolute inset-0 -z-10"
          />
          <div className="absolute inset-0 -z-10 bg-[rgba(10,25,41,0.55)]" />
          <div className="mx-auto max-w-4xl px-6 text-center">
            <TextReveal
              as="h2"
              splitBy="words"
              className="text-[length:var(--h-section)] font-bold leading-snug text-white"
            >
              {project.tagline}
            </TextReveal>
          </div>
        </section>
      )}

      {/* ---- Testimonial ---- */}
      {project.testimonial && (
        <section className="px-6 py-20 md:px-12 md:py-28 lg:px-24">
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

      {/* ---- Prev / Next ---- */}
      <section className="border-t border-[var(--color-border)] px-6 py-16 md:px-12 lg:px-24">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 md:grid-cols-2">
          {prevProject ? (
            <ProjectNavCard project={prevProject} direction="prev" />
          ) : (
            <div className="hidden md:block" />
          )}
          {nextProject ? (
            <ProjectNavCard project={nextProject} direction="next" />
          ) : (
            <div className="hidden md:block" />
          )}
        </div>
      </section>

      {/* ---- CTA ---- */}
      <section className="border-t border-[var(--color-border)] px-6 py-24 md:px-12 lg:px-24">
        <div className="mx-auto max-w-3xl text-center">
          <FadeIn>
            <h2
              className="mb-5 text-[length:var(--h-section)] font-bold text-[var(--color-text-primary)]"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              Have a <span className="text-[var(--red-brand)]">project</span> like this in mind?
            </h2>
            <p
              className="mx-auto mb-9 max-w-xl text-[length:var(--text-base)] leading-relaxed text-[var(--color-text-secondary)]"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              We turn complex operations into clean, reliable digital platforms —
              for governments, enterprises, communities, and clinics alike.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button href="/contact" size="lg" magnetic>
                Start Your Project
              </Button>
              <Button href="/work" variant="secondary" size="lg">
                Explore More Work
              </Button>
            </div>
          </FadeIn>
        </div>
      </section>
    </main>
  );
}

// ===========================================================================
// Sub-components
// ===========================================================================

function ReadingProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    mass: 0.3,
  });
  return (
    <motion.div
      aria-hidden
      style={{ scaleX, transformOrigin: '0%' }}
      className="fixed inset-x-0 top-0 z-[70] h-[3px] bg-gradient-to-r from-[var(--color-accent-secondary)] to-[var(--color-accent-primary)]"
    />
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="inline-flex items-center rounded-[var(--radius-full)] border border-white/20 bg-white/10 px-3.5 py-1 text-[length:var(--text-xs)] font-medium uppercase tracking-wider text-white/90 backdrop-blur-sm"
      style={{ fontFamily: 'var(--font-mono)' }}
    >
      {children}
    </span>
  );
}

function FactLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="text-[length:var(--text-xs)] uppercase tracking-wider text-[var(--color-text-tertiary)]"
      style={{ fontFamily: 'var(--font-mono)' }}
    >
      {children}
    </p>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <FactLabel>{label}</FactLabel>
      <p
        className="mt-1.5 text-[length:var(--text-base)] font-medium text-[var(--color-text-primary)]"
        style={{ fontFamily: 'var(--font-heading)' }}
      >
        {value}
      </p>
    </div>
  );
}

function SectionEyebrow({ label, color }: { label: string; color: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <div ref={ref} className="mb-4 flex items-center gap-3">
      <motion.span
        className="h-px"
        style={{ backgroundColor: color }}
        initial={{ width: 0 }}
        animate={inView ? { width: 32 } : { width: 0 }}
        transition={{ duration: 0.6, ease: EASE }}
      />
      <span
        className="text-[length:var(--text-sm)] font-medium uppercase tracking-wider"
        style={{ fontFamily: 'var(--font-mono)', color }}
      >
        {label}
      </span>
    </div>
  );
}

function StoryBlock({
  index,
  eyebrow,
  heading,
  body,
  color,
}: {
  index: string;
  eyebrow: string;
  heading: string;
  body: string;
  color: string;
}) {
  return (
    <FadeIn>
      <div className="relative">
        {/* Faded oversized index */}
        <span
          aria-hidden
          className="pointer-events-none absolute -top-10 right-0 select-none font-[family-name:var(--font-display)] text-[clamp(4rem,12vw,8rem)] font-bold leading-none text-[var(--color-text-primary)] opacity-[0.04] md:-top-16"
        >
          {index}
        </span>
        <SectionEyebrow label={eyebrow} color={color} />
        <h2
          className="mb-6 text-[length:var(--h-section)] font-bold text-[var(--color-text-primary)]"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          {heading}
        </h2>
        <p
          className="max-w-3xl text-[length:var(--text-lg)] leading-relaxed text-[var(--color-text-secondary)]"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          {body}
        </p>
      </div>
    </FadeIn>
  );
}

function FeatureCard({
  feature,
}: {
  feature: NonNullable<Project['features']>[number];
}) {
  const icon = createElement(getFeatureIcon(feature.icon), {
    className: 'h-6 w-6',
    strokeWidth: 1.75,
  });
  return (
    <div className="group relative h-full overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-primary)] p-7 transition-all duration-300 hover:-translate-y-1 hover:border-[color-mix(in_srgb,var(--color-accent-primary)_45%,transparent)] hover:shadow-[0_18px_44px_-22px_rgba(13,38,76,0.4)]">
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 h-[2px] origin-left scale-x-0 bg-gradient-to-r from-[var(--color-accent-primary)] to-[var(--color-accent-secondary)] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100"
      />
      <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-[var(--radius-md)] bg-[var(--red-brand)]/10 text-[var(--red-brand)] transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110">
        {icon}
      </div>
      <h3
        className="mb-2.5 text-[length:var(--h-card)] font-semibold text-[var(--color-text-primary)]"
        style={{ fontFamily: 'var(--font-heading)' }}
      >
        {feature.title}
      </h3>
      <p
        className="text-[length:var(--text-sm)] leading-relaxed text-[var(--color-text-secondary)]"
        style={{ fontFamily: 'var(--font-body)' }}
      >
        {feature.description}
      </p>
    </div>
  );
}

function CheckList({
  items,
  variant,
}: {
  items: string[];
  variant: 'benefit' | 'impact';
}) {
  const isImpact = variant === 'impact';
  const color = isImpact
    ? 'var(--color-accent-secondary)'
    : 'var(--color-accent-primary)';
  const Icon = isImpact ? TrendingUp : Check;
  return (
    <StaggerChildren className="space-y-4" stagger={0.08}>
      {items.map((item) => (
        <div key={item} className="group flex items-start gap-3.5">
          <span
            className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-transform duration-300 group-hover:scale-110"
            style={{
              backgroundColor: `color-mix(in srgb, ${color} 14%, transparent)`,
              color,
            }}
          >
            <Icon className="h-3.5 w-3.5" strokeWidth={2.5} />
          </span>
          <span
            className="text-[length:var(--text-base)] leading-relaxed text-[var(--color-text-secondary)]"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            {item}
          </span>
        </div>
      ))}
    </StaggerChildren>
  );
}

function ProjectNavCard({
  project,
  direction,
}: {
  project: Project;
  direction: 'prev' | 'next';
}) {
  const isNext = direction === 'next';
  return (
    <Link
      href={`/work/${project.slug}`}
      className={cn(
        'focus-ring group relative flex flex-col overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] p-7 transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--color-border-hover)] hover:bg-[var(--color-surface-glass)]',
        isNext && 'items-end text-right'
      )}
    >
      <span
        className={cn(
          'mb-2 inline-flex items-center gap-2 text-[length:var(--text-xs)] uppercase tracking-wider text-[var(--color-text-tertiary)]',
          isNext && 'flex-row-reverse'
        )}
        style={{ fontFamily: 'var(--font-mono)' }}
      >
        {isNext ? (
          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
        ) : (
          <ArrowLeft className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-x-1" />
        )}
        {isNext ? 'Next Project' : 'Previous Project'}
      </span>
      <span
        className="text-[length:var(--h-card)] font-semibold text-[var(--color-text-primary)] transition-colors group-hover:text-[var(--color-accent-primary)]"
        style={{ fontFamily: 'var(--font-heading)' }}
      >
        {project.title}
      </span>
      <span
        className="mt-1 text-[length:var(--text-sm)] text-[var(--color-text-tertiary)]"
        style={{ fontFamily: 'var(--font-body)' }}
      >
        {project.category}
      </span>
    </Link>
  );
}

// ---- Animated metric with count-up for numeric values ----

function parseMetric(value: string) {
  const m = value.match(/^([^\d]*?)(\d[\d,]*\.?\d*)(.*)$/);
  if (!m) return null;
  const [, prefix, numStr, suffix] = m;
  const target = parseFloat(numStr.replace(/,/g, ''));
  if (Number.isNaN(target)) return null;
  const decimals = numStr.includes('.') ? numStr.split('.')[1].length : 0;
  return { prefix, suffix, target, decimals };
}

function formatNum(v: number, decimals: number) {
  const fixed = decimals > 0 ? v.toFixed(decimals) : Math.round(v).toString();
  const [intPart, decPart] = fixed.split('.');
  const grouped = Number(intPart).toLocaleString('en-US');
  return decPart ? `${grouped}.${decPart}` : grouped;
}

function MetricStat({ value, label }: ProjectMetric) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const numRef = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const parsed = useMemo(() => parseMetric(value), [value]);

  useEffect(() => {
    if (!parsed || !inView || !numRef.current) return;
    const el = numRef.current;
    const render = (v: number) => {
      el.textContent = `${parsed.prefix}${formatNum(v, parsed.decimals)}${parsed.suffix}`;
    };
    if (reduce) {
      render(parsed.target);
      return;
    }
    const controls = animate(0, parsed.target, {
      duration: 1.4,
      ease: EASE,
      onUpdate: render,
    });
    return () => controls.stop();
  }, [parsed, inView, reduce]);

  return (
    <div ref={ref} className="text-center md:text-left">
      <div
        className="font-[family-name:var(--font-display)] text-[clamp(1.9rem,4vw,3rem)] font-bold leading-none tracking-tight text-[var(--color-accent-primary)]"
      >
        {parsed ? (
          <span ref={numRef}>
            {parsed.prefix}
            {formatNum(reduce ? parsed.target : 0, parsed.decimals)}
            {parsed.suffix}
          </span>
        ) : (
          <span>{value}</span>
        )}
      </div>
      <div
        className="mt-2.5 text-[length:var(--text-sm)] leading-snug text-[var(--color-text-secondary)]"
        style={{ fontFamily: 'var(--font-body)' }}
      >
        {label}
      </div>
    </div>
  );
}
