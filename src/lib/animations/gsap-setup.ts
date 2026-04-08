'use client';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { useGSAP } from '@gsap/react';

let registered = false;

export function registerGSAPPlugins() {
  if (registered) return;
  if (typeof window === 'undefined') return;

  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin, useGSAP);

  // Global tween defaults — used when a tween doesn't specify its own.
  // Keep this conservative: only ease + duration, NOT overwrite, so
  // ScrollTrigger scrub tweens don't kill each other unexpectedly.
  gsap.defaults({
    ease: 'power2.out',
    duration: 0.8,
  });

  // ScrollTrigger: ignore mobile URL-bar resize (major source of jitter)
  // and batch callbacks so multiple triggers firing in a frame don't
  // each trigger individual layout reads.
  // NOTE: lagSmoothing is intentionally NOT set here — SmoothScroll.tsx
  // disables it (lagSmoothing(0)) because Lenis drives the ticker and
  // needs raw deltas for consistent smooth-scroll timing.
  ScrollTrigger.config({
    ignoreMobileResize: true,
    limitCallbacks: true,
  });

  registered = true;
}

/**
 * Project-wide easing & duration vocabulary.
 *
 * Use these constants instead of hardcoding ease strings — keeps the
 * "feel" of the site consistent and lets us retune in one place.
 *
 *   EASE.entrance → "power2.out"  — things appearing on screen
 *   EASE.exit     → "power2.in"   — things leaving the screen
 *   EASE.scrub    → "none"        — scroll-linked tweens (linear)
 *   EASE.snappy   → "power3.out"  — UI affordances, buttons, hover
 *   EASE.cinematic→ "expo.out"    → big hero reveals
 */
export const EASE = {
  entrance: 'power2.out',
  exit: 'power2.in',
  scrub: 'none',
  snappy: 'power3.out',
  cinematic: 'expo.out',
} as const;

export const DURATION = {
  fast: 0.3,
  normal: 0.6,
  slow: 1.0,
  cinematic: 1.5,
} as const;

export { gsap, ScrollTrigger, ScrollToPlugin, useGSAP };
