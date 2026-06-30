'use client';

import { usePathname } from 'next/navigation';
import { CursorProvider } from '@/components/cursor/CursorProvider';
import { CustomCursor } from '@/components/cursor/CustomCursor';
import SmoothScroll from '@/components/layout/SmoothScroll';
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

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <CursorProvider>
      <SmoothScroll>
        <CustomCursor />
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
