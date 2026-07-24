import { SkeletonPage, HeroSkeleton, Skeleton, CardGridSkeleton } from '@/components/skeletons';

// Shown automatically (Suspense fallback) while /blog loads.
export default function Loading() {
  return (
    <SkeletonPage>
      <HeroSkeleton />
      {/* Category filter chips */}
      <section className="px-6 py-12 md:px-12 lg:px-24">
        <div className="mx-auto flex max-w-7xl flex-wrap gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-28 rounded-full" />
          ))}
        </div>
      </section>
      {/* Featured post — large card */}
      <section className="px-6 pb-4 md:px-12 lg:px-24">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 overflow-hidden rounded-2xl border border-[var(--color-border)] md:grid-cols-2">
            <Skeleton className="aspect-[16/10] w-full rounded-none md:aspect-auto" />
            <div className="space-y-4 p-8 md:p-12">
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="h-7 w-3/4 rounded" />
              <Skeleton className="h-4 w-full rounded" />
              <Skeleton className="h-4 w-2/3 rounded" />
            </div>
          </div>
        </div>
      </section>
      <CardGridSkeleton count={6} cols={3} />
    </SkeletonPage>
  );
}
