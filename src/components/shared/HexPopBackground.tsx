'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils/cn';

// ─────────────────────────────────────────────────────────────────────────────
// HexPopBackground — a looping, high-key white honeycomb of 3D hexagonal tiles
// where random tiles pop toward the camera and sink back. Recreates the white
// ambient video (white-background.mp4) behind the work/service detail pages as a
// lightweight canvas (zero download).
//
//   • a flat, edge-to-edge honeycomb of POINTY-TOP hex tiles, straight-on view, with
//     small grout gaps; EVERY tile is softly BEVELED (a vertical dome gradient + a
//     light upper edge / soft lower-edge AO) so the whole wall reads three-dimensional
//   • bright, high-key near-white palette, faint cool-blue tint; gaps + the side walls
//     of raised tiles pick up a soft warm grey/tan; matte, low contrast, no vignette
//   • individual tiles RANDOMLY extrude toward the camera (no pan/wave/slide) and
//     retract; a raised tile lifts, reveals SHADED side walls (a real little prism),
//     brightens, and casts a soft drop shadow — only a small scattered fraction active
//     at once → a calm 3D "breathing", blinking-depth surface
//   • per-tile phase-shifted sines (eased pop, ~1–2s out-and-back) → seamless loop
//   • a faint global top-light adds gentle studio illumination
//
// Perf/altitude: one <canvas>, one rAF loop, DPR-capped, device-aware tile size,
// paused when scrolled out of view or the tab is hidden. Under prefers-reduced-motion
// it is drawn ONCE, static (a still honeycomb with a scattered few tiles raised).
// ─────────────────────────────────────────────────────────────────────────────

interface HexPopBackgroundProps {
  className?: string;
  /** Viewport-fixed (for a tall page <main>) vs absolute (fills one section). */
  fixed?: boolean;
}

type RGB = [number, number, number];
type Tile = { hx: number; hy: number; period: number; phase: number; maxE: number; thr: number };

const GROUT: RGB = [213, 219, 228]; // cool light grey in the gaps
const TOP_HI: RGB = [255, 255, 255]; // dome highlight (upper part of a tile)
const TOP_MID: RGB = [240, 245, 251]; // pale blue-white mid
const TOP_LO: RGB = [225, 231, 240]; // slightly darker lower part → soft dome
const WALL_HI: RGB = [217, 212, 199]; // lit side wall (warm grey, ~#D9D4C7)
const WALL_LO: RGB = [199, 196, 188]; // shadowed side wall (~#C7C4BC)
const AO: RGB = [193, 201, 213]; // soft ambient-occlusion edge
const SHADOW: RGB = [128, 128, 122]; // warm-grey soft drop shadow

// Pointy-top hexagon unit vertices (top vertex first; screen y DOWN).
// index 0=top, 1=upper-right, 2=lower-right, 3=bottom, 4=lower-left, 5=upper-left.
const VERT: Array<[number, number]> = Array.from({ length: 6 }, (_, i) => {
  const a = ((60 * i - 90) * Math.PI) / 180;
  return [Math.cos(a), Math.sin(a)];
});

function mix(a: RGB, b: RGB, t: number): RGB {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}
const csv = (c: RGB) => `${c[0] | 0},${c[1] | 0},${c[2] | 0}`;

export function HexPopBackground({ className, fixed = false }: HexPopBackgroundProps) {
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

    let W = 0, H = 0, dpr = 1, R = 90;
    let tiles: Tile[] = [];

    let seed = 0x51ed5eed;
    const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
    const range = (a: number, b: number) => a + (b - a) * rnd();

    function build() {
      R = lowPower ? Math.max(84, W / 12) : Math.max(64, Math.min(118, W / 16));
      const colStep = Math.sqrt(3) * R;
      const rowStep = 1.5 * R;
      const cols = Math.ceil(W / colStep) + 2;
      const rows = Math.ceil(H / rowStep) + 2;
      const list: Tile[] = [];
      for (let r = -1; r < rows; r++) {
        for (let c = -1; c < cols; c++) {
          list.push({
            hx: c * colStep + (r & 1 ? colStep / 2 : 0),
            hy: r * rowStep,
            period: range(8, 15), // slow: full cycle 8–15s
            phase: range(0, Math.PI * 2),
            maxE: range(0.65, 1), // varied pop height
            thr: range(0.72, 0.83), // only the crest of the sine raises the tile
          });
        }
      }
      tiles = list;
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

    function extr(tl: Tile, t: number): number {
      const raw = Math.sin((t * 2 * Math.PI) / tl.period + tl.phase);
      const m = (raw - tl.thr) / (1 - tl.thr);
      if (m <= 0) return 0;
      const s = m * m * (3 - 2 * m); // ease-in-out
      return s * tl.maxE;
    }

    function hexPathAt(pts: Array<[number, number]>) {
      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < 6; i++) ctx.lineTo(pts[i][0], pts[i][1]);
      ctx.closePath();
    }
    const verts = (cx: number, cy: number, rad: number): Array<[number, number]> =>
      VERT.map((v) => [cx + v[0] * rad, cy + v[1] * rad]);

    // Flat tile — a soft beveled dome so the resting wall already reads 3D.
    function flatTile(hx: number, hy: number) {
      const rad = R * 0.92;
      const pts = verts(hx, hy, rad);
      const g = ctx.createLinearGradient(hx, hy - rad, hx, hy + rad);
      g.addColorStop(0, `rgb(${csv(TOP_HI)})`);
      g.addColorStop(0.55, `rgb(${csv(TOP_MID)})`);
      g.addColorStop(1, `rgb(${csv(TOP_LO)})`);
      ctx.fillStyle = g;
      hexPathAt(pts);
      ctx.fill();
      // Bevel: bright upper edges (5→0→1), soft AO on lower edges (2→3→4).
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = 'rgba(255,255,255,0.55)';
      ctx.beginPath();
      ctx.moveTo(pts[5][0], pts[5][1]); ctx.lineTo(pts[0][0], pts[0][1]); ctx.lineTo(pts[1][0], pts[1][1]);
      ctx.stroke();
      ctx.strokeStyle = `rgba(${csv(AO)},0.5)`;
      ctx.beginPath();
      ctx.moveTo(pts[2][0], pts[2][1]); ctx.lineTo(pts[3][0], pts[3][1]); ctx.lineTo(pts[4][0], pts[4][1]);
      ctx.stroke();
    }

    // Raised tile — lifts toward the camera, revealing shaded side walls + a soft
    // drop shadow: a real little hexagonal prism.
    function pop3D(hx: number, hy: number, e: number) {
      const rBase = R * 0.92;
      const lift = e * R * 0.36;
      const rTop = rBase * (1 + e * 0.12);
      const cyTop = hy - lift;
      const bv = verts(hx, hy, rBase);
      const tv = verts(hx, cyTop, rTop);

      // Soft drop shadow beneath (radial → no blur), offset slightly down.
      const scx = hx, scy = hy + lift * 0.35;
      const sg = ctx.createRadialGradient(scx, scy, rBase * 0.3, scx, scy, rBase * 1.75);
      sg.addColorStop(0, `rgba(${csv(SHADOW)},${(e * 0.22).toFixed(3)})`);
      sg.addColorStop(1, `rgba(${csv(SHADOW)},0)`);
      ctx.fillStyle = sg;
      hexPathAt(verts(scx, scy, rBase * 1.75));
      ctx.fill();

      // Side walls for the four lower edges (right, lower-right, lower-left, left).
      const walls: Array<[number, number, RGB]> = [
        [1, 2, WALL_HI], [2, 3, WALL_LO], [3, 4, WALL_LO], [4, 5, WALL_HI],
      ];
      for (const [a, b, col] of walls) {
        ctx.beginPath();
        ctx.moveTo(tv[a][0], tv[a][1]);
        ctx.lineTo(tv[b][0], tv[b][1]);
        ctx.lineTo(bv[b][0], bv[b][1]);
        ctx.lineTo(bv[a][0], bv[a][1]);
        ctx.closePath();
        ctx.fillStyle = `rgb(${csv(col)})`;
        ctx.fill();
      }

      // Bright beveled top face (brightens as it rises).
      const hi = mix(TOP_HI, [255, 255, 255], e * 0.4);
      const lo = mix(TOP_MID, TOP_HI, e * 0.7);
      const tg = ctx.createLinearGradient(hx, cyTop - rTop, hx, cyTop + rTop);
      tg.addColorStop(0, `rgb(${csv(hi)})`);
      tg.addColorStop(1, `rgb(${csv(lo)})`);
      ctx.fillStyle = tg;
      hexPathAt(tv);
      ctx.fill();
      ctx.lineWidth = 1;
      ctx.strokeStyle = `rgba(${csv(AO)},0.4)`;
      ctx.stroke();
    }

    function render(t: number) {
      // Grout base.
      ctx.fillStyle = `rgb(${csv(GROUT)})`;
      ctx.fillRect(0, 0, W, H);

      const raised: Array<{ hx: number; hy: number; e: number }> = [];
      // Pass 1 — flat beveled honeycomb.
      for (const tl of tiles) {
        const e = reduce ? 0 : extr(tl, t);
        if (e > 0.02) raised.push({ hx: tl.hx, hy: tl.hy, e });
        flatTile(tl.hx, tl.hy);
      }
      // Pass 2 — raised prisms over the surface (least-raised first).
      raised.sort((a, b) => a.e - b.e);
      for (const p of raised) pop3D(p.hx, p.hy, p.e);

      // Faint global studio top-light (diffuse, brighter upper area). No vignette.
      const lg = ctx.createLinearGradient(0, 0, 0, H);
      lg.addColorStop(0, 'rgba(255,255,255,0.12)');
      lg.addColorStop(0.4, 'rgba(255,255,255,0)');
      lg.addColorStop(1, 'rgba(120,128,140,0.06)');
      ctx.fillStyle = lg;
      ctx.fillRect(0, 0, W, H);
    }

    // ── Loop / visibility control ──
    let raf = 0, running = false, visible = true;
    function frame(time: number) { render(time / 1000); raf = requestAnimationFrame(frame); }
    function start() { if (running || !visible || reduce) return; running = true; raf = requestAnimationFrame(frame); }
    function stop() { running = false; if (raf) cancelAnimationFrame(raf); raf = 0; }

    resize();
    const ro = new ResizeObserver(() => { resize(); if (reduce) render(3.1); });
    ro.observe(container);

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (!visible) stop();
        else if (reduce) render(3.1);
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

    if (reduce) render(3.1);
    else start();

    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden
      className={cn('pointer-events-none -z-10 overflow-hidden', fixed ? 'fixed inset-0' : 'absolute inset-0', className)}
      style={{ opacity: 0.4 }}
    >
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
}
