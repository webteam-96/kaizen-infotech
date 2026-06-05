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
  const setScrollVelocity = useScrollStore((s) => s.setScrollVelocity);
  const setIsScrolling = useScrollStore((s) => s.setIsScrolling);

  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Initialize Lenis
  useEffect(() => {
    const isTouch = isTouchDevice();

    // Cinematic smoothing — heavier coast on desktop with a quartic ease-out.
    // Lenis interprets `duration` as the time (in seconds) to settle from a
    // scroll burst to rest; a higher value gives more weight/inertia.
    const instance = new Lenis({
      duration: isTouch ? 1.0 : 1.8,
      easing: (t: number) => 1 - Math.pow(1 - t, 4),
      wheelMultiplier: 0.9,
      touchMultiplier: isTouch ? 1.2 : 1.8,
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

    // Velocity-driven `--scroll-skew` CSS variable on the document root.
    // Elements opt in via `transform: skewY(var(--scroll-skew, 0deg))` (see
    // the `.rc-scroll-skew` helper in globals.css). The hero owns its own
    // RAF transforms; using a CSS var keeps the two systems composable
    // instead of fighting per-frame.
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
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

    // Refresh ScrollTrigger after web fonts swap in. next/font with
    // display: 'swap' shifts text metrics on load, which can move every
    // pinned section's `start`/`end` boundaries by a few pixels. We also
    // refresh once after the window load event so any late-loading
    // images (hero, project cards) recompute trigger positions.
    let fontsLoaded = false;
    const refreshAfterFonts = () => {
      if (fontsLoaded) return;
      fontsLoaded = true;
      ScrollTrigger.refresh();
    };
    if (typeof document !== 'undefined' && 'fonts' in document) {
      document.fonts.ready.then(refreshAfterFonts).catch(() => {
        /* noop — fall through to window.load */
      });
    }
    const onLoad = () => ScrollTrigger.refresh();
    if (document.readyState === 'complete') {
      // Already loaded — schedule a refresh on the next frame so the
      // ScrollTriggers created by sibling effects have time to register.
      requestAnimationFrame(() => ScrollTrigger.refresh());
    } else {
      window.addEventListener('load', onLoad, { once: true });
    }

    return () => {
      gsap.ticker.remove(tickerCallback);
      instance.off('scroll', handleScroll);
      instance.off('scroll', ScrollTrigger.update);
      instance.destroy();
      lenisRef.current = null;
      window.removeEventListener('load', onLoad);

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
