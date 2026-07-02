'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils/cn';

// ─────────────────────────────────────────────────────────────────────────────
// HexGridBackground — an interactive honeycomb canvas that replaces a static
// video backdrop. Two layered motions:
//
//  1. CONTINUOUS — a diagonal "shimmer" wave travels across the field forever and
//     each tile breathes on its own phase, so the honeycomb is always subtly
//     alive (the ambient motion).
//  2. PER-TILE CURSOR — every hexagon springs toward a target set by its distance
//     to the pointer: the tile under the cursor pops (scales up), lifts, tilts a
//     touch, tints brand-blue and glows; a soft radial falloff makes the
//     neighbours ripple too. A per-tile lerp gives the rise/settle micro-motion.
//
// Perf/altitude: one <canvas>, one rAF loop, DPR-capped at 2, paused when the
// host scrolls out of view or the tab is hidden. Colours are read live from the
// brand CSS tokens. Under prefers-reduced-motion the ambient motion is disabled
// (static field) and the loop only wakes while the pointer is interacting.
// ─────────────────────────────────────────────────────────────────────────────

interface HexGridBackgroundProps {
  className?: string;
}

type Cell = {
  cx: number;
  cy: number;
  infl: number; // eased cursor influence 0..1
};

type RGB = [number, number, number];

const INFLUENCE_RADIUS = 150; // px — how far the cursor's ripple reaches
const HOVER_EASE = 0.16; // spring toward target influence
const REST_EASE = 0.09; // settle back when cursor leaves

function parseRGB(value: string, fallback: RGB): RGB {
  const s = value.trim();
  const hex = s.match(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (hex) {
    let h = hex[1];
    if (h.length === 3) h = h.split('').map((c) => c + c).join('');
    const n = parseInt(h, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  const rgb = s.match(/(\d+)[,\s]+(\d+)[,\s]+(\d+)/);
  if (rgb) return [+rgb[1], +rgb[2], +rgb[3]];
  return fallback;
}

export function HexGridBackground({ className }: HexGridBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Guard the refs first so `container`/`canvas` get NON-NULL inferred types —
    // those flow into the hoisted helper functions below (control-flow narrowing
    // alone would not reach them).
    if (!containerRef.current || !canvasRef.current) return;
    const container = containerRef.current;
    const canvas = canvasRef.current;
    const ctx0 = canvas.getContext('2d');
    if (!ctx0) return;
    const ctx: CanvasRenderingContext2D = ctx0;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ── Brand colours (read once from the design tokens) ──
    const css = getComputedStyle(document.documentElement);
    const accent = parseRGB(css.getPropertyValue('--color-accent-primary'), [33, 150, 243]);
    const accent2 = parseRGB(css.getPropertyValue('--color-accent-secondary'), [135, 206, 235]);

    // ── State ──
    let cells: Cell[] = [];
    let W = 0;
    let H = 0;
    let dpr = 1;
    let R = 34; // hex radius (centre → vertex), flat-top

    const mouse = { x: -9999, y: -9999, active: false };
    let rect: DOMRect = container.getBoundingClientRect();

    // Flat-top hexagon vertex offsets (unit radius), computed once.
    const VERT: Array<[number, number]> = [];
    for (let i = 0; i < 6; i++) {
      const a = (Math.PI / 180) * (60 * i);
      VERT.push([Math.cos(a), Math.sin(a)]);
    }

    function buildGrid() {
      cells = [];
      // Responsive tile size: a touch smaller on narrow screens so the honeycomb
      // keeps its density without exploding the tile count.
      R = Math.max(24, Math.min(38, W / 26));
      const colStep = 1.5 * R;
      const rowStep = Math.sqrt(3) * R;
      const cols = Math.ceil(W / colStep) + 2;
      const rows = Math.ceil(H / rowStep) + 2;
      for (let c = -1; c < cols; c++) {
        for (let r = -1; r < rows; r++) {
          const cx = c * colStep;
          const cy = r * rowStep + (c & 1 ? rowStep / 2 : 0);
          cells.push({ cx, cy, infl: 0 });
        }
      }
    }

    function resize() {
      rect = container.getBoundingClientRect();
      W = container.clientWidth;
      H = container.clientHeight;
      dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.max(1, Math.round(W * dpr));
      canvas.height = Math.max(1, Math.round(H * dpr));
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildGrid();
    }

    function hexPath(cx: number, cy: number, r: number, rot: number) {
      const cos = Math.cos(rot);
      const sin = Math.sin(rot);
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const [vx, vy] = VERT[i];
        // rotate the unit vertex, then scale + translate
        const x = cx + (vx * cos - vy * sin) * r;
        const y = cy + (vx * sin + vy * cos) * r;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
    }

    function draw(time: number) {
      ctx.clearRect(0, 0, W, H);
      const [ar, ag, ab] = accent;
      const [sr, sg, sb] = accent2;
      let anyInfluence = false;

      for (const cell of cells) {
        // ── Ambient motion. EVERY tile is always drifting, rocking and breathing
        //    (not just a colour wave), so the honeycomb is visibly, continuously
        //    moving everywhere — no hover needed. A brighter light-band also
        //    sweeps across on top for depth. ──
        let band = 0;
        let floatX = 0;
        let floatY = 0;
        let spin = 0;
        let breathe = 0;
        if (!reduce) {
          // ONE coherent wave travelling diagonally from TOP-LEFT → BOTTOM-RIGHT.
          // The phase depends on the diagonal coordinate (cx + cy): every tile on
          // the same anti-diagonal moves together, and `ω·t − k·diag` marches the
          // crests toward the bottom-right. Two wavelengths (same direction) give
          // an organic-but-orderly swell instead of the old per-tile randomness.
          const diag = cell.cx + cell.cy;
          const s =
            Math.sin(time * 0.0016 - diag * 0.006) * 0.65 +
            Math.sin(time * 0.0011 - diag * 0.013) * 0.35; // -1..1
          const s01 = Math.min(1, Math.max(0, 0.5 + 0.5 * s));
          breathe = s * 0.08; // swell ±8% as the crest passes
          spin = s * 0.16; // rock in sync (±~9°)
          // Surge along the travel direction (1,1)/√2 — tiles physically flow
          // toward the bottom-right as each crest sweeps over them.
          const surge = s * 4.5;
          floatX = surge * 0.7071;
          floatY = surge * 0.7071;
          band = s01 * s01 * (3 - 2 * s01); // a bright blue band rides the crest
        }

        // ── Cursor proximity → target influence (smoothstep falloff) ──
        let target = 0;
        if (mouse.active) {
          const dx = cell.cx - mouse.x;
          const dy = cell.cy - mouse.y;
          const d = Math.hypot(dx, dy);
          if (d < INFLUENCE_RADIUS) {
            const t = 1 - d / INFLUENCE_RADIUS;
            target = t * t * (3 - 2 * t);
          }
        }
        const ease = target > cell.infl ? HOVER_EASE : REST_EASE;
        cell.infl += (target - cell.infl) * ease;
        if (cell.infl > 0.002) anyInfluence = true;
        const infl = cell.infl;

        // ── Geometry: base gap, diagonal-wave swell/surge/rock, hover pop/lift ──
        const scale = 0.8 + breathe + infl * 0.34;
        const lift = infl * 7; // hovered tiles rise
        const rot = spin + infl * 0.16; // wave rock + hover nudge
        const cx = cell.cx + floatX;
        const cy = cell.cy + floatY - lift;

        // ── Colour: a light-blue honeycomb with a BLUE band sweeping through it,
        //    ramping to strong brand-blue + glow on hover. Kept clearly visible at
        //    rest so the moving grid always reads. ──
        const fillA = 0.03 + band * 0.2 + infl * 0.5;
        const strokeA = 0.09 + band * 0.2 + infl * 0.5;
        const tint = Math.min(1, band * 0.7 + infl); // sky → primary blue
        const mr = Math.round(sr + (ar - sr) * tint);
        const mg = Math.round(sg + (ag - sg) * tint);
        const mb = Math.round(sb + (ab - sb) * tint);

        hexPath(cx, cy, R * scale * 0.92, rot);

        if (infl > 0.08) {
          ctx.shadowColor = `rgba(${ar},${ag},${ab},${0.5 * infl})`;
          ctx.shadowBlur = 18 * infl;
        } else {
          ctx.shadowBlur = 0;
        }

        ctx.fillStyle = `rgba(${mr},${mg},${mb},${fillA})`;
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.lineWidth = 1 + infl * 0.6;
        ctx.strokeStyle = `rgba(${mr},${mg},${mb},${strokeA})`;
        ctx.stroke();
      }

      return anyInfluence;
    }

    // ── Loop control (wake-on-demand under reduced motion) ──
    let raf = 0;
    let running = false;
    let visible = true;

    function frame(time: number) {
      const active = draw(time);
      // Under reduced motion there's no ambient — idle out when nothing's moving.
      if (reduce && !mouse.active && !active) {
        running = false;
        return;
      }
      raf = requestAnimationFrame(frame);
    }
    function start() {
      if (running || !visible) return;
      running = true;
      raf = requestAnimationFrame(frame);
    }
    function stop() {
      running = false;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    }

    // ── Pointer (tracked on the window so it works behind the hero content) ──
    function onPointerMove(e: PointerEvent) {
      const inside =
        e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom;
      mouse.active = inside;
      if (inside) {
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
        if (reduce) start(); // wake to animate the interaction
      }
    }
    function onPointerLeaveDoc() {
      mouse.active = false;
    }

    // ── Wiring ──
    resize();
    const ro = new ResizeObserver(() => {
      resize();
      if (reduce && !running) draw(0);
    });
    ro.observe(container);

    const onScroll = () => {
      rect = container.getBoundingClientRect();
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    document.addEventListener('pointerleave', onPointerLeaveDoc);

    // Pause when scrolled out of view (perf) — mirrors the site's backdrop policy.
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (!visible) stop();
        else if (!reduce) start();
        else draw(0);
      },
      { rootMargin: '100px 0px' }
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
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerleave', onPointerLeaveDoc);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return (
    <div ref={containerRef} aria-hidden className={cn('absolute inset-0 overflow-hidden', className)}>
      <canvas ref={canvasRef} className="block h-full w-full" />
      {/* Soft vignette so the hero copy stays crisp over the busiest tiles. */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(120% 90% at 50% 42%, transparent 40%, rgba(255,255,255,0.35) 100%)',
        }}
      />
    </div>
  );
}
