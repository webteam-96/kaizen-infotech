'use client';

import Link from 'next/link';
import { TextReveal } from '@/components/animation/TextReveal';
import { FadeIn } from '@/components/animation/FadeIn';
import { BlogCover } from '@/components/ui/BlogCover';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import type { ManagedBlog } from '@/types';

interface Props {
  post: ManagedBlog;
  relatedPosts: ManagedBlog[];
}

export function BlogPostDetail({ post, relatedPosts }: Props) {
  return (
    <main className="min-h-screen bg-[var(--color-bg-primary)]">
      {/* Hero */}
      <section className="px-6 pb-12 pt-32 md:px-12 lg:px-24">
        <div className="mx-auto max-w-3xl">
          <FadeIn delay={0.1}>
            <Link
              href="/blog"
              className="mb-8 inline-flex items-center gap-2 text-[length:var(--text-sm)] text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-accent-primary)]"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="rotate-180">
                <path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Back to Blog
            </Link>
          </FadeIn>

          <FadeIn delay={0.15}>
            <div className="mb-6 flex flex-wrap items-center gap-3">
              <Badge variant="accent">{post.category}</Badge>
              <span className="text-[length:var(--text-sm)] text-[var(--color-text-tertiary)]" style={{ fontFamily: 'var(--font-mono)' }}>
                {post.readingTime}
              </span>
              <span className="text-[length:var(--text-sm)] text-[var(--color-text-tertiary)]" style={{ fontFamily: 'var(--font-mono)' }}>
                {post.publishedAt}
              </span>
            </div>
          </FadeIn>

          <TextReveal
            as="h1"
            splitBy="words"
            className="mb-8 text-[length:var(--h-page)] font-bold leading-[1.15] text-[var(--color-text-primary)]"
          >
            {post.title}
          </TextReveal>

          <FadeIn delay={0.3}>
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-[var(--color-bg-secondary)]" aria-hidden />
              <div>
                <p className="text-[length:var(--text-base)] font-medium text-[var(--color-text-primary)]" style={{ fontFamily: 'var(--font-heading)' }}>
                  {post.authorName}
                </p>
                <p className="text-[length:var(--text-sm)] text-[var(--color-text-secondary)]" style={{ fontFamily: 'var(--font-body)' }}>
                  {post.authorRole}
                </p>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Cover banner */}
      <section className="px-6 pb-12 md:px-12 lg:px-24">
        <div className="mx-auto max-w-3xl">
          <FadeIn delay={0.35}>
            <div className="relative aspect-[21/9] overflow-hidden rounded-[var(--radius-lg)]">
              {post.mainImage?.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={post.mainImage.url}
                  alt={post.mainImage.alt || post.title}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                <BlogCover slug={post.slug} category={post.category} className="absolute inset-0" />
              )}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Article Content (sanitised HTML from the admin editor) */}
      <section className="px-6 pb-12 md:px-12 lg:px-24">
        <div className="mx-auto max-w-3xl">
          <FadeIn delay={0.4}>
            <article
              className="prose-custom"
              style={{ fontFamily: 'var(--font-body)' }}
              dangerouslySetInnerHTML={{ __html: post.bodyHtml }}
            />
          </FadeIn>

          {/* Tags */}
          {post.tags.length > 0 && (
            <FadeIn delay={0.2}>
              <div className="mt-12 flex flex-wrap gap-2 border-t border-[var(--color-border)] pt-8">
                {post.tags.map((tag) => (
                  <Badge key={tag} variant="outline">{tag}</Badge>
                ))}
              </div>
            </FadeIn>
          )}
        </div>
      </section>

      {/* Gallery */}
      {post.gallery.length > 0 && (
        <section className="px-6 pb-20 md:px-12 lg:px-24">
          <div className="mx-auto max-w-4xl">
            <FadeIn>
              <h2 className="mb-6 text-[length:var(--h-card)] font-bold text-[var(--color-text-primary)]" style={{ fontFamily: 'var(--font-heading)' }}>
                Gallery
              </h2>
            </FadeIn>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {post.gallery.map((img, i) => (
                <FadeIn key={i}>
                  <figure className="overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)]">
                    <div className="relative aspect-[4/3]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img.url} alt={img.alt || `Gallery image ${i + 1}`} className="absolute inset-0 h-full w-full object-cover" />
                    </div>
                    {img.caption && (
                      <figcaption className="px-3 py-2 text-[length:var(--text-sm)] text-[var(--color-text-tertiary)]">
                        {img.caption}
                      </figcaption>
                    )}
                  </figure>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Author Bio */}
      <section className="border-t border-[var(--color-border)] px-6 py-16 md:px-12 lg:px-24">
        <div className="mx-auto max-w-3xl">
          <FadeIn>
            <Card tilt={false} glow className="p-8 md:p-10">
              <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-start">
                <div className="h-16 w-16 shrink-0 rounded-full bg-[var(--color-bg-secondary)]" aria-hidden />
                <div>
                  <p className="mb-1 text-[length:var(--text-xs)] uppercase tracking-wider text-[var(--color-text-tertiary)]" style={{ fontFamily: 'var(--font-mono)' }}>
                    Written by
                  </p>
                  <h3 className="mb-1 text-[length:var(--h-card)] font-bold text-[var(--color-text-primary)]" style={{ fontFamily: 'var(--font-heading)' }}>
                    {post.authorName}
                  </h3>
                  <p className="mb-4 text-[length:var(--text-sm)] font-medium text-[var(--color-accent-primary)]" style={{ fontFamily: 'var(--font-heading)' }}>
                    {post.authorRole}
                  </p>
                  <p className="text-[length:var(--text-sm)] leading-relaxed text-[var(--color-text-secondary)]" style={{ fontFamily: 'var(--font-body)' }}>
                    {post.authorBio}
                  </p>
                </div>
              </div>
            </Card>
          </FadeIn>
        </div>
      </section>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="border-t border-[var(--color-border)] px-6 py-24 md:px-12 lg:px-24">
          <div className="mx-auto max-w-7xl">
            <FadeIn>
              <h2 className="mb-12 text-[length:var(--h-section)] font-bold text-[var(--color-text-primary)]" style={{ fontFamily: 'var(--font-heading)' }}>
                Related Articles
              </h2>
            </FadeIn>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              {relatedPosts.map((related) => (
                <FadeIn key={related.slug}>
                  <Link href={`/blog/${related.slug}`} className="group block">
                    <Card tilt={false} glow className="h-full overflow-hidden p-0">
                      <div className="relative aspect-[16/10]">
                        {related.mainImage?.url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={related.mainImage.url} alt={related.mainImage.alt || related.title} className="absolute inset-0 h-full w-full object-cover" />
                        ) : (
                          <BlogCover slug={related.slug} category={related.category} className="absolute inset-0" />
                        )}
                      </div>
                      <div className="relative z-10 p-6">
                        <div className="mb-3 flex items-center gap-3">
                          <Badge variant="accent">{related.category}</Badge>
                          <span className="text-[length:var(--text-xs)] text-[var(--color-text-tertiary)]" style={{ fontFamily: 'var(--font-mono)' }}>
                            {related.readingTime}
                          </span>
                        </div>
                        <h3 className="mb-3 text-[length:var(--h-card)] font-bold text-[var(--color-text-primary)] transition-colors group-hover:text-[var(--color-accent-primary)]" style={{ fontFamily: 'var(--font-heading)' }}>
                          {related.title}
                        </h3>
                        <p className="line-clamp-2 text-[length:var(--text-sm)] leading-relaxed text-[var(--color-text-secondary)]" style={{ fontFamily: 'var(--font-body)' }}>
                          {related.excerpt}
                        </p>
                      </div>
                    </Card>
                  </Link>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="border-t border-[var(--color-border)] px-6 py-24 md:px-12 lg:px-24">
        <div className="mx-auto max-w-7xl text-center">
          <FadeIn>
            <h2 className="mb-6 text-[length:var(--h-section)] font-bold text-[var(--color-text-primary)]" style={{ fontFamily: 'var(--font-heading)' }}>
              Want to Work With Us?
            </h2>
            <p className="mx-auto mb-10 max-w-xl text-[length:var(--h-sub)] text-[var(--color-text-secondary)]" style={{ fontFamily: 'var(--font-body)' }}>
              We help ambitious companies build exceptional digital products.
            </p>
            <Button href="/contact" size="lg">Get in Touch</Button>
          </FadeIn>
        </div>
      </section>
    </main>
  );
}
