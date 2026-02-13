'use client';

import Link from 'next/link';
import { TextReveal } from '@/components/animation/TextReveal';
import { FadeIn } from '@/components/animation/FadeIn';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import type { BlogPost } from '@/types';

interface BlogPostClientProps {
  post: BlogPost;
  relatedPosts: BlogPost[];
}

export default function BlogPostClient({
  post,
  relatedPosts,
}: BlogPostClientProps) {
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
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                className="rotate-180"
              >
                <path
                  d="M6 3L11 8L6 13"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Back to Blog
            </Link>
          </FadeIn>

          <FadeIn delay={0.15}>
            <div className="mb-6 flex flex-wrap items-center gap-3">
              <Badge variant="accent">{post.category}</Badge>
              <span
                className="text-[length:var(--text-sm)] text-[var(--color-text-tertiary)]"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                {post.readingTime}
              </span>
              <span
                className="text-[length:var(--text-sm)] text-[var(--color-text-tertiary)]"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                {post.publishedAt}
              </span>
            </div>
          </FadeIn>

          <TextReveal
            as="h1"
            splitBy="words"
            className="mb-8 text-[length:var(--text-4xl)] font-bold leading-[1.15] text-[var(--color-text-primary)] md:text-[length:var(--text-5xl)]"
          >
            {post.title}
          </TextReveal>

          <FadeIn delay={0.3}>
            <div className="flex items-center gap-4">
              <div
                className="h-12 w-12 rounded-full bg-[var(--color-bg-secondary)]"
                aria-hidden
              />
              <div>
                <p
                  className="text-[length:var(--text-base)] font-medium text-[var(--color-text-primary)]"
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  {post.author.name}
                </p>
                <p
                  className="text-[length:var(--text-sm)] text-[var(--color-text-secondary)]"
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  {post.author.role}
                </p>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Article Content */}
      <section className="px-6 pb-24 md:px-12 lg:px-24">
        <div className="mx-auto max-w-3xl">
          <FadeIn delay={0.4}>
            <article
              className="prose-custom"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              {post.content.split('\n\n').map((block, i) => {
                // Headings
                if (block.startsWith('### ')) {
                  return (
                    <h3
                      key={i}
                      className="mb-4 mt-10 text-[length:var(--text-lg)] font-bold text-[var(--color-text-primary)]"
                      style={{ fontFamily: 'var(--font-heading)' }}
                    >
                      {block.replace('### ', '')}
                    </h3>
                  );
                }
                if (block.startsWith('## ')) {
                  return (
                    <h2
                      key={i}
                      className="mb-4 mt-12 text-[length:var(--text-2xl)] font-bold text-[var(--color-text-primary)]"
                      style={{ fontFamily: 'var(--font-heading)' }}
                    >
                      {block.replace('## ', '')}
                    </h2>
                  );
                }

                // Bold-prefixed lines (like **Item:** description)
                if (block.startsWith('**')) {
                  const html = block
                    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-[var(--color-text-primary)]">$1</strong>')
                    .replace(/\*(.*?)\*/g, '<em>$1</em>')
                    .replace(/`(.*?)`/g, '<code class="rounded bg-[var(--color-bg-tertiary)] px-1.5 py-0.5 text-[length:var(--text-sm)] text-[var(--color-accent-primary)]">$1</code>');
                  return (
                    <p
                      key={i}
                      className="mb-4 text-[length:var(--text-base)] leading-relaxed text-[var(--color-text-secondary)]"
                      dangerouslySetInnerHTML={{ __html: html }}
                    />
                  );
                }

                // List items (numbered or bulleted)
                if (block.match(/^(\d+\.|-)/) || block.includes('\n1.') || block.includes('\n-')) {
                  const items = block.split('\n').filter(Boolean);
                  const isOrdered = items[0]?.match(/^\d+\./);
                  const ListTag = isOrdered ? 'ol' : 'ul';
                  return (
                    <ListTag
                      key={i}
                      className={`mb-6 space-y-2 pl-6 ${isOrdered ? 'list-decimal' : 'list-disc'}`}
                    >
                      {items.map((item, j) => {
                        const text = item.replace(/^(\d+\.\s?|-\s?)/, '');
                        const html = text
                          .replace(/\*\*(.*?)\*\*/g, '<strong class="text-[var(--color-text-primary)]">$1</strong>')
                          .replace(/`(.*?)`/g, '<code class="rounded bg-[var(--color-bg-tertiary)] px-1.5 py-0.5 text-[length:var(--text-sm)] text-[var(--color-accent-primary)]">$1</code>');
                        return (
                          <li
                            key={j}
                            className="text-[length:var(--text-base)] leading-relaxed text-[var(--color-text-secondary)]"
                            dangerouslySetInnerHTML={{ __html: html }}
                          />
                        );
                      })}
                    </ListTag>
                  );
                }

                // Regular paragraph
                const html = block
                  .replace(/\*\*(.*?)\*\*/g, '<strong class="text-[var(--color-text-primary)]">$1</strong>')
                  .replace(/\*(.*?)\*/g, '<em>$1</em>')
                  .replace(/`(.*?)`/g, '<code class="rounded bg-[var(--color-bg-tertiary)] px-1.5 py-0.5 text-[length:var(--text-sm)] text-[var(--color-accent-primary)]">$1</code>');
                return (
                  <p
                    key={i}
                    className="mb-6 text-[length:var(--text-base)] leading-[1.8] text-[var(--color-text-secondary)]"
                    dangerouslySetInnerHTML={{ __html: html }}
                  />
                );
              })}
            </article>
          </FadeIn>

          {/* Tags */}
          <FadeIn delay={0.2}>
            <div className="mt-12 flex flex-wrap gap-2 border-t border-[var(--color-border)] pt-8">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Author Bio */}
      <section className="border-t border-[var(--color-border)] px-6 py-16 md:px-12 lg:px-24">
        <div className="mx-auto max-w-3xl">
          <FadeIn>
            <Card tilt={false} glow className="p-8 md:p-10">
              <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-start">
                <div
                  className="h-16 w-16 shrink-0 rounded-full bg-[var(--color-bg-secondary)]"
                  aria-hidden
                />
                <div>
                  <p
                    className="mb-1 text-[length:var(--text-xs)] uppercase tracking-wider text-[var(--color-text-tertiary)]"
                    style={{ fontFamily: 'var(--font-mono)' }}
                  >
                    Written by
                  </p>
                  <h3
                    className="mb-1 text-[length:var(--text-xl)] font-bold text-[var(--color-text-primary)]"
                    style={{ fontFamily: 'var(--font-heading)' }}
                  >
                    {post.author.name}
                  </h3>
                  <p
                    className="mb-4 text-[length:var(--text-sm)] font-medium text-[var(--color-accent-primary)]"
                    style={{ fontFamily: 'var(--font-heading)' }}
                  >
                    {post.author.role}
                  </p>
                  <p
                    className="text-[length:var(--text-sm)] leading-relaxed text-[var(--color-text-secondary)]"
                    style={{ fontFamily: 'var(--font-body)' }}
                  >
                    {post.author.bio}
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
              <h2
                className="mb-12 text-[length:var(--text-3xl)] font-bold text-[var(--color-text-primary)]"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                Related Articles
              </h2>
            </FadeIn>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              {relatedPosts.map((related) => (
                <FadeIn key={related.slug}>
                  <Link href={`/blog/${related.slug}`} className="group block">
                    <Card tilt={false} glow className="h-full overflow-hidden p-0">
                      <div
                        className="aspect-[16/10]"
                        style={{
                          background:
                            'linear-gradient(135deg, var(--color-bg-secondary), var(--color-accent-primary)/8)',
                        }}
                      />
                      <div className="relative z-10 p-6">
                        <div className="mb-3 flex items-center gap-3">
                          <Badge variant="accent">{related.category}</Badge>
                          <span
                            className="text-[length:var(--text-xs)] text-[var(--color-text-tertiary)]"
                            style={{ fontFamily: 'var(--font-mono)' }}
                          >
                            {related.readingTime}
                          </span>
                        </div>
                        <h3
                          className="mb-3 text-[length:var(--text-lg)] font-bold text-[var(--color-text-primary)] transition-colors group-hover:text-[var(--color-accent-primary)]"
                          style={{ fontFamily: 'var(--font-heading)' }}
                        >
                          {related.title}
                        </h3>
                        <p
                          className="line-clamp-2 text-[length:var(--text-sm)] leading-relaxed text-[var(--color-text-secondary)]"
                          style={{ fontFamily: 'var(--font-body)' }}
                        >
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
            <h2
              className="mb-6 text-[length:var(--text-4xl)] font-bold text-[var(--color-text-primary)]"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              Want to Work With Us?
            </h2>
            <p
              className="mx-auto mb-10 max-w-xl text-[length:var(--text-lg)] text-[var(--color-text-secondary)]"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              We help ambitious companies build exceptional digital products.
            </p>
            <Button href="/contact" size="lg">
              Get in Touch
            </Button>
          </FadeIn>
        </div>
      </section>
    </main>
  );
}
