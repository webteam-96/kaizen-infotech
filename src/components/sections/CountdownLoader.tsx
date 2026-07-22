'use client';

import { useEffect, useRef, useCallback } from 'react';
import { registerGSAPPlugins, ScrollTrigger } from '@/lib/animations/gsap-setup';
import { useLoaderStore } from '@/store/loaderStore';

/* ── Thread/Knot/Swing Countdown: 5 → 1 ── */
const NUMS = [5, 4, 3, 2, 1];
const SHOW_TIME = 850;
const EXIT_TIME = 400;
const SESSION_KEY = 'kaizen-intro-seen';

export function CountdownLoader() {
  const overlayRef = useRef<HTMLDivElement>(null);
  const doneRef = useRef(false);
  const setComplete = useLoaderStore((s) => s.setComplete);

  const finish = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    const overlay = overlayRef.current;
    if (!overlay) return;

    overlay.classList.add('rc-cd-fade-out');
    document.body.classList.remove('loader-active');

    setTimeout(() => {
      overlay.style.display = 'none';
      setComplete();
      ScrollTrigger.refresh();
    }, 900);
  }, [setComplete]);

  useEffect(() => {
    registerGSAPPlugins();

    // ── Session guard: only show on the very first visit per browser session ──
    // sessionStorage persists through page refreshes but clears when the tab is closed.
    // This means: first ever visit → show intro; refresh → skip; navigate home → skip.
    let firstVisit = true;
    try {
      if (sessionStorage.getItem(SESSION_KEY)) {
        firstVisit = false;
      } else {
        // Mark immediately so a hard refresh won't re-trigger the intro
        sessionStorage.setItem(SESSION_KEY, '1');
      }
    } catch {
      // sessionStorage blocked (e.g. private browsing policy) — just show intro
    }

    if (!firstVisit) {
      // Skip immediately: keep overlay hidden and unblock the page
      const overlay = overlayRef.current;
      if (overlay) overlay.style.display = 'none';
      setComplete();
      return;
    }

    // ── First visit: show overlay and run countdown ──
    const overlay = overlayRef.current;
    if (overlay) overlay.style.display = 'flex';
    document.body.classList.add('loader-active');

    // ── Reduced motion: skip the digit countdown entirely. Show the overlay
    // briefly, fade it out (opacity only — no slide), then run the SAME
    // completion path as the normal flow (setComplete + ScrollTrigger.refresh).
    // NOTE: read matchMedia live instead of the useReducedMotion() render value.
    // During hydration the hook's first value is the SSR fallback (false), and
    // putting it in this effect's deps would re-run the one-shot countdown
    // effect mid-flight — both paths must be decided once, at effect time.
    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    if (reducedMotion) {
      const fadeTimer = setTimeout(() => {
        if (doneRef.current) return;
        doneRef.current = true;
        if (overlay) {
          overlay.style.transition = 'opacity 0.2s ease';
          overlay.style.opacity = '0';
          overlay.style.pointerEvents = 'none';
        }
        document.body.classList.remove('loader-active');
      }, 300);
      const doneTimer = setTimeout(() => {
        if (overlay) overlay.style.display = 'none';
        setComplete();
        ScrollTrigger.refresh();
      }, 520);
      return () => {
        clearTimeout(fadeTimer);
        clearTimeout(doneTimer);
        document.body.classList.remove('loader-active');
      };
    }

    let idx = 0;
    let cancelled = false;

    function showNext() {
      if (cancelled || idx >= NUMS.length) {
        if (!cancelled) setTimeout(finish, 200);
        return;
      }

      const el = document.getElementById(`cd-${NUMS[idx]}`);
      if (!el) return;

      el.classList.add('active');

      setTimeout(() => {
        if (cancelled) return;
        el.classList.remove('active');
        el.classList.add('exit');

        setTimeout(() => {
          if (cancelled) return;
          el.style.display = 'none';
          idx++;
          showNext();
        }, EXIT_TIME);
      }, SHOW_TIME);
    }

    const startTimer = setTimeout(showNext, 400);

    // Hard safety net: the digit chain bails (returns without advancing) if a
    // digit element is missing, which would leave body.loader-active — and its
    // overflow:hidden — stuck, freezing the whole page. Force the loader to
    // finish after a max duration so the page is NEVER left unscrollable.
    const safetyTimer = setTimeout(() => {
      if (doneRef.current) return;
      doneRef.current = true;
      cancelled = true;
      document.body.classList.remove('loader-active');
      const ov = overlayRef.current;
      if (ov) ov.style.display = 'none';
      setComplete();
      ScrollTrigger.refresh();
    }, 9000);

    return () => {
      cancelled = true;
      clearTimeout(startTimer);
      clearTimeout(safetyTimer);
      document.body.classList.remove('loader-active');
    };
  }, [finish, setComplete]);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      /* Start hidden — shown only on first visit via useEffect */
      style={{ background: '#f5f5f5', display: 'none' }}
    >
      {NUMS.map(n => (
        <div key={n} id={`cd-${n}`} className="cd-number">
          <div className="cd-thread" />
          <div className="cd-knot" />
          <div className="cd-digit">{n}</div>
        </div>
      ))}

      {/* Brand name — font + tracking shrink on narrow phones so the nowrap line
          is not clipped by the fixed overlay below ~395px (page has overflow-x:clip). */}
      <div
        className="absolute left-1/2 -translate-x-1/2 text-center"
        style={{
          bottom: '15vh',
          maxWidth: '94vw',
          fontFamily: 'var(--font-body)',
          fontSize: 'clamp(0.6rem, 2.4vw, 0.75rem)',
          letterSpacing: 'clamp(0.18em, 1.1vw, 0.4em)',
          textTransform: 'uppercase',
          color: 'rgba(0,0,0,0.2)',
          opacity: 0,
          animation: 'rc-cdBrandIn 0.8s 0.3s ease forwards',
        }}
      >
        Kaizen Infotech Solutions Pvt. Ltd.
      </div>
    </div>
  );
}
