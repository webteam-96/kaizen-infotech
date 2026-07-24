import { SkeletonPage, HeroSkeleton, CardGridSkeleton } from '@/components/skeletons';

// Shown automatically (Suspense fallback) while /work loads.
export default function Loading() {
  return (
    <SkeletonPage>
      <HeroSkeleton />
      <CardGridSkeleton count={6} cols={2} />
    </SkeletonPage>
  );
}
