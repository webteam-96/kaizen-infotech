'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Lenis from 'lenis';

export interface UseLenisReturn {
  lenis: Lenis | null;
  scrollTo: (target: string | number | HTMLElement, options?: { offset?: number; duration?: number; immediate?: boolean }) => void;
  stop: () => void;
  start: () => void;
}

export function useLenis(): UseLenisReturn {
  const lenisRef = useRef<Lenis | null>(null);
  const [lenis, setLenis] = useState<Lenis | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Look for an existing Lenis instance on the window (set by the scroll provider)
    // This allows coordination with a global Lenis setup
    const checkForLenis = () => {
      const globalLenis = (window as unknown as Record<string, unknown>).__lenis as Lenis | undefined;
      if (globalLenis) {
        lenisRef.current = globalLenis;
        setLenis(globalLenis);
        return true;
      }
      return false;
    };

    if (!checkForLenis()) {
      // Poll briefly in case the provider hasn't mounted yet
      const interval = setInterval(() => {
        if (checkForLenis()) {
          clearInterval(interval);
        }
      }, 100);

      // Stop polling after 2 seconds
      const timeout = setTimeout(() => clearInterval(interval), 2000);

      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, []);

  const scrollTo = useCallback(
    (
      target: string | number | HTMLElement,
      options?: { offset?: number; duration?: number; immediate?: boolean }
    ) => {
      lenisRef.current?.scrollTo(target, options);
    },
    []
  );

  const stop = useCallback(() => {
    lenisRef.current?.stop();
  }, []);

  const start = useCallback(() => {
    lenisRef.current?.start();
  }, []);

  return { lenis, scrollTo, stop, start };
}
