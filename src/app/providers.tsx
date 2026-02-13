'use client';

import { CursorProvider } from '@/components/cursor/CursorProvider';
import { CustomCursor } from '@/components/cursor/CustomCursor';
import SmoothScroll from '@/components/layout/SmoothScroll';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CursorProvider>
      <SmoothScroll>
        <CustomCursor />
        {children}
      </SmoothScroll>
    </CursorProvider>
  );
}
