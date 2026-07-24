'use client';

import {
  createContext,
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
import { useLoaderStore } from '@/store/loaderStore';

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

  const setScrollState = useScrollStore((s) => s.setScrollState);
  // Home intro gate — see the loader store. RubiksHero sets this the instant the
  // full 3D hero is chosen (before its heavy chunk loads); SmoothScroll, as the
  // early-mounting Lenis owner, is the single enforcer of the freeze.
  const introScrollLocked = useLoaderStore((s) => s.introScrollLocked);

  // Initialize Lenis
  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ── Shared: keep ScrollTrigger positions correct across late layout shifts ──
    // ScrollTrigger.refresh() is a synchronous, main-thread-blocking recompute of
    // EVERY pinned/scrubbed trigger. On a cold load it would otherwise be called
    // several times within ~1s (fonts.ready + window load + a rAF + the loader +
    // Spline onLoad) — that burst is a big first-second jank source. Coalesce all
    // of them into ONE debounced refresh. invalidateOnRefresh on the triggers
    // recomputes their distance functions each refresh.
    let refreshTimer: ReturnType<typeof setTimeout> | null = null;
    const scheduleRefresh = () => {
      if (refreshTimer) clearTimeout(refreshTimer);
      refreshTimer = setTimeout(() => {
        refreshTimer = null;
        ScrollTrigger.refresh();
      }, 120);
    };
    if (typeof document !== 'undefined' && 'fonts' in document) {
      document.fonts.ready.then(scheduleRefresh).catch(() => {});
    }
    const onLoad = () => scheduleRefresh();
    if (document.readyState === 'complete') {
      scheduleRefresh();
    } else {
      window.addEventListener('load', onLoad, { once: true });
    }
    // Mobile URL-bar show/hide fires HEIGHT-only resizes mid-scroll; a full
    // ScrollTrigger.refresh() there re-seats every pin spacer while content is
    // on screen — the dominant real-user (field) CLS source on touch devices.
    // ScrollTrigger.config({ ignoreMobileResize }) only silences its INTERNAL
    // resize listener, not this one — so apply the same policy here: on coarse
    // pointers, only refresh when the WIDTH actually changes (rotation, split
    // view). Desktop behaviour is unchanged.
    let lastResizeW = window.innerWidth;
    const onResize = () => {
      const w = window.innerWidth;
      if (w === lastResizeW && window.matchMedia('(pointer: coarse)').matches) return;
      lastResizeW = w;
      scheduleRefresh();
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
        setScrollState({ scrollY: y, scrollDirection: y >= lastY ? 'down' : 'up' });
        lastY = y;
      };
      window.addEventListener('scroll', onNativeScroll, { passive: true });
      onNativeScroll();
      return () => {
        window.removeEventListener('scroll', onNativeScroll);
        window.removeEventListener('load', onLoad);
        window.removeEventListener('resize', onResize);
        if (refreshTimer) clearTimeout(refreshTimer);
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

    // Drive Lenis from the GSAP ticker (single rAF source) and CLAMP the
    // per-frame advance fed to Lenis. lagSmoothing(0) keeps ScrollTrigger in sync
    // with Lenis, but it also means a heavy/dropped frame (GC, 3D/Spline init,
    // route change, or a backgrounded tab regaining focus) would hand Lenis a
    // huge dt — its damping saturates and SNAPS the page in one frame (the
    // "scroll suddenly jumps" symptom). Feeding Lenis a virtual clock that never
    // advances more than ~50ms (~3 frames) per tick removes the jump while the
    // motion stays smooth — Lenis just catches up over the next few frames.
    let lastMs = 0;
    let virtualMs = 0;
    // Scroll-idle detection lives in this ticker (see handleScroll): checking a
    // timestamp once per frame replaces the old clearTimeout+setTimeout pair
    // that ran on EVERY scroll event (~60 timer allocations/second while
    // scrolling). Same observable behaviour: isScrolling flips false ~150ms
    // after the last scroll event.
    let lastScrollMs = -1;
    const markScrolling = () => {
      lastScrollMs = performance.now();
    };
    const tickerCallback = (time: number) => {
      const ms = time * 1000;
      if (lastMs === 0) lastMs = ms;
      virtualMs += Math.min(50, ms - lastMs);
      lastMs = ms;
      // Home intro gate: while locked, keep Lenis hard-stopped every frame — a
      // late ScrollTrigger.refresh, a resize, or a remount can silently resume
      // it otherwise. A stopped Lenis ignores wheel/touch and never writes
      // scroll, so it stays pinned at the top. Crucially we STILL feed it raf
      // (below) so its internal clock keeps ticking — otherwise the dive's
      // scrollTo would stall for however long the freeze lasted before it began
      // to move. instance.raf on a stopped Lenis is a safe no-op for scroll.
      if (useLoaderStore.getState().introScrollLocked && !instance.isStopped) {
        instance.stop();
      }
      instance.raf(virtualMs);
      if (lastScrollMs >= 0 && performance.now() - lastScrollMs > 150) {
        lastScrollMs = -1;
        setScrollState({ isScrolling: false, scrollVelocity: 0 });
        updateSkew(0);
      }
    };
    gsap.ticker.add(tickerCallback);
    gsap.ticker.lagSmoothing(0);

    // Velocity-driven `--scroll-skew` CSS variable on the document root.
    // Elements opt in via `transform: skewY(var(--scroll-skew, 0deg))` (see
    // the `.rc-scroll-skew` helper in globals.css). The hero owns its own
    // RAF transforms; using a CSS var keeps the two systems composable
    // instead of fighting per-frame.
    let smoothedVelocity = 0;
    // Cache the last written value: writing a root CSS custom property
    // invalidates style for every var() consumer, so skip the setProperty when
    // the rounded value hasn't changed (most frames once velocity settles).
    let lastSkew = '';
    const updateSkew = (velocity: number) => {
      if (prefersReducedMotion) return;
      smoothedVelocity = smoothedVelocity * 0.85 + velocity * 0.15;
      const clamped = Math.max(-1, Math.min(1, smoothedVelocity / 80));
      const next = `${(clamped * 1.2).toFixed(3)}deg`;
      if (next === lastSkew) return;
      lastSkew = next;
      document.documentElement.style.setProperty('--scroll-skew', next);
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
      // One store write per frame (was five separate set() calls): a single
      // merged set() = one allocation + one subscriber-notify sweep per scroll
      // frame instead of five. Published values are identical.
      setScrollState({
        scrollY: scroll,
        scrollDirection: direction >= 0 ? 'down' : 'up',
        scrollProgress: progress,
        scrollVelocity: velocity,
        isScrolling: true,
      });
      updateSkew(velocity);
      markScrolling();
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
      if (refreshTimer) clearTimeout(refreshTimer);
    };
  }, [setScrollState]);

  // ── Enforce the home intro freeze ─────────────────────────────────────────
  // While locked: hard-stop Lenis, reset to the very top (correct any pre-lock
  // native drift), block native scroll (overflow:hidden — the scrollbar-gutter
  // rule keeps this shift-free), and swallow wheel / touch-move / scroll-key
  // gestures so nothing moves the page. Enter/Space still reach the hero's
  // begin-gesture handler (preventDefault stops their native scroll but does not
  // stop propagation). The ticker also re-stops Lenis every frame; this effect
  // handles the DOM-level blocking and the unlock restore.
  //
  // NOTE: the home route sets overflow:hidden via a pre-hydration inline script
  // (page.tsx). To hand that off WITHOUT a one-frame flash, only CLEAR overflow
  // on a genuine lock→unlock transition (lockedByUsRef) — never on this effect's
  // initial `false` run, which would briefly undo the inline lock before the
  // store resolves to locked for the full 3D hero.
  const lockedByUsRef = useRef(false);
  useEffect(() => {
    const html = document.documentElement;
    if (!introScrollLocked) {
      if (lockedByUsRef.current) {
        lockedByUsRef.current = false;
        html.style.overflow = '';
        html.style.overscrollBehavior = '';
      }
      lenisRef.current?.start();
      return;
    }
    lockedByUsRef.current = true;
    html.style.overflow = 'hidden';
    html.style.overscrollBehavior = 'none';
    const lenis = lenisRef.current;
    if (lenis) {
      lenis.stop();
      lenis.scrollTo(0, { immediate: true, force: true });
    } else {
      window.scrollTo(0, 0);
    }
    const blockWheel = (e: WheelEvent) => e.preventDefault();
    const blockTouch = (e: TouchEvent) => e.preventDefault();
    const blockKeys = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      // Space is both a scroll key AND the begin gesture — preventDefault its
      // native scroll but let it propagate to the hero handler.
      if (['PageDown', 'PageUp', 'ArrowDown', 'ArrowUp', 'Home', 'End', 'Space'].includes(e.code)) {
        e.preventDefault();
      }
    };
    window.addEventListener('wheel', blockWheel, { passive: false });
    window.addEventListener('touchmove', blockTouch, { passive: false });
    window.addEventListener('keydown', blockKeys);
    return () => {
      window.removeEventListener('wheel', blockWheel);
      window.removeEventListener('touchmove', blockTouch);
      window.removeEventListener('keydown', blockKeys);
    };
  }, [introScrollLocked]);

  // Scroll restoration on route change. Reset to top immediately, but DEFER the
  // ScrollTrigger.refresh() out of the React commit (a synchronous refresh there
  // blocks the main thread right at navigation = the "scroll dead for a beat
  // after clicking a link" feel), and run a SECOND refresh after the new route's
  // late images/fonts have laid out — otherwise pins/scrubs are computed against
  // a half-settled DOM and stay mis-placed until a resize.
  useEffect(() => {
    if (!lenisRef.current) return;
    lenisRef.current.scrollTo(0, { immediate: true });
    const r1 = requestAnimationFrame(() => ScrollTrigger.refresh());
    const r2 = setTimeout(() => ScrollTrigger.refresh(), 450);
    return () => {
      cancelAnimationFrame(r1);
      clearTimeout(r2);
    };
  }, [pathname]);

  return (
    <LenisContext.Provider value={{ lenis }}>
      <div data-lenis-prevent-touch-move="false">
        {children}
      </div>
    </LenisContext.Provider>
  );
}
