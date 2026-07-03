'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { FadeIn } from '@/components/animation/FadeIn';
import { PageHero } from '@/components/sections/PageHero';
import { HexGridBackground } from '@/components/shared/HexGridBackground';
import { BlogImage } from '@/components/ui/BlogImage';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { blogCategories } from '@/content/blog';
import { usePublicBlogs } from '@/lib/blog/usePublicBlogs';import { CtaGlowBackdrop } from '@/components/shared/CtaGlowBackdrop';

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle');

  // Published posts from public/data/blogs.json (admin-managed), seed fallback.
  const { blogs } = usePublicBlogs();
  const filteredPosts =
    activeCategory === 'All'
      ? blogs
      : blogs.filter((p) => p.category === activeCategory);

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
    <main className="relative isolate min-h-screen bg-[var(--color-bg-primary)]">      {/* Hero Section */}
      <PageHero
        align="center"
        backdrop={<HexGridBackground />}
        kicker="Insights & Perspectives"
        title="Technology, Business & Digital Transformation"
        accentWords={['Digital', 'Transformation']}
        description="Practical thinking on enterprise software, government digital transformation, mobile development, event technology, and digital marketing — written by the team that builds it."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Blog' }]}
      />

      {/* Category Filter */}
      <section className="section-tint seam-blue relative px-6 py-12 md:px-12 lg:px-24">
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
      <section className="section-light-aura seam-red relative px-6 py-24 md:px-12 lg:px-24">
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
                  <Card tilt={false} glow className="card-red-accent relative overflow-hidden p-0">
                    <div className="grid grid-cols-1 md:grid-cols-2">
                      {/* Cover — uploaded main image, else generated cover art */}
                      <div className="relative aspect-[16/10] md:aspect-auto">
                        <BlogImage
                          url={featuredPost.mainImage?.url}
                          alt={featuredPost.mainImage?.alt || featuredPost.title}
                          slug={featuredPost.slug}
                          category={featuredPost.category}
                          imgClassName="absolute inset-0 h-full w-full object-cover"
                        />
                      </div>

                      <div className="relative z-10 flex flex-col justify-center p-8 md:p-12">
                        <div className="mb-4 flex items-center gap-3">
                          <Badge variant="accent">
                            {featuredPost.category}
                          </Badge>
                          <span
                            className="text-[length:var(--text-xs)] font-medium text-[var(--red-brand)]"
                            style={{ fontFamily: 'var(--font-mono)' }}
                          >
                            {featuredPost.readingTime}
                          </span>
                        </div>

                        <h2
                          className="mb-4 text-[length:var(--h-section)] font-bold text-[var(--color-text-primary)] transition-colors group-hover:text-[var(--red-brand)]"
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
                              {featuredPost.authorName}
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
                    <Card tilt={false} glow className="card-red-accent relative h-full overflow-hidden p-0">
                      {/* Cover — image shown in full (contained) on a light-blue
                          backdrop, with a fixed height so portrait images stay
                          small and never bleed over the text. */}
                      <div className="relative flex h-52 items-center justify-center overflow-hidden bg-[var(--color-bg-tertiary)] p-2">
                        <BlogImage
                          url={post.mainImage?.url}
                          alt={post.mainImage?.alt || post.title}
                          slug={post.slug}
                          category={post.category}
                          imgClassName="max-h-full max-w-full object-contain"
                        />
                      </div>

                      <div className="relative z-10 bg-[var(--color-bg-tertiary)] p-6">
                        <div className="mb-3 flex items-center gap-3">
                          <Badge variant="accent">{post.category}</Badge>
                          <span
                            className="text-[length:var(--text-xs)] font-medium text-[var(--red-brand)]"
                            style={{ fontFamily: 'var(--font-mono)' }}
                          >
                            {post.readingTime}
                          </span>
                        </div>

                        <h3
                          className="mb-3 text-[length:var(--h-card)] font-bold text-[var(--color-text-primary)] transition-colors group-hover:text-[var(--red-brand)]"
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
                            {post.authorName} &middot; {post.publishedAt}
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
      <section className="section-ink cta-glow-host seam-red relative isolate px-6 py-24 md:px-12 lg:px-24">
        <CtaGlowBackdrop />
        <div className="mx-auto max-w-2xl text-center">
          <FadeIn>
            <h2
              className="mb-4 text-[length:var(--h-section)] font-extrabold text-[var(--text-on-ink)]"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              Stay in the <span className="text-[var(--accent-on-ink)]">Loop</span>
            </h2>
            <p
              className="mx-auto mb-10 max-w-lg text-[length:var(--text-lg)] text-[var(--text-on-ink-muted)]"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              Get practical technology insights from the Kaizen team delivered
              to your inbox. No spam — unsubscribe anytime.
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
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-4"
                >
                  <p
                    className="text-[length:var(--text-sm)] text-[var(--color-accent-secondary)]"
                    style={{ fontFamily: 'var(--font-body)' }}
                  >
                    Thank you! You will receive our next article in your inbox.
                  </p>
                  <button
                    type="button"
                    onClick={() => setNewsletterStatus('idle')}
                    className="focus-ring mt-2 text-[length:var(--text-xs)] text-[var(--text-on-ink-muted)] underline underline-offset-2 transition-colors hover:text-[var(--text-on-ink)]"
                    style={{ fontFamily: 'var(--font-body)' }}
                  >
                    Subscribe another email
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </FadeIn>
        </div>
      </section>
    </main>
  );
}
