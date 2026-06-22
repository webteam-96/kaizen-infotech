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
import { usePathname } from 'next/navigation';
import { gsap, ScrollTrigger, registerGSAPPlugins } from '@/lib/animations/gsap-setup';
import { useScrollStore } from '@/lib/store/scroll-store';

// Centralized plugin registration (idempotent guard inside).
registerGSAPPlugins();

interface LenisContextValue {
  lenis: Lenis | null;
}

const LenisContext = createContext<LenisContextValue>({ lenis: null });

export function useLenis() {
  return useContext(LenisContext);
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
  const setScrollVelocity = useScrollStore((s) => s.setScrollVelocity);
  const setIsScrolling = useScrollStore((s) => s.setIsScrolling);

  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Initialize Lenis
  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ── Shared: keep ScrollTrigger positions correct across late layout shifts ──
    // Refresh after web fonts swap in (next/font display:swap shifts text metrics
    // and therefore every pinned section's start/end), after window load (late
    // images), and on resize (debounced). invalidateOnRefresh on the triggers
    // themselves recomputes their distance functions on each refresh.
    let fontsLoaded = false;
    const refreshAfterFonts = () => {
      if (fontsLoaded) return;
      fontsLoaded = true;
      ScrollTrigger.refresh();
    };
    if (typeof document !== 'undefined' && 'fonts' in document) {
      document.fonts.ready.then(refreshAfterFonts).catch(() => {});
    }
    const onLoad = () => ScrollTrigger.refresh();
    if (document.readyState === 'complete') {
      requestAnimationFrame(() => ScrollTrigger.refresh());
    } else {
      window.addEventListener('load', onLoad, { once: true });
    }
    let resizeTimer: ReturnType<typeof setTimeout> | null = null;
    const onResize = () => {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => ScrollTrigger.refresh(), 200);
    };
    window.addEventListener('resize', onResize);

    // ── Reduced motion: NO Lenis, NO smoothing — native browser scroll. ──
    // ScrollTrigger listens to native scroll on its own, so scrub/pin sections
    // (which each also kill their scrub/pin under reduced motion) still resolve
    // to their final state. We keep a light native listener so the scroll store
    // stays roughly in sync for any UI that reads it.
    if (prefersReducedMotion) {
      let lastY = window.scrollY;
      const onNativeScroll = () => {
        const y = window.scrollY;
        setScrollY(y);
        setScrollDirection(y >= lastY ? 'down' : 'up');
        lastY = y;
      };
      window.addEventListener('scroll', onNativeScroll, { passive: true });
      onNativeScroll();
      return () => {
        window.removeEventListener('scroll', onNativeScroll);
        window.removeEventListener('load', onLoad);
        window.removeEventListener('resize', onResize);
        if (resizeTimer) clearTimeout(resizeTimer);
      };
    }

    // ── Smooth scroll: a single Lenis instance driven by GSAP's ticker. ──
    // Lerp-based smoothing; no separate requestAnimationFrame loop (the GSAP
    // ticker is the sole rAF source, so Lenis + ScrollTrigger stay in lockstep).
    const instance = new Lenis({
      lerp: 0.1,
      wheelMultiplier: 0.9,
      smoothWheel: true,
      syncTouch: false,
    });

    lenisRef.current = instance;
    listenersRef.current.forEach((cb) => cb());

    // Sync Lenis scroll with ScrollTrigger
    instance.on('scroll', ScrollTrigger.update);

    // Drive Lenis from the GSAP ticker (no double rAF loop).
    const tickerCallback = (time: number) => {
      instance.raf(time * 1000);
    };
    gsap.ticker.add(tickerCallback);
    gsap.ticker.lagSmoothing(0);

    // Velocity-driven `--scroll-skew` CSS variable on the document root.
    // Elements opt in via `transform: skewY(var(--scroll-skew, 0deg))` (see
    // the `.rc-scroll-skew` helper in globals.css). The hero owns its own
    // RAF transforms; using a CSS var keeps the two systems composable
    // instead of fighting per-frame.
    let smoothedVelocity = 0;
    const updateSkew = (velocity: number) => {
      if (prefersReducedMotion) return;
      smoothedVelocity = smoothedVelocity * 0.85 + velocity * 0.15;
      const clamped = Math.max(-1, Math.min(1, smoothedVelocity / 80));
      document.documentElement.style.setProperty(
        '--scroll-skew',
        `${(clamped * 1.2).toFixed(3)}deg`
      );
    };

    // Update scroll store on scroll
    const handleScroll = ({
      scroll,
      direction,
      progress,
      velocity,
    }: {
      scroll: number;
      direction: number;
      progress: number;
      velocity: number;
    }) => {
      setScrollY(scroll);
      setScrollDirection(direction >= 0 ? 'down' : 'up');
      setScrollProgress(progress);
      setScrollVelocity(velocity);
      setIsScrolling(true);
      updateSkew(velocity);

      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
        setScrollVelocity(0);
        updateSkew(0);
      }, 150);
    };

    instance.on('scroll', handleScroll);

    return () => {
      gsap.ticker.remove(tickerCallback);
      instance.off('scroll', handleScroll);
      instance.off('scroll', ScrollTrigger.update);
      instance.destroy();
      lenisRef.current = null;
      window.removeEventListener('load', onLoad);
      window.removeEventListener('resize', onResize);
      if (resizeTimer) clearTimeout(resizeTimer);

      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [setScrollY, setScrollDirection, setScrollProgress, setScrollVelocity, setIsScrolling]);

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
