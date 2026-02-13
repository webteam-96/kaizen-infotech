'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { usePathname } from 'next/navigation';
import { useScrollStore } from '@/lib/store/scroll-store';

gsap.registerPlugin(ScrollTrigger);

interface LenisContextValue {
  lenis: Lenis | null;
}

const LenisContext = createContext<LenisContextValue>({ lenis: null });

export function useLenis() {
  return useContext(LenisContext);
}

function isTouchDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

interface SmoothScrollProps {
  children: ReactNode;
}

export default function SmoothScroll({ children }: SmoothScrollProps) {
  const lenisRef = useRef<Lenis | null>(null);
  const listenersRef = useRef(new Set<() => void>());
  const lenis = useSyncExternalStore(
    (cb) => {
      listenersRef.current.add(cb);
      return () => { listenersRef.current.delete(cb); };
    },
    () => lenisRef.current,
    () => null
  );
  const pathname = usePathname();

  const setScrollY = useScrollStore((s) => s.setScrollY);
  const setScrollDirection = useScrollStore((s) => s.setScrollDirection);
  const setScrollProgress = useScrollStore((s) => s.setScrollProgress);
  const setIsScrolling = useScrollStore((s) => s.setIsScrolling);

  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Initialize Lenis
  useEffect(() => {
    const isTouch = isTouchDevice();

    const instance = new Lenis({
      duration: isTouch ? 0.8 : 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      wheelMultiplier: 1,
      touchMultiplier: isTouch ? 1.5 : 2,
      smoothWheel: !isTouch,
    });

    lenisRef.current = instance;
    listenersRef.current.forEach((cb) => cb());

    // Sync Lenis scroll with ScrollTrigger
    instance.on('scroll', ScrollTrigger.update);

    // Use GSAP ticker for RAF sync
    gsap.ticker.lagSmoothing(0);
    const tickerCallback = (time: number) => {
      instance.raf(time * 1000);
    };
    gsap.ticker.add(tickerCallback);

    // Update scroll store on scroll
    const handleScroll = ({ scroll, direction, progress }: { scroll: number; direction: number; progress: number }) => {
      setScrollY(scroll);
      setScrollDirection(direction >= 0 ? 'down' : 'up');
      setScrollProgress(progress);
      setIsScrolling(true);

      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
      }, 150);
    };

    instance.on('scroll', handleScroll);

    return () => {
      gsap.ticker.remove(tickerCallback);
      instance.off('scroll', handleScroll);
      instance.off('scroll', ScrollTrigger.update);
      instance.destroy();
      lenisRef.current = null;

      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [setScrollY, setScrollDirection, setScrollProgress, setIsScrolling]);

  // Scroll restoration on route change
  const handleRouteChange = useCallback(() => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { immediate: true });
      ScrollTrigger.refresh();
    }
  }, []);

  useEffect(() => {
    handleRouteChange();
  }, [pathname, handleRouteChange]);

  return (
    <LenisContext.Provider value={{ lenis }}>
      <div data-lenis-prevent-touch-move="false">
        {children}
      </div>
    </LenisContext.Provider>
  );
}
