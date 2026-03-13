'use client';

import { useEffect, useRef, useCallback } from 'react';
import { gsap, registerGSAPPlugins, ScrollTrigger } from '@/lib/animations/gsap-setup';
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
      setComplete();
      return;
    }

    // ── First visit: show overlay and run countdown ──
    const overlay = overlayRef.current;
    if (overlay) overlay.style.display = 'flex';
    document.body.classList.add('loader-active');

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

    return () => {
      cancelled = true;
      clearTimeout(startTimer);
      document.body.classList.remove('loader-active');
    };
  }, [finish]);

  /* Skip handler */
  const handleSkip = useCallback(() => {
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
    }, 500);
  }, [setComplete]);

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

      {/* Brand name */}
      <div
        className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap"
        style={{
          bottom: '15vh',
          fontFamily: 'var(--font-body)',
          fontSize: '0.75rem',
          letterSpacing: '0.4em',
          textTransform: 'uppercase',
          color: 'rgba(0,0,0,0.2)',
          opacity: 0,
          animation: 'rc-cdBrandIn 0.8s 0.3s ease forwards',
        }}
      >
        Kaizen Infotech Solutions
      </div>

      {/* Skip button */}
      <button
        onClick={handleSkip}
        className="absolute bottom-[3%] left-1/2 -translate-x-1/2 cursor-pointer uppercase transition-colors duration-300"
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.75rem',
          letterSpacing: '3px',
          color: 'rgba(0,0,0,0.2)',
          background: 'none',
          border: 'none',
          padding: '8px 20px',
        }}
        onMouseEnter={e => (e.currentTarget.style.color = 'rgba(0,0,0,0.5)')}
        onMouseLeave={e => (e.currentTarget.style.color = 'rgba(0,0,0,0.2)')}
      >
        skip
      </button>
    </div>
  );
}
