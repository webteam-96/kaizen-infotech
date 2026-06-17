'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useLenis } from './SmoothScroll';
import { useScrollStore } from '@/lib/store/scroll-store';

/**
 * CustomScrollbar — a brand-coloured vertical scroll rail pinned to the right
 * edge. The bright gradient trail + thumb show how far the reader has scrolled
 * (reached); the faint track below shows what's left. It doubles as a real
 * scrollbar: the thumb is draggable and the track is click-to-jump, both routed
 * through Lenis so the motion matches the rest of the site's smooth scrolling.
 *
 * The native page scrollbar is hidden in globals.css; this replaces it. Shown
 * only on fine-pointer (desktop) devices — touch devices have no persistent
 * scrollbar to replace and dragging a thin rail there is awkward.
 */
export default function CustomScrollbar() {
  const { lenis } = useLenis();
  const lenisRef = useRef(lenis);
  lenisRef.current = lenis;

  const railRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);

  const [enabled, setEnabled] = useState(false);

  const draggingRef = useRef(false);
  const dragOffsetRef = useRef(0);
  // Cached geometry so the per-scroll render does no layout reads.
  const dimsRef = useRef({ track: 0, thumb: 40, max: 1, scrollable: false });

  // Enable only where a persistent scrollbar exists (mouse/trackpad).
  useEffect(() => {
    const mq = window.matchMedia('(pointer: fine)');
    const apply = () => setEnabled(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  const scrollTo = useCallback((y: number, immediate: boolean) => {
    const l = lenisRef.current;
    if (l) l.scrollTo(y, { immediate });
    else window.scrollTo({ top: y, behavior: immediate ? 'auto' : 'smooth' });
  }, []);

  // Re-measure track / document / viewport. Thumb height mirrors the visible
  // fraction of the page, exactly like a native scrollbar thumb.
  const recompute = useCallback(() => {
    const rail = railRef.current;
    if (!rail) return;
    const trackH = rail.clientHeight;
    const docH = document.documentElement.scrollHeight;
    const viewH = window.innerHeight;
    const max = docH - viewH;
    const scrollable = max > 4;
    const ratio = docH > 0 ? viewH / docH : 1;
    const thumbH = Math.max(48, Math.min(trackH, trackH * ratio));

    dimsRef.current = { track: trackH, thumb: thumbH, max: Math.max(1, max), scrollable };
    rail.style.display = scrollable ? '' : 'none';
    if (thumbRef.current) thumbRef.current.style.height = `${thumbH}px`;
  }, []);

  // Paint thumb position + filled (reached) trail from a 0–1 progress value.
  const render = useCallback((progress: number) => {
    const { track, thumb } = dimsRef.current;
    const p = Math.min(1, Math.max(0, progress));
    const travel = Math.max(0, track - thumb);
    const top = travel * p;
    if (thumbRef.current) thumbRef.current.style.transform = `translateY(${top}px)`;
    if (fillRef.current) fillRef.current.style.height = `${top + thumb}px`;
  }, []);

  // Subscribe to scroll progress + keep geometry fresh on resize / reflow.
  useEffect(() => {
    if (!enabled) return;
    recompute();
    render(useScrollStore.getState().scrollProgress);

    const unsub = useScrollStore.subscribe((s) => render(s.scrollProgress));

    const onResize = () => {
      recompute();
      render(useScrollStore.getState().scrollProgress);
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(document.documentElement);
    window.addEventListener('resize', onResize);

    return () => {
      unsub();
      ro.disconnect();
      window.removeEventListener('resize', onResize);
    };
  }, [enabled, recompute, render]);

  // Drag handling (thumb) + window-level move/up while dragging.
  useEffect(() => {
    if (!enabled) return;

    const onMove = (e: PointerEvent) => {
      if (!draggingRef.current) return;
      const rail = railRef.current;
      if (!rail) return;
      const rect = rail.getBoundingClientRect();
      const { track, thumb, max } = dimsRef.current;
      const travel = Math.max(1, track - thumb);
      let top = e.clientY - rect.top - dragOffsetRef.current;
      top = Math.min(travel, Math.max(0, top));
      scrollTo((top / travel) * max, true);
    };

    const onUp = () => {
      if (!draggingRef.current) return;
      draggingRef.current = false;
      railRef.current?.classList.remove('is-dragging');
      document.body.style.userSelect = '';
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, [enabled, scrollTo]);

  const onThumbPointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const thumb = thumbRef.current;
    if (!thumb) return;
    draggingRef.current = true;
    dragOffsetRef.current = e.clientY - thumb.getBoundingClientRect().top;
    railRef.current?.classList.add('is-dragging');
    document.body.style.userSelect = 'none';
  };

  // Click anywhere on the track: smooth-jump so the thumb centres there.
  const onRailPointerDown = (e: React.PointerEvent) => {
    if (e.target === thumbRef.current) return;
    const rail = railRef.current;
    if (!rail) return;
    const rect = rail.getBoundingClientRect();
    const { track, thumb, max } = dimsRef.current;
    const travel = Math.max(1, track - thumb);
    let top = e.clientY - rect.top - thumb / 2;
    top = Math.min(travel, Math.max(0, top));
    scrollTo((top / travel) * max, false);
  };

  if (!enabled) return null;

  return (
    <div
      ref={railRef}
      className="kz-scrollbar"
      onPointerDown={onRailPointerDown}
      role="presentation"
      aria-hidden="true"
    >
      <div ref={fillRef} className="kz-scrollbar__fill" />
      <div ref={thumbRef} className="kz-scrollbar__thumb" onPointerDown={onThumbPointerDown} />
    </div>
  );
}
