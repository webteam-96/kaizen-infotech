'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { TextReveal } from '@/components/animation/TextReveal';
import { FadeIn } from '@/components/animation/FadeIn';

import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { blogPosts, blogCategories } from '@/content/blog';

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle');

  const filteredPosts =
    activeCategory === 'All'
      ? blogPosts
      : blogPosts.filter((p) => p.category === activeCategory);

  const featuredPost = filteredPosts[0];
  const otherPosts = filteredPosts.slice(1);

  const handleNewsletterSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setNewsletterStatus('loading');
      try {
        const res = await fetch('/api/newsletter', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: newsletterEmail }),
        });
        if (res.ok) {
          setNewsletterStatus('success');
          setNewsletterEmail('');
        } else {
          setNewsletterStatus('error');
        }
      } catch {
        setNewsletterStatus('error');
      }
    },
    [newsletterEmail]
  );

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
            Insights &amp; Perspectives
          </TextReveal>
          <FadeIn delay={0.3}>
            <p
              className="max-w-2xl text-[length:var(--text-xl)] leading-relaxed text-[var(--color-text-secondary)]"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              Thoughts on engineering, design, AI, and building software that
              matters.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Category Filter */}
      <section className="px-6 pb-12 md:px-12 lg:px-24">
        <div className="mx-auto max-w-7xl">
          <FadeIn delay={0.4}>
            <div className="flex flex-wrap gap-3">
              {blogCategories.map((category) => (
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
                      layoutId="activeBlogCategory"
                      transition={{
                        type: 'spring',
                        stiffness: 400,
                        damping: 30,
                      }}
                    />
                  )}
                  <span className="relative z-10">{category}</span>
                </motion.button>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Featured Post + Grid */}
      <section className="px-6 pb-24 md:px-12 lg:px-24">
        <div className="mx-auto max-w-7xl">
          <AnimatePresence mode="popLayout">
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              {/* Featured Post — Large Card */}
              {featuredPost && (
                <Link
                  href={`/blog/${featuredPost.slug}`}
                  className="group mb-12 block"
                >
                  <Card tilt={false} glow className="overflow-hidden p-0">
                    <div className="grid grid-cols-1 md:grid-cols-2">
                      {/* Image placeholder */}
                      <div
                        className="aspect-[16/10] md:aspect-auto"
                        style={{
                          background:
                            'linear-gradient(135deg, var(--color-bg-secondary), var(--color-accent-primary)/10)',
                        }}
                      />

                      <div className="relative z-10 flex flex-col justify-center p-8 md:p-12">
                        <div className="mb-4 flex items-center gap-3">
                          <Badge variant="accent">
                            {featuredPost.category}
                          </Badge>
                          <span
                            className="text-[length:var(--text-xs)] text-[var(--color-text-tertiary)]"
                            style={{ fontFamily: 'var(--font-mono)' }}
                          >
                            {featuredPost.readingTime}
                          </span>
                        </div>

                        <h2
                          className="mb-4 text-[length:var(--text-2xl)] font-bold text-[var(--color-text-primary)] transition-colors group-hover:text-[var(--color-accent-primary)] md:text-[length:var(--text-3xl)]"
                          style={{ fontFamily: 'var(--font-heading)' }}
                        >
                          {featuredPost.title}
                        </h2>

                        <p
                          className="mb-6 line-clamp-3 text-[length:var(--text-base)] leading-relaxed text-[var(--color-text-secondary)]"
                          style={{ fontFamily: 'var(--font-body)' }}
                        >
                          {featuredPost.excerpt}
                        </p>

                        <div className="flex items-center gap-3">
                          <div
                            className="h-8 w-8 rounded-full bg-[var(--color-bg-secondary)]"
                            aria-hidden
                          />
                          <div>
                            <p
                              className="text-[length:var(--text-sm)] font-medium text-[var(--color-text-primary)]"
                              style={{ fontFamily: 'var(--font-heading)' }}
                            >
                              {featuredPost.author.name}
                            </p>
                            <p
                              className="text-[length:var(--text-xs)] text-[var(--color-text-tertiary)]"
                              style={{ fontFamily: 'var(--font-body)' }}
                            >
                              {featuredPost.publishedAt}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              )}

              {/* Post Grid */}
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                {otherPosts.map((post) => (
                  <Link
                    key={post.slug}
                    href={`/blog/${post.slug}`}
                    className="group"
                  >
                    <Card tilt={false} glow className="h-full overflow-hidden p-0">
                      {/* Image placeholder */}
                      <div
                        className="aspect-[16/10]"
                        style={{
                          background:
                            'linear-gradient(135deg, var(--color-bg-secondary), var(--color-accent-primary)/8)',
                        }}
                      />

                      <div className="relative z-10 p-6">
                        <div className="mb-3 flex items-center gap-3">
                          <Badge variant="accent">{post.category}</Badge>
                          <span
                            className="text-[length:var(--text-xs)] text-[var(--color-text-tertiary)]"
                            style={{ fontFamily: 'var(--font-mono)' }}
                          >
                            {post.readingTime}
                          </span>
                        </div>

                        <h3
                          className="mb-3 text-[length:var(--text-lg)] font-bold text-[var(--color-text-primary)] transition-colors group-hover:text-[var(--color-accent-primary)]"
                          style={{ fontFamily: 'var(--font-heading)' }}
                        >
                          {post.title}
                        </h3>

                        <p
                          className="mb-4 line-clamp-2 text-[length:var(--text-sm)] leading-relaxed text-[var(--color-text-secondary)]"
                          style={{ fontFamily: 'var(--font-body)' }}
                        >
                          {post.excerpt}
                        </p>

                        <div className="flex items-center gap-2">
                          <div
                            className="h-6 w-6 rounded-full bg-[var(--color-bg-secondary)]"
                            aria-hidden
                          />
                          <p
                            className="text-[length:var(--text-xs)] text-[var(--color-text-tertiary)]"
                            style={{ fontFamily: 'var(--font-body)' }}
                          >
                            {post.author.name} &middot; {post.publishedAt}
                          </p>
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="border-t border-[var(--color-border)] px-6 py-24 md:px-12 lg:px-24">
        <div className="mx-auto max-w-2xl text-center">
          <FadeIn>
            <h2
              className="mb-4 text-[length:var(--text-4xl)] font-bold text-[var(--color-text-primary)]"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              Stay in the Loop
            </h2>
            <p
              className="mx-auto mb-10 max-w-lg text-[length:var(--text-lg)] text-[var(--color-text-secondary)]"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              Get our latest insights on engineering, design, and technology
              delivered to your inbox. No spam, unsubscribe anytime.
            </p>
            <form
              onSubmit={handleNewsletterSubmit}
              className="mx-auto flex max-w-md flex-col items-center gap-4 sm:flex-row"
            >
              <div className="w-full flex-1">
                <Input
                  label="Email address"
                  type="email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  required
                />
              </div>
              <Button
                type="submit"
                size="md"
                isLoading={newsletterStatus === 'loading'}
              >
                Subscribe
              </Button>
            </form>
            <AnimatePresence>
              {newsletterStatus === 'success' && (
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-4 text-[length:var(--text-sm)] text-[var(--color-accent-secondary)]"
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  You&apos;re subscribed! Check your inbox for a welcome email.
                </motion.p>
              )}
            </AnimatePresence>
          </FadeIn>
        </div>
      </section>
    </main>
  );
}
