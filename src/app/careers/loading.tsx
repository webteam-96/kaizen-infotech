import { SkeletonPage, HeroSkeleton, CardGridSkeleton, RowListSkeleton } from '@/components/skeletons';

// Shown automatically (Suspense fallback) while /careers loads.
export default function Loading() {
  return (
    <SkeletonPage>
      <HeroSkeleton />
      {/* Values / perks grid */}
      <CardGridSkeleton count={3} cols={3} media={false} />
      {/* Open roles list */}
      <RowListSkeleton count={4} />
    </SkeletonPage>
  );
}
