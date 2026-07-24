import { SkeletonPage, DetailSkeleton } from '@/components/skeletons';

// Shown automatically (Suspense fallback) while a service detail page loads.
export default function Loading() {
  return (
    <SkeletonPage>
      <DetailSkeleton />
    </SkeletonPage>
  );
}
