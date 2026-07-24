import { SkeletonPage, HeroSkeleton, TwoColSkeleton } from '@/components/skeletons';

// Shown automatically (Suspense fallback) while /about loads.
export default function Loading() {
  return (
    <SkeletonPage>
      <HeroSkeleton />
      <TwoColSkeleton />
    </SkeletonPage>
  );
}
