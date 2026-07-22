'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils/cn';

// ─────────────────────────────────────────────────────────────────────────────
// HexDomeBackground — the Rubik's-section motion background, recreating the
// client's reference video ("BackDrop Rubix Section.mp4"): a minimalist clean-
// tech 3D scene made of
//
//   · TWO MASSIVE CONVEX DOMES flanking the frame (lower-left and upper-right),
//     each the visible cap of a huge sphere, covered in a high-density
//     honeycomb — light-grey FILLED hexagons separated by white lattice gaps;
//   · perspective + curvature: cells are large near the frame edges and
//     compress/foreshorten toward each dome's limb, where the surface fades
//     into the light — a central vanishing region;
//   · a BRIGHT RADIAL GLOW at the central vanishing point over a soft white/
//     light-grey monochrome stage;
//   · MOTION: the hex pattern slowly ROLLS along each curved surface
//     (a rotation of the sphere about a tangent axis). The roll offset loops
//     over one lattice period (3R), so the motion is endless and seamless.
//
// Implementation: true 3D. Each dome is a sphere (centre C, radius Rs) in
// camera space; a flat hex lattice (shared unique-vertex/cell topology, built
// once per resize) is wrapped onto the sphere via two tangent-frame angles and
// perspective-projected per frame. Cells are culled at the limb (facing → 0)
// and shaded by "haze" (limb proximity), quantized into buckets so the whole
// dome draws as a handful of batched paths.
//
// Render scheme (chosen for speed — strokes are canvas' most expensive op):
//   1. the dome's visible CAP is filled white in ONE path (the limb circle is
//      analytic: centre C·(1−ratio²), radius Rs·√(1−ratio²), in the e1/e2
//      plane — projected as a ~64-gon);
//   2. every visible cell is filled ONCE, shrunk toward its centre — the white
//      cap showing through the gaps IS the honeycomb lattice. Cell fills lerp
//      grey→white with haze, so the pattern dissolves at the limb for free.
// No strokes anywhere. Painting runs at ≤30fps (the roll is glacial — extra
// frames buy nothing) on a canvas rendered below native resolution and
// CSS-upscaled (invisible for a soft background, big raster saving).
//
// Perf/altitude (mirrors the other canvas backdrops): one <canvas>, one rAF,
// DPR-capped, IntersectionObserver + visibilitychange pausing, `active` prop
// gating (inert until the intro loader clears). Under prefers-reduced-motion a
// single static frame is drawn. Palette is strictly white/grey.
// ─────────────────────────────────────────────────────────────────────────────

interface HexDomeBackgroundProps {
  className?: string;
  /**
   * When false the canvas is fully inert — no lattice, no rAF, no listeners.
   * The hero passes `active={loaderComplete}` so the field never runs behind
   * the intro loader while the Spline scene + three.js cube are booting.
   */
  active?: boolean;
}

/** One dome: the visible cap of a huge sphere flanking the frame. */
type DomeCfg = {
  /** Screen-fraction point the cap centre faces (the dome's "bulge" pixel). */
  sx: number;
  sy: number;
  /** Sphere-centre distance from the camera, in units of the focal length. */
  dist: number;
  /** Sphere radius as a fraction of that distance (bigger → wider dome). */
  ratio: number;
  /** Lattice orientation in the tangent plane (radians). */
  rot: number;
  /** Roll speed along the surface, lattice px/s (sign = direction). */
  roll: number;
};

// Tuned against the reference frames: lower-left dome + upper-right dome, the
// diagonal channel between their limbs passing through the central glow.
const DOME_L: DomeCfg = { sx: 0.02, sy: 1.04, dist: 2.6, ratio: 0.5, rot: -0.55, roll: 5 };
const DOME_R: DomeCfg = { sx: 0.98, sy: -0.06, dist: 2.6, ratio: 0.5, rot: -0.55, roll: -5 };

// Monochrome palette (sampled from the reference video).
const CELL_GREY: [number, number, number] = [221, 223, 227]; // near-cell fill
const NBD = 14; // shade buckets — cells batched per bucket into one fill

export function HexDomeBackground({ className, active = true }: HexDomeBackgroundProps) {
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

    // ── Viewport / projection (rebuilt on resize) ──
    let W = 0;
    let H = 0;
    let dpr = 1;
    let cx = 0;
    let cy = 0;
    let F = 1200; // focal length (px)
    let HEXR = 26; // hex radius on the sphere surface (world px)
    let PERIOD = 78; // 3·HEXR — the lattice's repeat along the roll axis
    let cullR2 = Infinity; // (limb arc + margin)² — trig-free lattice pre-cull

    // Per-dome frame data (computed on resize).
    type DomeRT = DomeCfg & {
      C: [number, number, number]; // sphere centre (camera space)
      Rs: number; // sphere radius
      e1: [number, number, number]; // tangent frame (roll axis direction)
      e2: [number, number, number];
      e3: [number, number, number]; // sphere centre → camera (cap centre normal)
    };
    let domes: DomeRT[] = [];

    // ── Shared lattice topology (unique verts + hex cells), built per resize ──
    let vlx: Float32Array = new Float32Array(0); // vertex lattice coords
    let vly: Float32Array = new Float32Array(0);
    let cellVerts: Int32Array = new Int32Array(0); // 6 vertex ids per cell
    let clx: Float32Array = new Float32Array(0); // cell centre lattice coords
    let cly: Float32Array = new Float32Array(0);
    let nCells = 0;
    // Per-frame scratch (sized per resize).
    let px: Float32Array = new Float32Array(0); // projected vertex x/y
    let py: Float32Array = new Float32Array(0);
    let cellSX: Float32Array = new Float32Array(0); // projected cell centre
    let cellSY: Float32Array = new Float32Array(0);
    let bucketOf: Int32Array = new Int32Array(0);
    let bucketIdx: Int32Array = new Int32Array(0);
    let vertStamp: Int32Array = new Int32Array(0); // mark-and-map: frame stamp per vertex
    let stamp = 0;
    const bucketCount = new Int32Array(NBD);
    const bucketKSum = new Float64Array(NBD);

    let bgGrad: CanvasGradient | null = null;
    let glowGrad: CanvasGradient | null = null;
    let coreGrad: CanvasGradient | null = null;

    function buildLattice() {
      // Lattice extent: cover the visible cap (arc Rs·acos(ratio)) plus one
      // roll period of margin so the mod-PERIOD roll wrap happens off-cap.
      const capArc = domes[0].Rs * Math.acos(domes[0].ratio);
      const EXT = capArc * 1.12 + PERIOD;
      // Trig-free per-frame pre-cull radius: lattice points beyond the limb
      // arc (plus margin) can never be drawn — reject them on r² alone before
      // paying for mapPoint's trig. (Both domes share dist/ratio, so one
      // threshold serves both.)
      cullR2 = (capArc * 1.05) ** 2;
      const colStep = 1.5 * HEXR;
      const rowStep = Math.sqrt(3) * HEXR;

      const vertKey = new Map<string, number>();
      const lxs: number[] = [];
      const lys: number[] = [];
      const cells: number[] = [];
      const cxs: number[] = [];
      const cys: number[] = [];

      const vid = (x: number, y: number) => {
        const key = `${Math.round(x * 2)},${Math.round(y * 2)}`;
        let id = vertKey.get(key);
        if (id === undefined) {
          id = lxs.length;
          vertKey.set(key, id);
          lxs.push(x);
          lys.push(y);
        }
        return id;
      };

      const cMax = Math.ceil(EXT / colStep);
      const rMax = Math.ceil(EXT / rowStep);
      for (let c = -cMax; c <= cMax; c++) {
        const yoff = c & 1 ? rowStep / 2 : 0;
        for (let r = -rMax; r <= rMax; r++) {
          const hx = c * colStep;
          const hy = r * rowStep + yoff;
          if (hx * hx + hy * hy > EXT * EXT) continue;
          for (let i = 0; i < 6; i++) {
            const a = (Math.PI / 3) * i;
            cells.push(vid(hx + HEXR * Math.cos(a), hy + HEXR * Math.sin(a)));
          }
          cxs.push(hx);
          cys.push(hy);
        }
      }

      vlx = Float32Array.from(lxs);
      vly = Float32Array.from(lys);
      cellVerts = Int32Array.from(cells);
      clx = Float32Array.from(cxs);
      cly = Float32Array.from(cys);
      nCells = cxs.length;
      px = new Float32Array(vlx.length);
      py = new Float32Array(vlx.length);
      cellSX = new Float32Array(nCells);
      cellSY = new Float32Array(nCells);
      bucketOf = new Int32Array(nCells);
      bucketIdx = new Int32Array(nCells);
      vertStamp = new Int32Array(vlx.length);
      stamp = 0;
    }

    function buildDomes() {
      domes = [DOME_L, DOME_R].map((cfg) => {
        // View ray through the cap-centre pixel.
        const rx = (cfg.sx * W - cx) / F;
        const ry = (cfg.sy * H - cy) / F;
        const rl = Math.hypot(rx, ry, 1);
        const d: [number, number, number] = [rx / rl, ry / rl, 1 / rl];
        const Dc = cfg.dist * F;
        const C: [number, number, number] = [d[0] * Dc, d[1] * Dc, d[2] * Dc];
        const Rs = cfg.ratio * Dc;
        const e3: [number, number, number] = [-d[0], -d[1], -d[2]];
        // Tangent frame: e1 (roll axis) from the rot angle in screen plane.
        const r0: [number, number, number] = [Math.cos(cfg.rot), Math.sin(cfg.rot), 0];
        const dot3 = r0[0] * e3[0] + r0[1] * e3[1] + r0[2] * e3[2];
        let e1: [number, number, number] = [
          r0[0] - e3[0] * dot3,
          r0[1] - e3[1] * dot3,
          r0[2] - e3[2] * dot3,
        ];
        const l1 = Math.hypot(...e1) || 1;
        e1 = [e1[0] / l1, e1[1] / l1, e1[2] / l1];
        const e2: [number, number, number] = [
          e3[1] * e1[2] - e3[2] * e1[1],
          e3[2] * e1[0] - e3[0] * e1[2],
          e3[0] * e1[1] - e3[1] * e1[0],
        ];
        return { ...cfg, C, Rs, e1, e2, e3 };
      });
    }

    let prevW = -1;
    let prevH = -1;
    let prevDpr = -1;
    function resize() {
      const w = container.clientWidth;
      const h = container.clientHeight;
      // Deliberately sub-native: the canvas is CSS-upscaled. A soft background
      // survives this invisibly and the raster cost drops with the pixel count.
      const d = Math.min(lowPower ? 1.1 : 1.5, window.devicePixelRatio || 1) * 0.78;
      // 0×0 = the host wrapper was display:none'd (section scrolled past). The
      // IntersectionObserver has already parked the rAF; keep the old lattice —
      // it is still valid for re-entry, and rebuilding at a fallback size would
      // just burn ms mid-scroll and have to be redone on the way back in.
      if (w === 0 || h === 0) return;
      // ResizeObserver refires with unchanged dims (e.g. the display toggle
      // round-trip) must not trigger a multi-ms lattice rebuild.
      if (w === prevW && h === prevH && d === prevDpr) return;
      prevW = w;
      prevH = h;
      prevDpr = d;
      W = w;
      H = h;
      dpr = d;
      canvas.width = Math.max(1, Math.round(W * dpr));
      canvas.height = Math.max(1, Math.round(H * dpr));
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      cx = W / 2;
      cy = H / 2;
      F = 0.9 * Math.max(W, H, 640);
      buildDomes();
      // Hex size: chosen so a cell at the cap front projects to ≈ the reference
      // density (~30px radius at 1440w, scaled with the viewport). lowPower
      // gets a coarser grid (fewer cells) — the look survives, the cost drops.
      const capFrontZ = domes[0].dist * (1 - domes[0].ratio) * F;
      // Cell size scales WITH the viewport (the 4K reference does the same) —
      // capping it would make the cell COUNT grow quadratically on big
      // monitors, and the per-frame cull cost with it.
      const targetScreenR = Math.max(15, Math.min(58, 0.015 * Math.max(W, H))) * (lowPower ? 1.35 : 1);
      HEXR = (targetScreenR * capFrontZ) / F;
      PERIOD = 3 * HEXR;
      buildLattice();

      // Stage: near-white centre feathering to light grey corners.
      bgGrad = ctx.createRadialGradient(cx, H * 0.45, 0, cx, H * 0.45, Math.hypot(W, H) * 0.62);
      bgGrad.addColorStop(0, '#fbfbfc');
      bgGrad.addColorStop(0.55, '#f1f2f4');
      bgGrad.addColorStop(1, '#e8e9ec');
      // Central glow: a broad soft wash + a bright core at the vanishing point.
      glowGrad = ctx.createRadialGradient(cx, H * 0.44, 0, cx, H * 0.44, Math.max(W, H) * 0.46);
      glowGrad.addColorStop(0, 'rgba(255,255,255,0.92)');
      glowGrad.addColorStop(0.4, 'rgba(255,255,255,0.25)');
      glowGrad.addColorStop(1, 'rgba(255,255,255,0)');
      coreGrad = ctx.createRadialGradient(cx, H * 0.44, 0, cx, H * 0.44, Math.max(W, H) * 0.16);
      coreGrad.addColorStop(0, 'rgba(255,255,255,1)');
      coreGrad.addColorStop(1, 'rgba(255,255,255,0)');
    }

    /** Wrap lattice point (lx, ly) onto the dome sphere; project to screen. */
    const o = { x: 0, y: 0, k: 0, facing: 0, ok: false };
    function mapPoint(dm: DomeRT, lx: number, ly: number) {
      const a = lx / dm.Rs; // angle along the roll axis
      const b = ly / dm.Rs; // angle across it
      const ca = Math.cos(a);
      const sa = Math.sin(a);
      const cb = Math.cos(b);
      const sb = Math.sin(b);
      // Unit normal on the sphere (orthonormal frame → exactly unit length).
      const nx = cb * (ca * dm.e3[0] + sa * dm.e1[0]) + sb * dm.e2[0];
      const ny = cb * (ca * dm.e3[1] + sa * dm.e1[1]) + sb * dm.e2[1];
      const nz = cb * (ca * dm.e3[2] + sa * dm.e1[2]) + sb * dm.e2[2];
      const Px = dm.C[0] + dm.Rs * nx;
      const Py = dm.C[1] + dm.Rs * ny;
      const Pz = dm.C[2] + dm.Rs * nz;
      if (Pz < 0.05 * F) {
        o.ok = false;
        return;
      }
      const k = F / Pz;
      o.x = cx + Px * k;
      o.y = cy + Py * k;
      o.k = k;
      // How squarely this surface point faces the camera (0 at the limb).
      const vl = Math.hypot(Px, Py, Pz) || 1;
      o.facing = -(nx * Px + ny * Py + nz * Pz) / vl;
      o.ok = true;
    }

    function drawDome(dm: DomeRT, t: number) {
      // Endless seamless roll: offset loops over one lattice period.
      const off = (((t * dm.roll) % PERIOD) + PERIOD) % PERIOD;

      // Mark-and-map: cull by cell centre FIRST, then project only the vertices
      // of surviving cells — most of the lattice sits past the limb and never
      // costs a projection.
      stamp++;
      bucketCount.fill(0);
      bucketKSum.fill(0);
      for (let ci = 0; ci < nCells; ci++) {
        const lxo = clx[ci] + off;
        const ly = cly[ci];
        // Cheap radial pre-cull: skip the trig for lattice points that cannot
        // possibly be on the visible cap.
        if (lxo * lxo + ly * ly > cullR2) {
          bucketOf[ci] = -1;
          continue;
        }
        mapPoint(dm, lxo, ly);
        // Cull: behind camera, past the limb, or fully off-screen.
        if (!o.ok || o.facing < 0.02) {
          bucketOf[ci] = -1;
          continue;
        }
        const m = 80;
        if (o.x < -m || o.x > W + m || o.y < -m || o.y > H + m) {
          bucketOf[ci] = -1;
          continue;
        }
        // Haze: cells whiten as the surface turns away toward the limb — the
        // dome dissolves into the central light exactly like the reference.
        // Fully-hazed cells are indistinguishable from the white cap beneath
        // them, so they're skipped outright.
        let haze = 1 - o.facing / 0.45;
        if (haze < 0) haze = 0;
        if (haze > 0.88) {
          bucketOf[ci] = -1;
          continue;
        }
        cellSX[ci] = o.x;
        cellSY[ci] = o.y;
        const bi = ((haze / 0.88) * NBD) | 0;
        bucketOf[ci] = bi;
        bucketCount[bi]++;
        bucketKSum[bi] += o.k;
        // Mark this cell's vertices for projection.
        const base = ci * 6;
        for (let i = 0; i < 6; i++) vertStamp[cellVerts[base + i]] = stamp;
      }
      // Project only the marked (visible-cell) vertices.
      for (let i = 0; i < vlx.length; i++) {
        if (vertStamp[i] !== stamp) continue;
        mapPoint(dm, vlx[i] + off, vly[i]);
        px[i] = o.ok ? o.x : NaN;
        py[i] = o.y;
      }
      // Counting sort → contiguous cell ids per bucket (no allocation).
      let acc = 0;
      const starts: number[] = new Array(NBD);
      for (let bi = 0; bi < NBD; bi++) {
        starts[bi] = acc;
        acc += bucketCount[bi];
      }
      const cursor = starts.slice();
      for (let ci = 0; ci < nCells; ci++) {
        const bi = bucketOf[ci];
        if (bi >= 0) bucketIdx[cursor[bi]++] = ci;
      }

      // 1) The white cap — one analytic path. The limb circle lives at centre
      //    C·(1−ratio²) with radius Rs·√(1−ratio²) in the e1/e2 plane; its
      //    projection bounds the whole visible surface, and its fill IS the
      //    honeycomb's white lattice (it shows through the cell gaps below).
      const mScale = 1 - dm.ratio * dm.ratio;
      const rl = dm.Rs * Math.sqrt(mScale);
      ctx.beginPath();
      for (let i = 0; i <= 64; i++) {
        const ps = (i / 64) * Math.PI * 2;
        const cp = Math.cos(ps);
        const sp = Math.sin(ps);
        const Px = dm.C[0] * mScale + rl * (cp * dm.e1[0] + sp * dm.e2[0]);
        const Py = dm.C[1] * mScale + rl * (cp * dm.e1[1] + sp * dm.e2[1]);
        const Pz = dm.C[2] * mScale + rl * (cp * dm.e1[2] + sp * dm.e2[2]);
        const k = F / Pz;
        const sx = cx + Px * k;
        const sy = cy + Py * k;
        if (i === 0) ctx.moveTo(sx, sy);
        else ctx.lineTo(sx, sy);
      }
      ctx.closePath();
      ctx.fillStyle = '#fcfcfd';
      ctx.fill();

      // 2) The cells — one batched fill per shade bucket, each hexagon shrunk
      //    toward its own centre so the cap's white shows through as the
      //    lattice lines. No strokes anywhere.
      const [gr, gg, gb] = CELL_GREY;
      for (let bi = 0; bi < NBD; bi++) {
        const n = bucketCount[bi];
        if (!n) continue;
        const haze = ((bi + 0.5) / NBD) * 0.88;
        // Fill: light grey → white as the cell approaches the limb/light.
        const mixT = 0.1 + 0.9 * haze;
        const fr = Math.round(gr + (255 - gr) * mixT);
        const fg = Math.round(gg + (255 - gg) * mixT);
        const fb = Math.round(gb + (255 - gb) * mixT);
        // Shrink factor sized so the white gap reads ≈ 2.6px on screen.
        const kAvg = bucketKSum[bi] / n;
        const s = Math.max(0.62, 1 - 2.6 / (1.732 * HEXR * kAvg));
        ctx.beginPath();
        const s0 = starts[bi];
        for (let j = 0; j < n; j++) {
          const ci = bucketIdx[s0 + j];
          const ccx = cellSX[ci];
          const ccy = cellSY[ci];
          const base = ci * 6;
          const v0 = cellVerts[base];
          if (Number.isNaN(px[v0])) continue;
          ctx.moveTo(ccx + (px[v0] - ccx) * s, ccy + (py[v0] - ccy) * s);
          let skip = false;
          for (let i = 1; i < 6; i++) {
            const v = cellVerts[base + i];
            if (Number.isNaN(px[v])) {
              skip = true;
              break;
            }
            ctx.lineTo(ccx + (px[v] - ccx) * s, ccy + (py[v] - ccy) * s);
          }
          if (!skip) ctx.closePath();
        }
        ctx.fillStyle = `rgb(${fr},${fg},${fb})`;
        ctx.fill();
      }
    }

    function draw(timeMs: number) {
      // Reduced motion → one pleasant frozen instant of the composition.
      const t = reduce ? 6.5 : timeMs / 1000;
      if (!bgGrad || !glowGrad || !coreGrad) return;
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, W, H);
      for (const dm of domes) drawDome(dm, t);
      // The central light sits over the limbs so both domes melt into it.
      ctx.fillStyle = glowGrad;
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = coreGrad;
      ctx.fillRect(0, 0, W, H);
    }

    // ── Loop / visibility control ──
    let raf = 0;
    let running = false;
    let visible = true;
    // The roll is glacial — painting above ~30fps buys nothing visible, so
    // every other vsync is skipped and the canvas costs half as much.
    let lastPaint = -1e9;
    function frame(time: number) {
      if (time - lastPaint >= 31) {
        lastPaint = time;
        draw(time);
      }
      raf = requestAnimationFrame(frame);
    }
    function start() {
      if (running || !visible || reduce) return;
      running = true;
      raf = requestAnimationFrame(frame);
    }
    function stop() {
      running = false;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    }

    resize();
    const ro = new ResizeObserver(() => {
      resize();
      if (reduce) draw(0);
    });
    ro.observe(container);

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (!visible) stop();
        else if (reduce) draw(0);
        else start();
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
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [active]);

  return (
    <div ref={containerRef} aria-hidden className={cn('absolute inset-0 overflow-hidden', className)}>
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
}
