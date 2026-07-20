'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils/cn';

// ─────────────────────────────────────────────────────────────────────────────
// HexPrismBackground — a looping, abstract 3D honeycomb of hexagonal pillars,
// recreating the ambient "backdrop-rubix" video as a lightweight canvas (zero
// download). Same brief as the iso cube field, but with HEXAGON tops instead of
// diamonds:
//
//   • a honeycomb of flat-top hexagonal prisms, vertically squashed to a fixed
//     ~30° tilt so we see each hexagon top + its three front walls
//   • an almost entirely white / off-white palette, low-contrast matte faces,
//     soft ambient-occlusion in the gaps — no colour, no gradients
//   • pillars gently EXTRUDE up and settle back in a slow, staggered, eased wave —
//     a travelling ripple over an otherwise flat, "breathing" honeycomb surface
//   • far pillars (top of frame) haze toward white = a slight depth-of-field
//   • continuous sines → seamless, no cut; camera locked (a whisper of drift)
//
// Perf/altitude (mirrors HexGridBackground): one <canvas>, one rAF loop, DPR-capped,
// device-aware tile size, paused when scrolled out of view or the tab is hidden.
// Under prefers-reduced-motion it is drawn ONCE, static (a still honeycomb).
// ─────────────────────────────────────────────────────────────────────────────

interface HexPrismBackgroundProps {
  className?: string;
  /**
   * When false the canvas is fully inert — no grid, no rAF, no listeners. The hero
   * passes `active={loaderComplete}` so the field never runs behind the intro loader
   * while the Spline scene + three.js cube are still booting on a cold load.
   */
  active?: boolean;
}

type RGB = [number, number, number];
type Cell = { c: number; r: number; sx: number; syBase: number };

// Matte, low-contrast, near-white faces + a soft AO edge. No colour, no gradients.
const TOP: RGB = [250, 251, 253]; // brightest face — catches the top light
const RIGHT: RGB = [212, 216, 226]; // lower-right wall
const BOTTOM: RGB = [194, 199, 212]; // bottom wall (faces the viewer/down — darkest)
const LEFT: RGB = [204, 208, 220]; // lower-left wall
const EDGE: RGB = [164, 171, 189]; // soft ambient-occlusion line in the gaps
const HAZE: RGB = [244, 246, 250]; // far pillars fade toward this (airy DoF)

// Flat-top hexagon unit vertices (angles 0..300°, screen y DOWN). v1 & v2 are the
// two LOWER vertices, so the three front (viewer-facing) walls are edges 0-1, 1-2, 2-3.
const H3 = Math.sqrt(3) / 2;
const VERT: Array<[number, number]> = [
  [1, 0], [0.5, H3], [-0.5, H3], [-1, 0], [-0.5, -H3], [0.5, -H3],
];
const WALLS: Array<[number, number, RGB]> = [
  [0, 1, RIGHT],
  [1, 2, BOTTOM],
  [2, 3, LEFT],
];

function mix(a: RGB, b: RGB, t: number): RGB {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}
const rgba = (c: RGB, a: number) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a.toFixed(3)})`;

export function HexPrismBackground({ className, active = true }: HexPrismBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!active) return;
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

    const Q = 0.58; // vertical squash → the fixed ~30° camera tilt

    let W = 0, H = 0, dpr = 1;
    let hexR = 48, colStep = 72, rowStep = 48;
    let bodyH = 28, extrudeMax = 56, farY = 0;
    let cells: Cell[] = [];

    function build() {
      hexR = lowPower ? Math.max(50, W / 9) : Math.max(40, Math.min(58, W / 14));
      colStep = 1.5 * hexR;
      rowStep = Math.sqrt(3) * hexR * Q;
      bodyH = hexR * Q * 1.0; // flat "resting" pillar height
      extrudeMax = hexR * Q * 2.0; // how far a crest pillar rises
      farY = H * 0.34; // top third = far field (DoF haze)
      const ox = W / 2;
      const oy = -rowStep * 2;

      const cMax = Math.ceil((W / 2 + hexR * 2) / colStep) + 1;
      const rMax = Math.ceil((H + rowStep * 4 - oy) / rowStep) + 1;
      const list: Cell[] = [];
      for (let c = -cMax; c <= cMax; c++) {
        const yoff = c & 1 ? rowStep / 2 : 0;
        for (let r = -3; r <= rMax; r++) {
          const sx = ox + c * colStep;
          const syBase = oy + r * rowStep + yoff;
          if (sx < -hexR * 2 || sx > W + hexR * 2 || syBase < -rowStep * 3 || syBase > H + rowStep * 3) continue;
          list.push({ c, r, sx, syBase });
        }
      }
      // Painter's order: back (top) → front (bottom) so front pillars overlap.
      list.sort((a, b) => a.syBase - b.syBase);
      cells = list;
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

    // Breathing wave: phase-shifted sines summed → a travelling ripple. Only the
    // crests rise (pow 1.6), so most pillars rest flat while a soft wave passes over.
    function extrudeAt(c: number, r: number, t: number): number {
      const a = Math.sin(c * 0.6 + t * 0.55);
      const b = Math.sin(r * 0.7 - t * 0.47);
      const d = Math.sin((c + 2 * r) * 0.35 + t * 0.72);
      const up = Math.max(0, (a + b + d) / 3);
      return extrudeMax * Math.pow(up, 1.6);
    }

    function drawPrism(cell: Cell, t: number, driftX: number) {
      const sx = cell.sx + driftX;
      const syBase = cell.syBase;
      const height = bodyH + extrudeAt(cell.c, cell.r, t);
      const syTop = syBase - height;

      const near = Math.max(0, Math.min(1, (syBase - farY) / (H - farY)));
      const haze = (1 - near) * 0.45;
      const edgeA = 0.55 * near + 0.16;
      const lift = Math.min(1, (height - bodyH) / extrudeMax);

      // Top + ground vertices (ground = footprint at syBase).
      const tx: number[] = [], ty: number[] = [], gx: number[] = [], gy: number[] = [];
      for (let i = 0; i < 6; i++) {
        const ox = VERT[i][0] * hexR;
        const oy = VERT[i][1] * hexR * Q;
        tx[i] = sx + ox; ty[i] = syTop + oy;
        gx[i] = sx + ox; gy[i] = syBase + oy;
      }

      // Three front walls.
      for (const [a, b, col] of WALLS) {
        ctx.beginPath();
        ctx.moveTo(tx[a], ty[a]);
        ctx.lineTo(tx[b], ty[b]);
        ctx.lineTo(gx[b], gy[b]);
        ctx.lineTo(gx[a], gy[a]);
        ctx.closePath();
        ctx.fillStyle = rgba(mix(col, HAZE, haze), 1);
        ctx.fill();
      }

      // Top hexagon (drawn last → on top). A hair brighter when raised.
      ctx.beginPath();
      ctx.moveTo(tx[0], ty[0]);
      for (let i = 1; i < 6; i++) ctx.lineTo(tx[i], ty[i]);
      ctx.closePath();
      ctx.fillStyle = rgba(mix(mix(TOP, HAZE, haze), [255, 255, 255], lift * 0.22), 1);
      ctx.fill();
      ctx.lineJoin = 'round';
      ctx.lineWidth = 1;
      ctx.strokeStyle = rgba(EDGE, edgeA);
      ctx.stroke();
    }

    function draw(time: number) {
      const t = time / 1000;
      ctx.clearRect(0, 0, W, H);
      const driftX = reduce ? 0 : Math.sin(t * 0.05) * (hexR * 0.12); // whisper of camera drift
      const tt = reduce ? 2.3 : t; // reduced motion → a fixed, pleasant frozen wave
      for (const cell of cells) drawPrism(cell, tt, driftX);
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
  }, [active]);

  return (
    <div ref={containerRef} aria-hidden className={cn('absolute inset-0 overflow-hidden', className)}>
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
}
