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
  /**
   * Palette. `'blue'` (default) is the sky→brand honeycomb used behind the
   * about-page hero. `'mono'` is a light-grey lattice with a luminous WHITE
   * wave — the landing-page backdrop that replaces the old background video.
   */
  variant?: 'blue' | 'mono';
  /**
   * Ambient wave shape. `'diagonal'` (top-left → bottom-right, default) or
   * `'horizontal'` (sweeps in from one side) are travelling waves; `'radial'`
   * is a water-ripple — concentric crests expanding from a bottom-centre origin
   * (so the visible arcs read as semicircles).
   */
  waveDirection?: 'diagonal' | 'horizontal' | 'radial';
  /** For a horizontal wave, which side it enters from. Default `'left'`. */
  waveFrom?: 'left' | 'right';
  /**
   * When false the canvas is fully inert — no grid built, no rAF, no listeners.
   * The landing hero passes `active={loaderComplete}` so this (heavy) honeycomb
   * never runs behind the intro loader while the Spline scene + Three.js cube are
   * still booting on a cold load. Defaults to true (the about hero runs at once).
   */
  active?: boolean;
}

type Cell = {
  cx: number;
  cy: number;
  infl: number; // eased cursor influence 0..1
  // Per-tile scatter randomness (precomputed once) → the mono hover "disperse"
  // effect: a fixed random direction, a jitter magnitude, and a spin factor so
  // hovered tiles burst apart chaotically rather than uniformly.
  sx: number;
  sy: number;
  jit: number;
  spn: number;
};

type RGB = [number, number, number];

const INFLUENCE_RADIUS = 150; // px — how far the cursor's ripple reaches
const HOVER_EASE = 0.16; // spring toward target influence
const REST_EASE = 0.09; // settle back when cursor leaves
const SCATTER_MAX = 46; // px — how far a fully-hovered mono tile flings apart

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

export function HexGridBackground({
  className,
  variant = 'blue',
  waveDirection = 'diagonal',
  waveFrom = 'left',
  active = true,
}: HexGridBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mono = variant === 'mono';

  useEffect(() => {
    // Do nothing while inactive (e.g. behind the intro loader): no grid, no rAF,
    // no listeners — so the heavy canvas never competes with the Spline/Three.js
    // boot on a cold first load. It spins up the moment `active` flips true.
    if (!active) return;
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
    // Weak-device heuristic (few cores / little RAM / touch): the mono grid drops
    // to a coarser, lower-DPR, glow-free mode so first-time users on phones and
    // low-end laptops get a smooth hero instead of a janky one.
    const nav = navigator as Navigator & { deviceMemory?: number };
    const lowPower =
      (nav.hardwareConcurrency ?? 8) <= 4 ||
      (nav.deviceMemory ?? 8) <= 4 ||
      window.matchMedia('(pointer: coarse)').matches;

    // ── Brand colours (read once from the design tokens) ──
    const css = getComputedStyle(document.documentElement);
    const accent = parseRGB(css.getPropertyValue('--color-accent-primary'), [33, 150, 243]);
    const accent2 = parseRGB(css.getPropertyValue('--color-accent-secondary'), [135, 206, 235]);

    // ── Tile-tint endpoints: rest colour → crest colour (what the wave/hover
    //    ramps toward), plus the bloom colour used for the glow. ──
    //    blue: sky-blue → brand-blue.  mono: WHITE at rest → light BLUE (brand
    //    sky-blue) at the ripple crest and, much more strongly, on hover — a
    //    white honeycomb with blue ripples (over a soft blue-white stage).
    const cRest: RGB = mono ? [255, 255, 255] : accent2;
    const cCrest: RGB = mono ? accent2 : accent;
    const glow: RGB = mono ? accent2 : accent;

    // ── Wave geometry. `horizontal` enters from one side; `diagonal` flows along
    //    (1,1)/√2; `radial` is a water-ripple — concentric crests expanding from
    //    an origin, with each tile bobbing along its own radial direction. ──
    const horiz = waveDirection === 'horizontal';
    const radial = waveDirection === 'radial';
    const travelX = horiz ? (waveFrom === 'left' ? 1 : -1) : 0.7071;
    const travelY = horiz ? 0 : 0.7071;
    // Ring wavelength: radial packs the crests closer (tighter, more numerous
    // ripples); travelling waves keep the original, broader wavelength.
    const k1 = radial ? 0.013 : 0.006;
    const k2 = radial ? 0.026 : 0.013;
    // Max |slope| of the two-wave sum — normalises the emboss (3D relief) term.
    const slopeMax = 0.65 * k1 + 0.35 * k2;

    // ── Honeycomb density. blue keeps its original responsive radius. mono is a
    //    fine honeycomb, but its tile COUNT is capped to a device-aware BUDGET
    //    (R grows until cells ≤ target) so a cold load or a weak device never
    //    chokes on tens of thousands of tiles. Low-power → fewer tiles + lower DPR.
    const monoCellTarget = lowPower ? 2000 : 5500;
    const cellMinR = mono ? 9 : 24; // finest radius allowed
    const cellMaxR = mono ? 30 : 38; // coarsest radius allowed
    const restScale = mono ? 0.96 : 0.8; // tile size (fraction of R) at rest
    const fillMult = mono ? 0.98 : 0.92; // draw-radius multiplier → wall thickness
    const waveSurge = mono ? 1.2 : 4.5; // px the crest nudges each tile
    const waveBreathe = mono ? 0.06 : 0.08; // swell fraction as the crest passes
    // Full DPR (capped at 2) on every variant so the crisp hex edges are never
    // up-scaled into softness — the landing background must stay perfectly sharp.
    // Perf is held by the tile-count budget + load-gating, not by blurring pixels.
    const dprCap = 2;

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
      // mono: choose R so the tile count meets the device budget. A flat-top hex
      // grid packs ≈ W·H / (2.598·R²) cells, so R = √(W·H / (2.598·target)) hits
      // the target regardless of screen size (ultra-wide can't explode the count).
      // blue: the original responsive radius (W/26, clamped).
      R = mono
        ? Math.max(cellMinR, Math.min(cellMaxR, Math.sqrt((W * H) / (2.598 * monoCellTarget))))
        : Math.max(cellMinR, Math.min(cellMaxR, W / 26));
      const colStep = 1.5 * R;
      const rowStep = Math.sqrt(3) * R;
      const cols = Math.ceil(W / colStep) + 2;
      const rows = Math.ceil(H / rowStep) + 2;
      for (let c = -1; c < cols; c++) {
        for (let r = -1; r < rows; r++) {
          const cx = c * colStep;
          const cy = r * rowStep + (c & 1 ? rowStep / 2 : 0);
          // Fixed random scatter direction / jitter / spin for the hover disperse.
          const ang = Math.random() * Math.PI * 2;
          cells.push({
            cx,
            cy,
            infl: 0,
            sx: Math.cos(ang),
            sy: Math.sin(ang),
            jit: 0.5 + Math.random(), // 0.5 … 1.5
            spn: Math.random() * 2 - 1, // −1 … 1
          });
        }
      }
    }

    function resize() {
      rect = container.getBoundingClientRect();
      W = container.clientWidth;
      H = container.clientHeight;
      dpr = Math.min(dprCap, window.devicePixelRatio || 1);
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
      const [rr, rgC, rb] = cRest; // tile colour at rest
      const [cr, cg, cb] = cCrest; // tile colour at the wave/hover crest
      const [gr, gg, gb] = glow; // bloom colour
      // Ripple origin (radial mode): just off the LEFT edge, mid-height — so the
      // crests expand rightward as semicircular arcs, a ripple flowing left→right.
      const originX = -W * 0.08;
      const originY = H * 0.5;
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
        let slopeN = 0; // normalised wave slope (−1..1) → mono 3D emboss
        if (!reduce) {
          // ONE coherent wave whose phase depends on a single "wave coordinate"
          // so every tile on the same wavefront moves together and `ω·t − k·coord`
          // marches the crests along it. Two wavelengths give an organic swell.
          //  · radial  → coord = distance from the ripple origin; crests expand
          //    outward as concentric rings and each tile bobs along its own radial
          //    direction (water ripple).
          //  · horizontal/diagonal → coord is a linear axis and the surge is a
          //    fixed travel direction (the original travelling wave).
          let coord: number;
          let sdx = travelX; // surge direction for this tile
          let sdy = travelY;
          if (radial) {
            const dxr = cell.cx - originX;
            const dyr = cell.cy - originY;
            const dist = Math.hypot(dxr, dyr) || 1;
            coord = dist;
            sdx = dxr / dist; // outward (radial) bob
            sdy = dyr / dist;
          } else {
            coord = horiz ? (waveFrom === 'left' ? cell.cx : W - cell.cx) : cell.cx + cell.cy;
          }
          const a1 = time * 0.0016 - coord * k1;
          const a2 = time * 0.0011 - coord * k2;
          const s = Math.sin(a1) * 0.65 + Math.sin(a2) * 0.35; // height -1..1
          if (mono) {
            // Wave slope along the travel axis (d/dcoord). Its sign lights the
            // leading edge of each ripple and shadows the trailing edge → 3D.
            const slope = Math.cos(a1) * (0.65 * k1) + Math.cos(a2) * (0.35 * k2);
            slopeN = Math.max(-1, Math.min(1, slope / slopeMax));
          }
          const s01 = Math.min(1, Math.max(0, 0.5 + 0.5 * s));
          breathe = s * waveBreathe; // swell as the crest passes
          spin = s * 0.16; // rock in sync (±~9°)
          // Surge along the wave direction — tiles physically flow/bob with each
          // crest as it passes (radial for the ripple, else the travel axis).
          const surge = s * waveSurge;
          floatX = surge * sdx;
          floatY = surge * sdy;
          band = s01 * s01 * (3 - 2 * s01); // a bright band rides the crest
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

        // ── Geometry: base gap, wave swell/surge/rock, and — for mono — the
        //    hover SCATTER. Hovered tiles disperse: flung away from the cursor
        //    (radial push blended with each tile's own random direction), tumbled
        //    by a random spin, and shrunk + faded as they fly out — so the cluster
        //    bursts apart chaotically and the area clears. It all rides `infl`
        //    (eased fast-in / slow-out), so when the cursor leaves the tiles fly
        //    back along their path and reassemble the honeycomb. ──
        let scatterX = 0;
        let scatterY = 0;
        let scatterSpin = 0;
        let scatterShrink = 0;
        let scatterFade = 1;
        if (mono && infl > 0.001) {
          const dxm = cell.cx - mouse.x;
          const dym = cell.cy - mouse.y;
          const dm = Math.hypot(dxm, dym) || 1;
          const acc = infl * infl; // ease-in: scatter accelerates near the cursor
          const dist = acc * SCATTER_MAX;
          // radial push opens a clearing; the tile's random dir adds the chaos.
          scatterX = (dxm / dm) * 0.6 * dist + cell.sx * cell.jit * dist;
          scatterY = (dym / dm) * 0.6 * dist + cell.sy * cell.jit * dist;
          scatterSpin = infl * cell.spn * 7; // tumble
          scatterShrink = infl * 0.42; // shrink as it disperses
          scatterFade = 1 - infl * 0.6; // fade as it scatters (clears the centre)
        }
        // blue variant keeps the original hover pop/lift; mono scatters instead.
        const scale = mono
          ? restScale + breathe - scatterShrink
          : restScale + breathe + infl * 0.34;
        const lift = mono ? 0 : infl * 7; // hovered tiles rise (blue only)
        const rot = spin + (mono ? scatterSpin : infl * 0.16);
        const cx = cell.cx + floatX + scatterX;
        const cy = cell.cy + floatY - lift + scatterY;

        // ── Colour.
        //  · blue: the original light-blue honeycomb with a BLUE band sweeping
        //    through it, ramping to brand-blue + glow on hover (unchanged).
        //  · mono: a light-GREY honeycomb that tints toward light BLUE where the
        //    ripple crest passes (subtle) and far more strongly under the cursor,
        //    with a slope-based EMBOSS (bright leading edge / dark trailing edge)
        //    giving every ripple a 3D relief on the flat canvas. ──
        let mr: number;
        let mg: number;
        let mb: number;
        let fillA: number;
        let strokeA: number;
        if (mono) {
          // white → light-blue: a touch on the ambient ripple, full under cursor.
          const blueTint = Math.min(1, band * 0.7 + infl);
          const br = rr + (cr - rr) * blueTint;
          const bgc = rgC + (cg - rgC) * blueTint;
          const bbc = rb + (cb - rb) * blueTint;
          // 3D emboss, tinted BLUE (never white): the lit leading edge lerps
          // toward a bright LIGHT-BLUE highlight and the trailing edge toward a
          // deep BLUE shadow — so the moving ripple stays blue everywhere and
          // never washes out to white, while still reading clearly 3D. Strongest
          // along the crest.
          const em = slopeN * (0.4 + 0.6 * band); // -1..1 (lit … shadow)
          const k = Math.abs(em) * 0.9;
          // Relief strictly on the WHITE↔BLUE axis: lit edge → WHITE, shadow edge
          // → a clear medium BLUE (never the old dark navy, which read black-grey).
          const tR = em >= 0 ? 255 : 64;
          const tG = em >= 0 ? 255 : 146;
          const tB = em >= 0 ? 255 : 224;
          mr = Math.round(br + (tR - br) * k);
          mg = Math.round(bgc + (tG - bgc) * k);
          mb = Math.round(bbc + (tB - bbc) * k);
          // Hover raises opacity (infl ≫ band) but the scatter then fades tiles
          // out as they disperse (× scatterFade), so the cluster bursts, brightens
          // blue, and thins to nothing at full fling. Higher base stroke than the
          // old grey so the WHITE lattice still reads on the soft blue-white stage.
          fillA = (0.008 + band * 0.12 + infl * 0.55) * scatterFade;
          strokeA = (0.26 + band * 0.28 + infl * 0.85) * scatterFade;
        } else {
          fillA = 0.03 + band * 0.2 + infl * 0.5;
          strokeA = 0.09 + band * 0.2 + infl * 0.5;
          const tint = Math.min(1, band * 0.7 + infl);
          mr = Math.round(rr + (cr - rr) * tint);
          mg = Math.round(rgC + (cg - rgC) * tint);
          mb = Math.round(rb + (cb - rb) * tint);
        }

        hexPath(cx, cy, R * scale * fillMult, rot);

        // Bloom (a soft shadow-blur glow) is BLUE-variant only. The mono landing
        // background must stay perfectly crisp — NO blur anywhere — so its hover
        // reads through the scatter + colour + opacity alone, never a blur halo.
        const bloom = infl;
        if (!mono && bloom > 0.08) {
          ctx.shadowColor = `rgba(${gr},${gg},${gb},${0.5 * bloom})`;
          ctx.shadowBlur = 18 * bloom;
        } else {
          ctx.shadowBlur = 0;
        }

        // Skip the fill on near-transparent tiles (mono only): on the tiny dense
        // grid most rest cells have an invisible ~0.008 fill, so filling them is
        // wasted work — stroke-only there. Ripple/hover cells still fill. (blue
        // always fills, so the about-hero variant is unchanged.)
        if (!mono || fillA > 0.03) {
          ctx.fillStyle = `rgba(${mr},${mg},${mb},${fillA})`;
          ctx.fill();
        }
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
    // Palette/wave props are compile-time constants at every call site; `active`
    // flips once (false→true) when the loader clears. On any change the cleanup
    // above tears the canvas down and it rebuilds (or, if inactive, stays inert).
  }, [mono, waveDirection, waveFrom, active]);

  return (
    <div ref={containerRef} aria-hidden className={cn('absolute inset-0 overflow-hidden', className)}>
      <canvas ref={canvasRef} className="block h-full w-full" />
      {/* Soft vignette so the hero copy stays crisp over the busiest tiles.
          blue fades to white; mono fades to the soft blue-white stage (#e9eef8)
          so the edges dissolve into the stage with NO grey wash — the field stays
          strictly white-and-blue. (A gradient, not a blur.) */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: mono
            ? 'radial-gradient(150% 120% at 50% 45%, transparent 62%, rgba(233,238,248,0.45) 100%)'
            : 'radial-gradient(120% 90% at 50% 42%, transparent 40%, rgba(255,255,255,0.35) 100%)',
        }}
      />
    </div>
  );
}
