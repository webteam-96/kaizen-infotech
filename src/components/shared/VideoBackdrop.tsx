'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils/cn';

// ─────────────────────────────────────────────────────────────────────────────
// VideoBackdrop — a subtle looping video behind a flat-colour section/page.
//
// Sits absolutely behind the host's content (`-z-10`; the host must be
// `relative isolate` so this paints ABOVE the host's solid background colour but
// BELOW its content — no content/markup changes needed). The video plays at 50%
// opacity with a same-colour overlay on top, so the section keeps its identity
// (white / dark-blue) while gaining a gentle animated texture. The host's solid
// colour stays as the base, so if the video never loads nothing breaks.
//
// Performance + smoothness:
//  • muted + loop + playsInline + object-fit:cover (full-bleed, never letterboxed).
//  • An IntersectionObserver plays the video ONLY while it's near/in the viewport
//    and pauses it otherwise, so off-screen sections don't decode video.
//  • prefers-reduced-motion → the whole backdrop is hidden via CSS (the section
//    falls back to its plain solid colour), and we never call play().
// ─────────────────────────────────────────────────────────────────────────────

type Variant = 'white' | 'ink';

const SRC: Record<Variant, string> = {
  white: '/videos/white-background.mp4',
  ink: '/videos/dark-blue.mp4',
};

// Same-colour overlay painted on top of the video (the "white / dark-blue
// overlay on it"). Brand tokens only.
const OVERLAY: Record<Variant, string> = {
  white: 'bg-[var(--color-bg-primary)]',
  ink: 'bg-[var(--surface-ink)]',
};

interface VideoBackdropProps {
  variant: Variant;
  className?: string;
  /** Overlay opacity (0–1). Default 0.45 keeps text fully readable. */
  overlayOpacity?: number;
  /**
   * `fixed` (viewport-sized) for a tall page <main> canvas so one frame isn't
   * stretched over the whole page height; `absolute` (default) to fill a single
   * ~viewport-height section box.
   */
  fixed?: boolean;
}

export function VideoBackdrop({ variant, className, overlayOpacity = 0.45, fixed = false }: VideoBackdropProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return; // never autoplay under reduced motion
    }

    // Play ONLY when the tab is visible AND the backdrop is in its useful range.
    // Decoding + compositing a full-screen video every frame is the single
    // biggest scroll-perf cost, so we pause it aggressively.
    let inRange = true;
    const update = () => {
      if (!document.hidden && inRange) video.play().catch(() => {});
      else video.pause();
    };
    const onVisibility = () => update();
    document.addEventListener('visibilitychange', onVisibility);

    let io: IntersectionObserver | null = null;
    let onScroll: (() => void) | null = null;

    if (fixed) {
      // A `fixed` element is ALWAYS intersecting, so an IntersectionObserver
      // can never pause it. Instead gate the page-wide ambient backdrop on
      // scroll: keep it animating across the hero, then pause once scrolled past
      // (~1.15 viewports) where it sits behind content at low opacity anyway.
      let raf = 0;
      onScroll = () => {
        if (raf) return;
        raf = requestAnimationFrame(() => {
          raf = 0;
          const next = window.scrollY < window.innerHeight * 1.15;
          if (next !== inRange) { inRange = next; update(); }
        });
      };
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    } else {
      io = new IntersectionObserver(
        ([entry]) => { inRange = entry.isIntersecting; update(); },
        { rootMargin: '200px 0px' },
      );
      io.observe(video);
    }

    update();
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      io?.disconnect();
      if (onScroll) window.removeEventListener('scroll', onScroll);
    };
  }, [fixed]);

  return (
    <div
      aria-hidden
      className={cn(
        'video-backdrop pointer-events-none -z-10 overflow-hidden',
        fixed ? 'fixed inset-0' : 'absolute inset-0',
        className
      )}
    >
      <video
        ref={videoRef}
        className="video-backdrop-video"
        muted
        loop
        playsInline
        autoPlay
        preload="metadata"
        tabIndex={-1}
      >
        <source src={SRC[variant]} type="video/mp4" />
      </video>
      <div className={cn('absolute inset-0', OVERLAY[variant])} style={{ opacity: overlayOpacity }} />
    </div>
  );
}
