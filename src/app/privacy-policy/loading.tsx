import { SkeletonPage, HeroSkeleton, ArticleSkeleton } from '@/components/skeletons';

// Shown automatically (Suspense fallback) while /privacy-policy loads.
export default function Loading() {
  return (
    <SkeletonPage>
      <HeroSkeleton center={false} />
      <ArticleSkeleton cover={false} />
    </SkeletonPage>
  );
}
