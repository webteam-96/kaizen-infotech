'use client';

import { useSyncExternalStore } from 'react';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import { CursorProvider } from '@/components/cursor/CursorProvider';
import SmoothScroll from '@/components/layout/SmoothScroll';

// The custom cursor is the ONLY sitewide consumer of framer-motion, and it only
// ever renders on a real-mouse desktop (it returns null on touch/reduced-motion).
// Static-importing it pulled the whole framer-motion runtime into the shared
// chunk on EVERY route — dead weight on 100% of mobile visits. Code-split it and
// render it only when a hover-capable pointer is present, so the framer-motion
// chunk is fetched on desktop alone.
const CustomCursor = dynamic(
  () => import('@/components/cursor/CustomCursor').then((m) => m.CustomCursor),
  { ssr: false },
);

const HOVER_QUERY = '(hover: hover) and (pointer: fine)';
function subscribeHover(cb: () => void) {
  if (typeof window === 'undefined' || !window.matchMedia) return () => {};
  const mq = window.matchMedia(HOVER_QUERY);
  mq.addEventListener('change', cb);
  return () => mq.removeEventListener('change', cb);
}
function hoverSnapshot() {
  return typeof window !== 'undefined' && !!window.matchMedia && window.matchMedia(HOVER_QUERY).matches;
}
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import ScrollProgress from '@/components/layout/ScrollProgress';
import CustomScrollbar from '@/components/layout/CustomScrollbar';

// Chooses the page shell by route. The /admin area is a standalone tool — it
// renders WITHOUT the marketing navbar/footer, Lenis smooth-scroll, custom
// cursor, or scroll chrome (which otherwise overlap the admin UI and intercept
// clicks). The admin section supplies its own header via src/app/admin/layout.
export function AppFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');
  // Real-mouse desktop only → gates the framer-motion-bearing cursor chunk.
  // getServerSnapshot returns false so touch/SSR never even requests it.
  const canHover = useSyncExternalStore(subscribeHover, hoverSnapshot, () => false);

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <CursorProvider>
      <SmoothScroll>
        {canHover && <CustomCursor />}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[999] focus:rounded-md focus:bg-[var(--color-accent-primary)] focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-[var(--color-text-inverse)]"
        >
          Skip to main content
        </a>
        <ScrollProgress />
        <CustomScrollbar />
        <Navbar />
        <div id="main-content">{children}</div>
        <Footer />
      </SmoothScroll>
    </CursorProvider>
  );
}
