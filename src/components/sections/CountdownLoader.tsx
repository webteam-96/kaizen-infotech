'use client';

import { useEffect, useRef, useCallback } from 'react';
import { gsap, registerGSAPPlugins, ScrollTrigger } from '@/lib/animations/gsap-setup';
import { useLoaderStore } from '@/store/loaderStore';

/* ── Thread/Knot/Swing Countdown: 5 → 1 ── */
const NUMS = [5, 4, 3, 2, 1];
const SHOW_TIME = 850;
const EXIT_TIME = 400;

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

    // Start countdown after small delay
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
      className="fixed inset-0 z-[9999] flex items-center justify-center transition-opacity duration-800"
      style={{ background: '#f5f5f5' }}
    >
      {NUMS.map(n => (
        <div key={n} id={`cd-${n}`} className="cd-number">
          <div className="cd-thread" />
          <div className="cd-knot" />
          <div className="cd-digit">{n}</div>
        </div>
      ))}

      {/* Brand text */}
      <div
        className="absolute left-1/2 -translate-x-1/2"
        style={{
          bottom: '15vh',
          fontFamily: 'var(--font-body)',
          fontSize: '0.6rem',
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
      <div
        onClick={handleSkip}
        className="absolute bottom-[3%] left-1/2 -translate-x-1/2 cursor-pointer uppercase transition-colors duration-300"
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 9,
          letterSpacing: 3,
          color: 'rgba(0,0,0,0.2)',
        }}
        onMouseEnter={e => (e.currentTarget.style.color = 'rgba(0,0,0,0.5)')}
        onMouseLeave={e => (e.currentTarget.style.color = 'rgba(0,0,0,0.2)')}
      >
        skip
      </div>

      <style jsx>{`
        .rc-cd-fade-out {
          opacity: 0;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}
