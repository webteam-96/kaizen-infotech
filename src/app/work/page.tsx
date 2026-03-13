'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TextReveal } from '@/components/animation/TextReveal';
import { ScrollFadeIn } from '@/components/animation/ScrollFadeIn';
import { StickyProjectCard } from '@/components/ui/StickyProjectCard';
import { Button } from '@/components/ui/Button';
import { projects, projectCategories, type ProjectCategory } from '@/content/projects';

export default function WorkPage() {
  const [activeCategory, setActiveCategory] = useState<ProjectCategory>('All');

  const filteredProjects =
    activeCategory === 'All'
      ? projects
      : projects.filter((p) => p.category === activeCategory);

  return (
    <main className="min-h-screen bg-[var(--color-bg-primary)]">
      {/* ── Hero ── */}
      <section className="px-6 pb-12 pt-32 md:px-12 lg:px-24">
        <div className="mx-auto max-w-7xl">
          <TextReveal
            as="h1"
            splitBy="words"
            className="mb-6 text-[clamp(2.5rem,6vw,5rem)] font-bold leading-[1.05] text-[var(--color-text-primary)]"
          >
            Real-World Digital Solutions Built for Impact
          </TextReveal>
          <ScrollFadeIn delay={0.3}>
            <p
              className="max-w-2xl text-[length:var(--text-lg)] leading-relaxed text-[var(--color-text-secondary)]"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              Explore our portfolio of digital platforms built for government,
              enterprise, healthcare, and global communities.
            </p>
          </ScrollFadeIn>
        </div>
      </section>

      {/* ── Category Filter ── */}
      <section className="px-6 pb-10 md:px-12 lg:px-24">
        <div className="mx-auto max-w-7xl">
          <ScrollFadeIn delay={0.4}>
            <div className="flex flex-wrap gap-3">
              {projectCategories.map((category) => (
                <motion.button
                  key={category}
                  type="button"
                  onClick={() => setActiveCategory(category)}
                  className={`relative cursor-pointer rounded-[var(--radius-full)] px-5 py-2.5 text-[length:var(--text-sm)] font-medium transition-colors duration-300 ${
                    activeCategory === category
                      ? 'text-[var(--color-text-inverse)]'
                      : 'border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-border-hover)] hover:text-[var(--color-text-primary)]'
                  }`}
                  style={{ fontFamily: 'var(--font-heading)' }}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                >
                  {activeCategory === category && (
                    <motion.div
                      className="absolute inset-0 rounded-[var(--radius-full)] bg-[var(--color-accent-primary)]"
                      layoutId="activeCategory"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{category}</span>
                </motion.button>
              ))}
            </div>
          </ScrollFadeIn>
        </div>
      </section>

      {/* ── Sticky Scroll Project Stack ── */}
      {/*
        Each card uses `position: sticky` and a scroll-driven scale + tilt effect
        (adapted from Skiper UI StickyCard_003). Cards shrink + tilt away as you
        scroll past them, revealing the next card beneath.
      */}
      <AnimatePresence mode="wait">
        <motion.section
          key={activeCategory}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center gap-[8vh] px-4 pb-[30vh] pt-[4vh] md:px-8"
        >
          {filteredProjects.map((project, idx) => (
            <StickyProjectCard
              key={`${activeCategory}-${project.slug}`}
              title={project.title}
              client={project.client}
              category={project.category}
              year={project.year}
              image={project.image}
              slug={project.slug}
              index={idx}
            />
          ))}
        </motion.section>
      </AnimatePresence>

      {/* ── CTA Section ── */}
      <section className="border-t border-[var(--color-border)] px-6 py-24 md:px-12 lg:px-24">
        <div className="mx-auto max-w-7xl text-center">
          <ScrollFadeIn>
            <h2
              className="mb-6 text-[clamp(2rem,4vw,3.5rem)] font-bold text-[var(--color-text-primary)]"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              Let&apos;s Build the Next Success Story
            </h2>
            <p
              className="mx-auto mb-10 max-w-xl text-[length:var(--text-lg)] text-[var(--color-text-secondary)]"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              Looking to build a similar digital solution for your organization?
              Our team is ready to help.
            </p>
            <Button href="/contact" size="lg">
              Talk to Our Experts
            </Button>
          </ScrollFadeIn>
        </div>
      </section>
    </main>
  );
}
