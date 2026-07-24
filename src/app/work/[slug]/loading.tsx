import { SkeletonPage, DetailSkeleton } from '@/components/skeletons';

// Shown automatically (Suspense fallback) while a case-study page loads.
export default function Loading() {
  return (
    <SkeletonPage>
      <DetailSkeleton />
    </SkeletonPage>
  );
}
