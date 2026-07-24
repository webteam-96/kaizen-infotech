import { SkeletonPage, HeroSkeleton } from '@/components/skeletons';

// Default route loading fallback — used for the home page (and any route without
// its own loading.tsx). The AppFrame navbar + footer stay mounted; this fills the
// hero area until the page's components (incl. the 3D hero) load. On a first
// visit the intro CountdownLoader takes over once the page itself renders.
export default function Loading() {
  return (
    <SkeletonPage>
      <HeroSkeleton />
    </SkeletonPage>
  );
}
