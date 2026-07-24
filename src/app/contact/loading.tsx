import { SkeletonPage, HeroSkeleton, FormSkeleton } from '@/components/skeletons';

// Shown automatically (Suspense fallback) while /contact loads.
export default function Loading() {
  return (
    <SkeletonPage>
      <HeroSkeleton />
      <FormSkeleton />
    </SkeletonPage>
  );
}
