import { SkeletonPage, ArticleSkeleton } from '@/components/skeletons';

// Shown automatically (Suspense fallback) while a blog post loads.
export default function Loading() {
  return (
    <SkeletonPage>
      <div className="pt-[clamp(7rem,12vh,9rem)]">
        <ArticleSkeleton cover />
      </div>
    </SkeletonPage>
  );
}
