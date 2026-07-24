import { cn } from '@/lib/utils/cn';

// ─────────────────────────────────────────────────────────────────────────────
// Skeleton library — the shimmering placeholders shown by each route's
// loading.tsx (an automatic Suspense fallback) until that page's components have
// loaded. Pure server-component markup: no hooks, no client JS, no directive.
// The shimmer + reduced-motion handling live in the `.skeleton` CSS class
// (src/styles/animations.css). Blocks are aria-hidden; each <Loading> root wraps
// them in a role="status" region (see <SkeletonPage>) that announces "Loading".
//
// The AppFrame's fixed navbar + footer stay mounted during loading, so these
// only fill the page-content area. Every hero skeleton mirrors PageHero's
// spacing (min-h + top padding that clears the fixed navbar) so the swap to the
// real page doesn't jump.
// ─────────────────────────────────────────────────────────────────────────────

/** A single shimmering block. Size / radius via className. */
export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn('skeleton', className)} />;
}

/** Accessible wrapper for a whole page skeleton — announces the loading state
 *  once (children are decorative) and fades in so a fast load doesn't flash. */
export function SkeletonPage({ children }: { children: React.ReactNode }) {
  return (
    <div
      role="status"
      aria-label="Loading page"
      className="min-h-screen animate-[fadeIn_0.2s_ease-out] bg-[var(--color-bg-primary)]"
    >
      <span className="sr-only">Loading…</span>
      {children}
    </div>
  );
}

/** Mirrors <PageHero>: full-height hero with kicker, big title, and subtitle. */
export function HeroSkeleton({ center = true }: { center?: boolean }) {
  return (
    <section className="relative flex min-h-[72vh] items-end overflow-hidden px-6 pb-[clamp(3rem,6vw,6rem)] pt-[clamp(8rem,14vh,11rem)]">
      {/* Soft wash echoing the hero's gradient backdrop. */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 opacity-70"
        style={{
          background:
            'radial-gradient(55vmax 40vmax at 18% -5%, var(--color-bg-tertiary), transparent 68%)',
        }}
      />
      <div className={cn('mx-auto w-full max-w-7xl', center && 'flex flex-col items-center text-center')}>
        <Skeleton className="mb-6 h-3 w-40 rounded-full" />
        <div className={cn('w-full space-y-3', center && 'flex flex-col items-center')}>
          <Skeleton className="h-[clamp(2.5rem,6vw,4.75rem)] w-[min(92%,64ch)] rounded-lg" />
          <Skeleton className="h-[clamp(2.5rem,6vw,4.75rem)] w-[min(68%,44ch)] rounded-lg" />
        </div>
        <div className={cn('mt-9 w-full space-y-3', center && 'flex flex-col items-center')}>
          <Skeleton className="h-4 w-[min(82%,52ch)] rounded" />
          <Skeleton className="h-4 w-[min(58%,38ch)] rounded" />
        </div>
      </div>
    </section>
  );
}

/** A responsive card grid (services capabilities, careers values, blog posts…). */
export function CardGridSkeleton({
  count = 6,
  cols = 3,
  media = true,
}: {
  count?: number;
  cols?: 2 | 3;
  media?: boolean;
}) {
  return (
    <section className="px-6 py-24 md:px-12 lg:px-24">
      <div className="mx-auto max-w-7xl">
        <div
          className={cn(
            'grid grid-cols-1 gap-8',
            cols === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-3'
          )}
        >
          {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-[var(--color-border)] p-6">
              {media && <Skeleton className="mb-6 h-40 w-full rounded-xl" />}
              <Skeleton className="mb-4 h-5 w-3/4 rounded" />
              <Skeleton className="mb-2.5 h-4 w-full rounded" />
              <Skeleton className="mb-2.5 h-4 w-11/12 rounded" />
              <Skeleton className="h-4 w-2/3 rounded" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/** A stacked list of rows (careers open roles). */
export function RowListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <section className="px-6 py-24 md:px-12 lg:px-24">
      <div className="mx-auto max-w-4xl space-y-5">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col gap-4 rounded-2xl border border-[var(--color-border)] p-6 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="w-full space-y-3">
              <Skeleton className="h-5 w-1/2 rounded" />
              <Skeleton className="h-4 w-3/4 rounded" />
            </div>
            <Skeleton className="h-11 w-32 shrink-0 rounded-full" />
          </div>
        ))}
      </div>
    </section>
  );
}

/** Two-column band: a text column beside a media block (about intro). */
export function TwoColSkeleton() {
  return (
    <section className="px-6 py-24 md:px-12 lg:px-24">
      <div className="mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-4">
          <Skeleton className="mb-6 h-8 w-2/3 rounded-lg" />
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className={cn('h-4 rounded', i % 3 === 2 ? 'w-2/3' : 'w-full')} />
          ))}
        </div>
        <Skeleton className="aspect-[4/5] w-full rounded-2xl" />
      </div>
    </section>
  );
}

/** Contact page: form fields beside the contact-info sidebar. */
export function FormSkeleton() {
  return (
    <section className="px-6 py-24 md:px-12 lg:px-24">
      <div className="mx-auto grid max-w-7xl gap-16 xl:grid-cols-[1fr_auto_25rem]">
        {/* Form column */}
        <div className="space-y-10">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-3 w-24 rounded" />
                <Skeleton className="h-11 w-full rounded-lg" />
              </div>
            ))}
          </div>
          <div className="space-y-3">
            <Skeleton className="h-3 w-24 rounded" />
            <Skeleton className="h-36 w-full rounded-lg" />
          </div>
          <Skeleton className="h-12 w-44 rounded-full" />
        </div>
        {/* Divider (xl only) */}
        <div className="hidden xl:block">
          <Skeleton className="h-full w-px" />
        </div>
        {/* Contact-info sidebar */}
        <div className="section-ink rounded-2xl p-8">
          <div className="space-y-8">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-3 w-28 rounded" />
                <Skeleton className="h-5 w-3/4 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/** A long-form article body (blog detail, legal pages): title, meta, paragraphs. */
export function ArticleSkeleton({ cover = true }: { cover?: boolean }) {
  return (
    <section className="px-6 py-20 md:px-12">
      <div className="mx-auto max-w-3xl">
        <Skeleton className="mb-5 h-3 w-32 rounded-full" />
        <Skeleton className="mb-4 h-10 w-full rounded-lg" />
        <Skeleton className="mb-8 h-10 w-4/5 rounded-lg" />
        <div className="mb-10 flex items-center gap-4">
          <Skeleton className="h-11 w-11 rounded-full" />
          <Skeleton className="h-4 w-40 rounded" />
        </div>
        {cover && <Skeleton className="mb-12 aspect-[16/9] w-full rounded-2xl" />}
        <div className="space-y-4">
          {Array.from({ length: 9 }).map((_, i) => (
            <Skeleton
              key={i}
              className={cn('h-4 rounded', i % 4 === 3 ? 'w-1/2' : i % 3 === 0 ? 'w-11/12' : 'w-full')}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

/** Case-study / service detail: full hero + a media band + body paragraphs. */
export function DetailSkeleton() {
  return (
    <>
      <HeroSkeleton center={false} />
      <section className="px-6 py-20 md:px-12 lg:px-24">
        <div className="mx-auto max-w-7xl space-y-12">
          <Skeleton className="aspect-[16/9] w-full rounded-2xl" />
          <div className="grid gap-12 lg:grid-cols-[1fr_2fr]">
            <div className="space-y-4">
              <Skeleton className="h-5 w-1/2 rounded" />
              <Skeleton className="h-4 w-3/4 rounded" />
              <Skeleton className="h-4 w-2/3 rounded" />
            </div>
            <div className="space-y-4">
              {Array.from({ length: 7 }).map((_, i) => (
                <Skeleton key={i} className={cn('h-4 rounded', i % 3 === 2 ? 'w-2/3' : 'w-full')} />
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
