'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useLenis } from './SmoothScroll';

/**
 * CustomScrollbar — a brand-coloured vertical rail pinned to the right edge that
 * doubles as a real scrollbar (draggable thumb + click-to-jump). Shown only on
 * fine-pointer (desktop) devices; the native page scrollbar is hidden there.
 *
 * GLITCH-FREE DESIGN — the old version jittered/resized because it (a) read the
 * page height via a ResizeObserver on <html> that re-fires constantly as the
 * heavy video/sticky content settles, and (b) routed position through the zustand
 * store. This version instead treats LENIS as the single source of truth:
 *   • The thumb position is driven straight off Lenis's own `scroll`/`limit` on
 *     its per-frame `scroll` event (same value that moves the whole page — so the
 *     thumb can never desync). Position is written as a `transform` (GPU, no
 *     layout, no transition → no lag).
 *   • The thumb HEIGHT is recomputed only when Lenis reports a NEW `limit`
 *     (content reflow) — not every frame — so it never flickers mid-scroll.
 *   • Dragging positions the thumb directly from the pointer (crisp 1:1) and
 *     drives Lenis with an immediate scrollTo; the scroll-event painter is
 *     suppressed while dragging so the two never fight.
 *   • No per-frame React renders (refs + direct DOM writes only).
 * Falls back to native window scroll when Lenis is absent (reduced motion).
 */
export default function CustomScrollbar() {
  const { lenis } = useLenis();
  const lenisRef = useRef(lenis);

  const railRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);

  const [enabled, setEnabled] = useState(false);

  // Mirror the Lenis instance into a ref so event handlers read the live value.
  // (The scroll-subscribe effect also depends on `lenis`, so it re-attaches to
  // Lenis the moment it becomes available; this keeps drag/click handlers fresh.)
  useEffect(() => {
    lenisRef.current = lenis;
  }, [lenis]);

  const dragRef = useRef({ active: false, startPointerY: 0, startTop: 0 });
  // Cached geometry — the per-frame painter does zero layout reads.
  const geomRef = useRef({ trackH: 0, thumbH: 56, lastLimit: -1 });

  // Only where a persistent scrollbar exists (mouse / trackpad).
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(pointer: fine)');
    const apply = () => setEnabled(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  // Current scroll position + max — from Lenis if present, else native.
  const readScroll = useCallback(() => {
    const nativeLimit = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    const l = lenisRef.current;
    // Before Lenis finishes its first measure `l.limit` is 0 — fall back to the
    // native document height so the thumb is sized correctly from frame one
    // (otherwise it briefly renders full-height, then snaps small).
    if (l) return { scroll: l.scroll, limit: l.limit || nativeLimit };
    return { scroll: window.scrollY, limit: nativeLimit };
  }, []);

  const measureTrack = useCallback(() => {
    const rail = railRef.current;
    if (rail) geomRef.current.trackH = rail.clientHeight;
  }, []);

  // Thumb height mirrors the visible fraction of the page (native-like). Only
  // called when the limit changes, so it never flickers during a scroll.
  const updateThumbHeight = useCallback((limit: number) => {
    const g = geomRef.current;
    const viewH = window.innerHeight;
    const docH = limit + viewH;
    const ratio = docH > 0 ? viewH / docH : 1;
    const thumbH = Math.max(56, Math.min(g.trackH, Math.round(g.trackH * ratio)));
    g.thumbH = thumbH;
    g.lastLimit = limit;
    if (thumbRef.current) thumbRef.current.style.height = `${thumbH}px`;
  }, []);

  // Paint thumb position + the filled (reached) trail from scroll/limit.
  const paint = useCallback((scroll: number, limit: number) => {
    const g = geomRef.current;
    const max = limit > 0 ? limit : 1;
    const p = Math.min(1, Math.max(0, scroll / max));
    const travel = Math.max(0, g.trackH - g.thumbH);
    const top = travel * p;
    if (thumbRef.current) thumbRef.current.style.transform = `translateY(${top}px)`;
    if (fillRef.current) fillRef.current.style.height = `${top + g.thumbH}px`;
  }, []);

  // Subscribe to scroll (Lenis preferred) + keep geometry fresh on resize. Re-runs
  // when `lenis` becomes available so we attach to Lenis rather than native.
  useEffect(() => {
    if (!enabled) return;
    measureTrack();
    const g = geomRef.current;

    const onScroll = () => {
      if (dragRef.current.active) return; // drag positions the thumb itself
      const { scroll, limit } = readScroll();
      if (limit !== g.lastLimit) updateThumbHeight(limit);
      paint(scroll, limit);
    };

    const l = lenisRef.current;
    let detach: () => void;
    if (l) {
      l.on('scroll', onScroll);
      detach = () => l.off('scroll', onScroll);
    } else {
      window.addEventListener('scroll', onScroll, { passive: true });
      detach = () => window.removeEventListener('scroll', onScroll);
    }

    const onResize = () => {
      measureTrack();
      const { scroll, limit } = readScroll();
      updateThumbHeight(limit);
      paint(scroll, limit);
    };
    window.addEventListener('resize', onResize);

    // Seed initial geometry + position.
    const init = readScroll();
    updateThumbHeight(init.limit);
    paint(init.scroll, init.limit);

    return () => {
      detach();
      window.removeEventListener('resize', onResize);
    };
  }, [enabled, lenis, measureTrack, updateThumbHeight, paint, readScroll]);

  // Window-level drag move/up while dragging the thumb.
  useEffect(() => {
    if (!enabled) return;

    const onMove = (e: PointerEvent) => {
      const d = dragRef.current;
      if (!d.active) return;
      const g = geomRef.current;
      const travel = Math.max(1, g.trackH - g.thumbH);
      let top = d.startTop + (e.clientY - d.startPointerY);
      top = Math.min(travel, Math.max(0, top));
      // Position the thumb directly (crisp 1:1) ...
      if (thumbRef.current) thumbRef.current.style.transform = `translateY(${top}px)`;
      if (fillRef.current) fillRef.current.style.height = `${top + g.thumbH}px`;
      // ... and drive the page to match.
      const { limit } = readScroll();
      const y = (top / travel) * limit;
      const l = lenisRef.current;
      if (l) l.scrollTo(y, { immediate: true });
      else window.scrollTo(0, y);
    };

    const onUp = () => {
      if (!dragRef.current.active) return;
      dragRef.current.active = false;
      railRef.current?.classList.remove('is-dragging');
      document.body.style.userSelect = '';
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    };
  }, [enabled, readScroll]);

  const onThumbDown = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const rail = railRef.current;
    const thumb = thumbRef.current;
    if (!rail || !thumb) return;
    const startTop = thumb.getBoundingClientRect().top - rail.getBoundingClientRect().top;
    dragRef.current = { active: true, startPointerY: e.clientY, startTop };
    rail.classList.add('is-dragging');
    document.body.style.userSelect = 'none';
  };

  // Click on the track (not the thumb): smooth-jump so the thumb centres there.
  const onRailDown = (e: React.PointerEvent) => {
    if (e.target === thumbRef.current) return;
    const rail = railRef.current;
    if (!rail) return;
    const g = geomRef.current;
    const rect = rail.getBoundingClientRect();
    const travel = Math.max(1, g.trackH - g.thumbH);
    let top = e.clientY - rect.top - g.thumbH / 2;
    top = Math.min(travel, Math.max(0, top));
    const { limit } = readScroll();
    const y = (top / travel) * limit;
    const l = lenisRef.current;
    if (l) l.scrollTo(y, { immediate: false });
    else window.scrollTo({ top: y, behavior: 'smooth' });
  };

  if (!enabled) return null;

  return (
    <div
      ref={railRef}
      className="kz-scrollbar"
      onPointerDown={onRailDown}
      role="presentation"
      aria-hidden="true"
    >
      <div ref={fillRef} className="kz-scrollbar__fill" />
      <div ref={thumbRef} className="kz-scrollbar__thumb" onPointerDown={onThumbDown} />
    </div>
  );
}
