'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils/cn';

// ─────────────────────────────────────────────────────────────────────────────
// FlowingLightWaves — a looping, cinematic "dark blue flowing light waves" canvas
// backdrop that REPLACES the dark-blue ambient video (dark-blue.mp4) behind the
// site's `.section-ink` surfaces (StatsGrid, Industries, Footer, service detail).
// Zero download.
//
//   • deep navy → black base (radial, #002840 centre → #000000 edges) + a gentle
//     corner vignette to keep focus centred
//   • soft, glowing electric-blue / cyan streaks drift and undulate across the field
//     like slow silk ribbons / long-exposure light trails, concentrated toward the
//     centre & lower third and fading into the dark edges
//   • bloom comes from ADDITIVE blending (globalCompositeOperation:'lighter') of a
//     few layered strokes per streak — wide faint haze up to a bright pale-blue core —
//     so it glows on black with NO expensive shadow-blur; some strands sharp, some
//     soft (depth of field); brightness gently pulses
//   • continuous eased sines → seamless, no flicker, no hard cut
//
// Perf/altitude (mirrors the other canvas backdrops): one <canvas>, one rAF loop,
// DPR-capped, device-aware streak budget, paused when scrolled out of view or the tab
// is hidden. Under prefers-reduced-motion it is drawn ONCE, static (a still frame).
// ─────────────────────────────────────────────────────────────────────────────

interface FlowingLightWavesProps {
  className?: string;
}

type RGB = [number, number, number];
type Streak = {
  baseY: number; // 0..1 of height
  slope: number; // diagonal tilt
  a1: number; f1: number; s1: number; p1: number; // harmonic 1
  a2: number; f2: number; s2: number; p2: number; // harmonic 2
  vdA: number; vdS: number; vdP: number; // slow vertical drift
  col: RGB; // blue..cyan
  width: number; // core width (px)
  bright: number; // 0.5..1
  sharp: boolean; // sharp bright core vs soft blurred ribbon
  puS: number; puP: number; // brightness pulse
};

const BLUE: RGB = [0, 102, 204]; // #0066CC
const CYAN: RGB = [0, 170, 204]; // #00AACC
const CORE: RGB = [175, 215, 255]; // pale blue-white brightest highlight

function mix(a: RGB, b: RGB, t: number): RGB {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}

export function FlowingLightWaves({ className }: FlowingLightWavesProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;
    const container = containerRef.current;
    const canvas = canvasRef.current;
    const ctx0 = canvas.getContext('2d');
    if (!ctx0) return;
    const ctx: CanvasRenderingContext2D = ctx0;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const nav = navigator as Navigator & { deviceMemory?: number };
    const lowPower =
      (nav.hardwareConcurrency ?? 8) <= 4 ||
      (nav.deviceMemory ?? 8) <= 4 ||
      window.matchMedia('(pointer: coarse)').matches;

    let W = 0, H = 0, dpr = 1;
    let streaks: Streak[] = [];

    // Deterministic PRNG → the same pleasing arrangement every mount.
    let seed = 0x1a2b3c4d;
    const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
    const range = (a: number, b: number) => a + (b - a) * rnd();

    function build() {
      const n = lowPower ? 5 : 9;
      streaks = Array.from({ length: n }, (_, i) => {
        const sharp = i % 2 === 0;
        return {
          // Concentrate toward centre & lower third.
          baseY: range(0.34, 0.86),
          slope: range(-0.16, 0.16),
          a1: range(0.05, 0.13), f1: range(1.4, 2.8) / Math.max(1, W), s1: range(0.12, 0.3), p1: range(0, 6.28),
          a2: range(0.02, 0.06), f2: range(3.5, 6.5) / Math.max(1, W), s2: range(0.18, 0.4), p2: range(0, 6.28),
          vdA: range(0.02, 0.06), vdS: range(0.05, 0.12), vdP: range(0, 6.28),
          col: mix(BLUE, CYAN, rnd()),
          width: sharp ? range(1.6, 3) : range(5, 10),
          bright: range(0.55, 1),
          sharp,
          puS: range(0.25, 0.6), puP: range(0, 6.28),
        };
      });
    }

    function resize() {
      W = container.clientWidth;
      H = container.clientHeight;
      dpr = Math.min(lowPower ? 1.5 : 2, window.devicePixelRatio || 1);
      canvas.width = Math.max(1, Math.round(W * dpr));
      canvas.height = Math.max(1, Math.round(H * dpr));
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      build();
    }

    function drawStreak(st: Streak, t: number) {
      const yBase = (st.baseY + st.vdA * Math.sin(t * st.vdS + st.vdP)) * H;
      const step = Math.max(10, W / 64);
      const pts: Array<[number, number]> = [];
      for (let x = -step; x <= W + step; x += step) {
        const y =
          yBase +
          st.slope * (x - W / 2) +
          st.a1 * H * Math.sin(x * st.f1 + t * st.s1 + st.p1) +
          st.a2 * H * Math.sin(x * st.f2 - t * st.s2 + st.p2);
        pts.push([x, y]);
      }
      const pulse = 0.6 + 0.4 * Math.sin(t * st.puS + st.puP);
      const alpha = st.bright * pulse;
      const [r, g, b] = st.col;

      // Layered additive passes → bloom. Edge-fade gradient dissolves ends into dark.
      const passes = st.sharp
        ? [
            { w: st.width * 5, a: alpha * 0.05, c: st.col },
            { w: st.width * 2.2, a: alpha * 0.12, c: st.col },
            { w: st.width, a: alpha * 0.55, c: CORE }, // crisp pale-blue core
          ]
        : [
            { w: st.width * 3.2, a: alpha * 0.05, c: st.col }, // wide soft haze
            { w: st.width * 1.6, a: alpha * 0.11, c: st.col },
          ];

      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      for (const p of passes) {
        const [cr, cg, cb] = p.c === CORE ? CORE : [r, g, b];
        const grad = ctx.createLinearGradient(0, 0, W, 0);
        const col = `${cr | 0},${cg | 0},${cb | 0}`;
        grad.addColorStop(0, `rgba(${col},0)`);
        grad.addColorStop(0.18, `rgba(${col},${p.a.toFixed(3)})`);
        grad.addColorStop(0.82, `rgba(${col},${p.a.toFixed(3)})`);
        grad.addColorStop(1, `rgba(${col},0)`);
        ctx.strokeStyle = grad;
        ctx.lineWidth = p.w;
        ctx.beginPath();
        ctx.moveTo(pts[0][0], pts[0][1]);
        for (let i = 1; i < pts.length - 1; i++) {
          const midX = (pts[i][0] + pts[i + 1][0]) / 2;
          const midY = (pts[i][1] + pts[i + 1][1]) / 2;
          ctx.quadraticCurveTo(pts[i][0], pts[i][1], midX, midY); // smooth ribbon
        }
        ctx.stroke();
      }
    }

    function draw(time: number) {
      const t = time / 1000;
      // Base: deep navy centre → black edges (radial ≈ built-in vignette).
      const g0 = ctx.createRadialGradient(W * 0.5, H * 0.6, 0, W * 0.5, H * 0.6, Math.max(W, H) * 0.85);
      g0.addColorStop(0, '#002840');
      g0.addColorStop(0.45, '#001322');
      g0.addColorStop(1, '#000000');
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = g0;
      ctx.fillRect(0, 0, W, H);

      // Glowing streaks (additive bloom).
      ctx.globalCompositeOperation = 'lighter';
      for (const st of streaks) drawStreak(st, t);

      // Corner vignette to keep focus centred.
      ctx.globalCompositeOperation = 'source-over';
      const gv = ctx.createRadialGradient(W * 0.5, H * 0.5, Math.min(W, H) * 0.25, W * 0.5, H * 0.5, Math.max(W, H) * 0.72);
      gv.addColorStop(0, 'rgba(0,0,0,0)');
      gv.addColorStop(1, 'rgba(0,0,0,0.55)');
      ctx.fillStyle = gv;
      ctx.fillRect(0, 0, W, H);
    }

    // ── Loop / visibility control ──
    let raf = 0, running = false, visible = true;
    function frame(time: number) { draw(time); raf = requestAnimationFrame(frame); }
    function start() { if (running || !visible || reduce) return; running = true; raf = requestAnimationFrame(frame); }
    function stop() { running = false; if (raf) cancelAnimationFrame(raf); raf = 0; }

    resize();
    const ro = new ResizeObserver(() => { resize(); if (reduce) draw(0); });
    ro.observe(container);

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (!visible) stop();
        else if (reduce) draw(0);
        else start();
      },
      { rootMargin: '100px 0px' },
    );
    io.observe(container);

    const onVisibility = () => {
      if (document.hidden) stop();
      else if (visible && !reduce) start();
    };
    document.addEventListener('visibilitychange', onVisibility);

    if (reduce) draw(0);
    else start();

    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return (
    <div ref={containerRef} aria-hidden className={cn('pointer-events-none absolute inset-0 -z-10 overflow-hidden', className)}>
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
}
