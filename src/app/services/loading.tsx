import { SkeletonPage, HeroSkeleton, CardGridSkeleton } from '@/components/skeletons';

// Shown automatically (Suspense fallback) while /services loads.
export default function Loading() {
  return (
    <SkeletonPage>
      <HeroSkeleton />
      <CardGridSkeleton count={6} cols={3} />
    </SkeletonPage>
  );
}
