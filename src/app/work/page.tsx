'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TextReveal } from '@/components/animation/TextReveal';
import { ScrollFadeIn } from '@/components/animation/ScrollFadeIn';
import { useStaggeredScrollReveal } from '@/hooks/useStaggeredScrollReveal';
import { ProjectCard } from '@/components/ui/ProjectCard';
import { Button } from '@/components/ui/Button';
import { projects, projectCategories, type ProjectCategory } from '@/content/projects';

export default function WorkPage() {
  const [activeCategory, setActiveCategory] = useState<ProjectCategory>('All');
  const projectGridRef = useRef<HTMLDivElement>(null);

  const filteredProjects =
    activeCategory === 'All'
      ? projects
      : projects.filter((p) => p.category === activeCategory);

  const featuredProject = filteredProjects.find((p) => p.featured);
  const otherProjects = filteredProjects.filter((p) => !p.featured);

  useStaggeredScrollReveal(projectGridRef, {
    from: { opacity: 0, clipPath: 'inset(8% 8% 8% 8%)' },
    to: { opacity: 1, clipPath: 'inset(0% 0% 0% 0%)' },
    stagger: 0.12,
  });

  // Re-trigger GSAP when category changes by resetting children visibility
  useEffect(() => {
    if (!projectGridRef.current) return;
    const children = projectGridRef.current.querySelectorAll(':scope > *');
    children.forEach((child) => {
      (child as HTMLElement).style.opacity = '';
      (child as HTMLElement).style.clipPath = '';
    });
  }, [activeCategory]);

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
            Real-World Digital Solutions Built for Impact
          </TextReveal>
          <ScrollFadeIn delay={0.3}>
            <p
              className="max-w-2xl text-[length:var(--text-xl)] leading-relaxed text-[var(--color-text-secondary)]"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              Explore our portfolio of digital platforms built for government,
              enterprise, healthcare, and global communities.
            </p>
          </ScrollFadeIn>
        </div>
      </section>

      {/* Category Filter */}
      <section className="px-6 pb-12 md:px-12 lg:px-24">
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

      {/* Project Grid */}
      <section className="px-6 pb-24 md:px-12 lg:px-24">
        <div className="mx-auto max-w-7xl">
          <AnimatePresence mode="popLayout">
            <motion.div
              key={activeCategory}
              className="grid grid-cols-1 gap-6 md:grid-cols-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <div
                ref={projectGridRef}
                className="col-span-1 grid grid-cols-1 gap-6 md:col-span-2 md:grid-cols-2"
              >
                {/* Featured project — full width */}
                {featuredProject && (
                  <div className="col-span-1 md:col-span-2">
                    <ProjectCard
                      title={featuredProject.title}
                      client={featuredProject.client}
                      category={featuredProject.category}
                      year={featuredProject.year}
                      image={featuredProject.image}
                      slug={featuredProject.slug}
                      featured
                    />
                  </div>
                )}

                {/* Other projects — 2-column grid */}
                {otherProjects.map((project) => (
                  <div key={project.slug}>
                    <ProjectCard
                      title={project.title}
                      client={project.client}
                      category={project.category}
                      year={project.year}
                      image={project.image}
                      slug={project.slug}
                    />
                  </div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-[var(--color-border)] px-6 py-24 md:px-12 lg:px-24">
        <div className="mx-auto max-w-7xl text-center">
          <ScrollFadeIn>
            <h2
              className="mb-6 text-[length:var(--text-4xl)] font-bold text-[var(--color-text-primary)] md:text-[length:var(--text-5xl)]"
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
