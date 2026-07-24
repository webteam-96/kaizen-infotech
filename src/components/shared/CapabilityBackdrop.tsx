'use client';

import { useEffect, useRef } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// CapabilityBackdrop — a per-card motion background for the Capabilities orbit
// carousel (ServiceCardDeck) on /services.
//
// One full-bleed <canvas> sits behind the 3D card ring. As the active card
// changes (scroll / drag / dots), the backdrop CROSSFADES to a different themed
// "blueprint" scene that illustrates that capability — glowing light-blue
// wireframe line-art on the ink navy, animating as if the thing is being built:
//
//   0  Custom Software Development  → a field of small website mock-ups being
//      assembled (browser frames, hero blocks, columns, a build scan-line)
//   1  Mobile App Development       → phones cycling through dummy app screens
//      (home / list / profile) with a bottom tab-bar + touch ripples
//   2  Event Registration & Mgmt    → a registration form filling in, a QR code
//      rendering + scanning, a ticket passing a check-in gate, a mini calendar
//   3  Enterprise Web Portals       → a portal dashboard (nav, KPIs, a populating
//      data table, a chart) + a responsive desktop/tablet/phone reflow trio
//   4  Digital Marketing            → analytics: a rising line chart, growing
//      bars, a conversion funnel and expanding "reach" pings
//
// The interesting detail lives in the side gutters (where the ring leaves empty
// space); a central radial scrim keeps the front card legible.
//
// Perf: one canvas, one rAF, DPR-capped, device-aware detail, paused when the
// section is off-screen or the tab is hidden. Under prefers-reduced-motion the
// active scene is drawn ONCE, static, and swaps instantly on card change.
// ─────────────────────────────────────────────────────────────────────────────

type RGB = [number, number, number];

const BASE_IN: RGB = [18, 33, 53]; // lifted navy at the centre of the base glow
const BASE_OUT: RGB = [8, 16, 28]; // deep ink at the edges (≈ --surface-ink)
const BLUE: RGB = [86, 170, 240]; // primary wireframe (brand --accent-on-ink)
const CYAN: RGB = [122, 220, 255]; // active accents / cursors / scan-lines
const SOFT: RGB = [128, 178, 245]; // secondary blocks
const WHITE: RGB = [206, 226, 255]; // text-line placeholders
const GREEN: RGB = [112, 226, 172]; // success / check-in
const AMBER: RGB = [255, 198, 122]; // warm accent dot
const VIOLET: RGB = [176, 156, 255]; // marketing / engagement accent

const TAU = Math.PI * 2;
const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const clampI = (v: number, lo: number, hi: number) => (v < lo ? lo : v > hi ? hi : v) | 0;
const smooth = (v: number) => {
  v = clamp01(v);
  return v * v * (3 - 2 * v);
};
const rgba = (c: RGB, a: number) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;
const cyc = (t: number, period: number, phase = 0) => {
  const p = (t / period + phase) % 1;
  return p < 0 ? p + 1 : p;
};
function prng(seed: number) {
  let s = seed >>> 0 || 1;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

// ── drawing primitives (all honour the caller's globalAlpha + composite) ──────
function rrPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  r = Math.min(r, w / 2, h / 2);
  if (r < 0) r = 0;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
function strokeGlow(ctx: CanvasRenderingContext2D, col: RGB, lw: number, halo: boolean, a = 0.82) {
  if (halo) {
    ctx.lineWidth = lw + 4;
    ctx.strokeStyle = rgba(col, 0.09);
    ctx.stroke();
  }
  ctx.lineWidth = lw;
  ctx.strokeStyle = rgba(col, a);
  ctx.stroke();
}
function frame(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number, col: RGB,
  opt: { fill?: number; lw?: number; halo?: boolean; a?: number } = {},
) {
  rrPath(ctx, x, y, w, h, r);
  if (opt.fill) {
    ctx.fillStyle = rgba(col, opt.fill);
    ctx.fill();
  }
  strokeGlow(ctx, col, opt.lw ?? 1.3, opt.halo ?? false, opt.a ?? 0.82);
}
function seg(
  ctx: CanvasRenderingContext2D,
  x1: number, y1: number, x2: number, y2: number, col: RGB, lw = 1.2, halo = false, a = 0.75,
) {
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  strokeGlow(ctx, col, lw, halo, a);
}
function bar(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, col: RGB, a = 0.14, r = 2) {
  if (w <= 0 || h <= 0) return;
  rrPath(ctx, x, y, w, h, Math.min(r, h / 2, w / 2));
  ctx.fillStyle = rgba(col, a);
  ctx.fill();
}
function circ(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, rad: number, col: RGB,
  opt: { fill?: number; lw?: number; halo?: boolean; a?: number } = {},
) {
  if (rad <= 0) return;
  ctx.beginPath();
  ctx.arc(cx, cy, rad, 0, TAU);
  if (opt.fill) {
    ctx.fillStyle = rgba(col, opt.fill);
    ctx.fill();
  }
  if (opt.lw) strokeGlow(ctx, col, opt.lw, opt.halo ?? false, opt.a ?? 0.82);
}
function rows(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, n: number, gap: number, col: RGB,
  opt: { a?: number; reveal?: number; lh?: number } = {},
) {
  const lh = opt.lh ?? 3;
  const shown = Math.ceil(n * clamp01(opt.reveal ?? 1));
  for (let i = 0; i < shown; i++) {
    const ww = w * (i % 3 === 2 ? 0.55 : i % 2 ? 0.82 : 1);
    bar(ctx, x, y + i * (gap + lh), ww, lh, col, opt.a ?? 0.4, lh / 2);
  }
}

function paintBase(ctx: CanvasRenderingContext2D, W: number, H: number) {
  ctx.globalCompositeOperation = 'source-over';
  const g = ctx.createRadialGradient(W * 0.5, H * 0.44, 0, W * 0.5, H * 0.5, Math.hypot(W, H) * 0.62);
  g.addColorStop(0, rgba(BASE_IN, 1));
  g.addColorStop(1, rgba(BASE_OUT, 1));
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
}

// ═════════════════════════ SCENE 0 — SOFTWARE ════════════════════════════════
function siteWindow(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, build: number, alpha: number, q: boolean, t: number,
) {
  if (alpha <= 0.02) return;
  const pa = ctx.globalAlpha;
  ctx.globalAlpha = pa * alpha;
  const r = Math.max(4, w * 0.03);
  frame(ctx, x, y, w, h, r, BLUE, { fill: 0.05, lw: 1.2, halo: q });
  const tb = Math.max(9, h * 0.13);
  seg(ctx, x, y + tb, x + w, y + tb, BLUE, 1, false, 0.5);
  for (let i = 0; i < 3; i++) {
    circ(ctx, x + 9 + i * 8, y + tb / 2, 2.1, [CYAN, AMBER, GREEN][i], { fill: 0.7 });
  }
  const px = x + w * 0.06, py = y + tb + h * 0.07, cw = w - w * 0.12, chh = h - tb - h * 0.13;
  const shown = build * 5;
  if (shown > 0.5) bar(ctx, px, py, cw, chh * 0.34, SOFT, 0.14, 3); // hero
  if (shown > 1.5) {
    const gy = py + chh * 0.42, gh = chh * 0.26, gw = (cw - w * 0.04) / 2;
    bar(ctx, px, gy, gw, gh, BLUE, 0.1, 2);
    bar(ctx, px + gw + w * 0.04, gy, gw, gh, BLUE, 0.1, 2);
  }
  if (shown > 2.5) rows(ctx, px, py + chh * 0.76, cw * 0.82, 3, 3.5, WHITE, { a: 0.4, reveal: clamp01(shown - 2.5), lh: 2.5 });
  if (build < 1) {
    const sy = y + tb + (h - tb) * clamp01(build / 0.85);
    seg(ctx, x + 2, sy, x + w - 2, sy, CYAN, 1.2, q, 0.85);
  } else {
    const pulse = 0.35 + 0.4 * (0.5 + 0.5 * Math.sin(t * 3));
    frame(ctx, x, y, w, h, r, CYAN, { lw: 1, a: pulse });
  }
  ctx.globalAlpha = pa;
}
function sceneSoftware(ctx: CanvasRenderingContext2D, W: number, H: number, t: number, q: boolean) {
  paintBase(ctx, W, H);
  ctx.globalCompositeOperation = 'lighter';
  // Minimal: one website mock-up assembling in each side gutter (centre kept clear).
  const buildOf = (phase: number) => {
    const p0 = cyc(t, 11, phase);
    return { build: smooth(p0 / 0.5), a: p0 > 0.86 ? 1 - smooth((p0 - 0.86) / 0.14) : 1 };
  };
  const w = clampI(W * 0.23, 190, 350), h = w * 0.72;
  const L = buildOf(0);
  siteWindow(ctx, W * 0.17 - w / 2, H * 0.46 - h / 2, w, h, L.build, L.a, q, t);
  const w2 = w * 0.92, h2 = h * 0.92, R = buildOf(0.5);
  siteWindow(ctx, W * 0.83 - w2 / 2, H * 0.55 - h2 / 2, w2, h2, R.build, R.a, q, t);
}

// ═════════════════════════ SCENE 1 — MOBILE ══════════════════════════════════
function appScreen(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, type: number, t: number,
) {
  const px = x + w * 0.08, iw = w * 0.84;
  // app bar
  bar(ctx, px, y + h * 0.05, iw * 0.5, h * 0.03, WHITE, 0.5, 2);
  seg(ctx, x + w * 0.72, y + h * 0.06, x + w * 0.9, y + h * 0.06, SOFT, 1.4, false, 0.6);
  seg(ctx, x + w * 0.72, y + h * 0.078, x + w * 0.9, y + h * 0.078, SOFT, 1.4, false, 0.6);
  const cy = y + h * 0.12;
  if (type === 0) {
    bar(ctx, px, cy, iw, h * 0.2, SOFT, 0.16, 4); // hero card
    for (let i = 0; i < 2; i++) bar(ctx, px, cy + h * 0.26 + i * h * 0.12, iw, h * 0.08, BLUE, 0.11, 3);
  } else if (type === 1) {
    frame(ctx, px, cy, iw, h * 0.06, h * 0.03, BLUE, { lw: 1, a: 0.5 }); // search
    for (let i = 0; i < 4; i++) {
      const ry = cy + h * 0.1 + i * h * 0.1;
      circ(ctx, px + h * 0.04, ry + h * 0.035, h * 0.03, SOFT, { fill: 0.18 });
      bar(ctx, px + h * 0.09, ry + h * 0.02, iw * 0.62, h * 0.02, WHITE, 0.4, 2);
      bar(ctx, px + h * 0.09, ry + h * 0.05, iw * 0.4, h * 0.016, BLUE, 0.28, 2);
    }
  } else {
    circ(ctx, x + w * 0.5, cy + h * 0.09, h * 0.07, SOFT, { fill: 0.16, lw: 1.2, a: 0.6 }); // avatar
    bar(ctx, x + w * 0.32, cy + h * 0.2, w * 0.36, h * 0.025, WHITE, 0.45, 2);
    for (let i = 0; i < 3; i++) bar(ctx, px, cy + h * 0.28 + i * h * 0.09, iw, h * 0.05, BLUE, 0.1, 3);
  }
}
function drawPhone(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, pw: number, phase: number, alpha: number, t: number, q: boolean,
) {
  const pa = ctx.globalAlpha;
  ctx.globalAlpha = pa * alpha;
  const ph = pw * 2.03, x = cx - pw / 2, y = cy - ph / 2, r = pw * 0.16;
  frame(ctx, x, y, pw, ph, r, BLUE, { fill: 0.06, lw: 1.5, halo: q });
  const sx = x + pw * 0.06, sy = y + ph * 0.05, sw = pw * 0.88, sh = ph * 0.9;
  frame(ctx, sx, sy, sw, sh, pw * 0.1, SOFT, { lw: 1, a: 0.35 });
  bar(ctx, cx - pw * 0.12, y + ph * 0.028, pw * 0.24, ph * 0.014, BLUE, 0.5, 3); // notch
  // status bar
  seg(ctx, sx + sw * 0.1, sy + sh * 0.028, sx + sw * 0.22, sy + sh * 0.028, WHITE, 1, false, 0.4);
  for (let i = 0; i < 3; i++) circ(ctx, sx + sw * 0.82 + i * sw * 0.06, sy + sh * 0.028, sw * 0.012, WHITE, { fill: 0.4 });
  // screens (clipped) with a slide transition
  const contentY = sy + sh * 0.06, contentH = sh * 0.82;
  const local = t / 3.6 + phase;
  const k = Math.floor(local) % 3;
  const frac = local - Math.floor(local);
  ctx.save();
  rrPath(ctx, sx, contentY, sw, contentH, pw * 0.06);
  ctx.clip();
  if (frac > 0.82) {
    const p = smooth((frac - 0.82) / 0.18);
    appScreen(ctx, sx - p * sw, contentY, sw, contentH, k, t);
    appScreen(ctx, sx + sw - p * sw, contentY, sw, contentH, (k + 1) % 3, t);
  } else {
    appScreen(ctx, sx, contentY, sw, contentH, k, t);
  }
  ctx.restore();
  // bottom tab bar
  const tby = sy + sh * 0.92;
  seg(ctx, sx, tby, sx + sw, tby, SOFT, 1, false, 0.3);
  for (let i = 0; i < 4; i++) {
    const tx = sx + sw * (0.16 + i * 0.23);
    const on = i === k;
    circ(ctx, tx, tby + sh * 0.04, sw * 0.03, on ? CYAN : SOFT, { fill: on ? 0.7 : 0.2 });
  }
  // touch ripple on the active tab, once per screen dwell
  const rp = frac < 0.6 ? smooth(frac / 0.6) : -1;
  if (rp >= 0) {
    const tx = sx + sw * (0.16 + k * 0.23);
    circ(ctx, tx, tby + sh * 0.04, sw * 0.03 + rp * sw * 0.14, CYAN, { lw: 1.2, a: 0.5 * (1 - rp) });
  }
  ctx.globalAlpha = pa;
}
function sceneMobile(ctx: CanvasRenderingContext2D, W: number, H: number, t: number, q: boolean) {
  paintBase(ctx, W, H);
  ctx.globalCompositeOperation = 'lighter';
  // Minimal: one phone cycling app screens in each side gutter.
  const pw = clampI(Math.min(W * 0.13, H * 0.26), 108, 172);
  drawPhone(ctx, W * 0.17, H * 0.5, pw, 0, 0.95, t, q);
  drawPhone(ctx, W * 0.83, H * 0.5, pw, 1.5, 0.95, t, q);
}

// ═════════════════════════ SCENE 2 — EVENTS ══════════════════════════════════
function drawQR(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, t: number, q: boolean) {
  frame(ctx, x - size * 0.12, y - size * 0.12, size * 1.24, size * 1.24, size * 0.08, BLUE, { fill: 0.05, lw: 1.2, halo: q });
  const n = 11, cell = size / n;
  const rnd = prng(0xa17c0de);
  const p = cyc(t, 6.5);
  const render = clamp01(p / 0.6);
  let idx = 0;
  const total = n * n;
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      const on = rnd() > 0.5;
      idx++;
      // finder squares at 3 corners
      const finder = (r < 3 && c < 3) || (r < 3 && c >= n - 3) || (r >= n - 3 && c < 3);
      if (!on && !finder) continue;
      if (idx / total > render) continue;
      bar(ctx, x + c * cell, y + r * cell, cell * 0.86, cell * 0.86, finder ? CYAN : SOFT, finder ? 0.6 : 0.42, 1);
    }
  }
  if (p > 0.6) {
    const s = (p - 0.6) / 0.4;
    if (s < 0.85) {
      const ly = y + size * smooth(s / 0.85);
      seg(ctx, x, ly, x + size, ly, GREEN, 1.4, true, 0.9);
    } else {
      const cx = x + size * 0.5, cyq = y + size * 0.5, rr = size * 0.16;
      seg(ctx, cx - rr, cyq, cx - rr * 0.3, cyq + rr * 0.7, GREEN, 2, true, 0.95);
      seg(ctx, cx - rr * 0.3, cyq + rr * 0.7, cx + rr, cyq - rr * 0.6, GREEN, 2, true, 0.95);
    }
  }
}
function drawForm(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, t: number, q: boolean) {
  frame(ctx, x, y, w, h, 8, BLUE, { fill: 0.05, lw: 1.3, halo: q });
  bar(ctx, x + w * 0.08, y + h * 0.09, w * 0.5, h * 0.04, WHITE, 0.5, 2); // title
  const fld = 4;
  const filled = Math.floor(cyc(t, 8) * (fld + 1.5));
  for (let i = 0; i < fld; i++) {
    const fy = y + h * 0.2 + i * h * 0.14;
    frame(ctx, x + w * 0.08, fy, w * 0.84, h * 0.09, 4, i < filled ? CYAN : SOFT, { lw: 1, a: i < filled ? 0.7 : 0.32 });
    if (i < filled) bar(ctx, x + w * 0.11, fy + h * 0.028, w * (0.3 + (i % 3) * 0.18), h * 0.032, CYAN, 0.4, 2);
    else if (i === filled) {
      const blink = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(t * 6));
      seg(ctx, x + w * 0.11, fy + h * 0.02, x + w * 0.11, fy + h * 0.07, CYAN, 1.4, false, blink);
    }
  }
  const done = filled >= fld;
  const by = y + h * 0.78;
  frame(ctx, x + w * 0.08, by, w * 0.84, h * 0.12, 5, done ? GREEN : SOFT, { fill: done ? 0.18 : 0.08, lw: 1.3, a: done ? 0.9 : 0.4, halo: done && q });
  if (done) {
    const cx = x + w * 0.5, cyb = by + h * 0.06, rr = h * 0.03;
    seg(ctx, cx - rr, cyb, cx - rr * 0.2, cyb + rr * 0.8, GREEN, 2, true, 0.95);
    seg(ctx, cx - rr * 0.2, cyb + rr * 0.8, cx + rr * 1.1, cyb - rr * 0.7, GREEN, 2, true, 0.95);
  } else {
    bar(ctx, x + w * 0.4, by + h * 0.045, w * 0.2, h * 0.03, WHITE, 0.4, 2);
  }
}
function sceneEvents(ctx: CanvasRenderingContext2D, W: number, H: number, t: number, q: boolean) {
  paintBase(ctx, W, H);
  ctx.globalCompositeOperation = 'lighter';
  // Minimal: a registration form in the left gutter, a QR check-in in the right.
  const fw = clampI(W * 0.2, 170, 300), fh = clampI(H * 0.52, 230, 430);
  drawForm(ctx, W * 0.18 - fw / 2, H * 0.5 - fh / 2, fw, fh, t, q);
  const qs = clampI(W * 0.11, 96, 165);
  drawQR(ctx, W * 0.82 - qs / 2, H * 0.5 - qs / 2, qs, t, q);
}

// ═════════════════════════ SCENE 3 — PORTALS ═════════════════════════════════
function portalWindow(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, t: number, q: boolean) {
  frame(ctx, x, y, w, h, 8, BLUE, { fill: 0.05, lw: 1.4, halo: q });
  const tb = h * 0.08;
  seg(ctx, x, y + tb, x + w, y + tb, BLUE, 1, false, 0.4);
  for (let i = 0; i < 3; i++) circ(ctx, x + 10 + i * 9, y + tb / 2, 2.2, [CYAN, AMBER, GREEN][i], { fill: 0.7 });
  frame(ctx, x + w * 0.55, y + tb * 0.28, w * 0.28, tb * 0.44, tb * 0.22, SOFT, { lw: 1, a: 0.4 }); // search
  circ(ctx, x + w * 0.92, y + tb / 2, tb * 0.22, SOFT, { fill: 0.25 }); // avatar
  // lock glyph (secure)
  const lx = x + w * 0.87, ly = y + tb / 2;
  frame(ctx, lx - 3, ly - 1, 6, 5, 1, GREEN, { lw: 1, a: 0.7 });
  ctx.beginPath();
  ctx.arc(lx, ly - 1, 2.4, Math.PI, 0);
  strokeGlow(ctx, GREEN, 1, false, 0.7);
  // left nav
  const navW = w * 0.2, navX = x, navY = y + tb;
  seg(ctx, navX + navW, navY, navX + navW, y + h, BLUE, 1, false, 0.35);
  const items = 5;
  const cur = Math.floor(cyc(t, 6) * items);
  for (let i = 0; i < items; i++) {
    const iy = navY + h * 0.1 + i * h * 0.14;
    if (i === cur) bar(ctx, navX + navW * 0.08, iy - h * 0.02, navW * 0.84, h * 0.09, CYAN, 0.14, 3);
    circ(ctx, navX + navW * 0.22, iy + h * 0.025, navW * 0.06, i === cur ? CYAN : SOFT, { fill: i === cur ? 0.7 : 0.3 });
    bar(ctx, navX + navW * 0.36, iy + h * 0.012, navW * 0.5, h * 0.025, i === cur ? WHITE : SOFT, i === cur ? 0.5 : 0.3, 2);
  }
  // main: KPI cards
  const mX = navX + navW + w * 0.04, mW = x + w - mX - w * 0.04;
  for (let i = 0; i < 3; i++) {
    const kx = mX + i * (mW / 3);
    frame(ctx, kx, navY + h * 0.08, mW / 3 - w * 0.02, h * 0.2, 5, SOFT, { fill: 0.06, lw: 1, a: 0.4 });
    const grow = smooth(cyc(t, 5, i * 0.2));
    bar(ctx, kx + w * 0.02, navY + h * 0.2, (mW / 3 - w * 0.06) * (0.4 + 0.6 * grow), h * 0.03, [CYAN, GREEN, VIOLET][i], 0.5, 2);
  }
  // data table
  const ty = navY + h * 0.34, tw = mW;
  seg(ctx, mX, ty, mX + tw, ty, SOFT, 1, false, 0.4);
  const rowsShown = Math.floor(cyc(t, 7) * 6) + 1;
  for (let i = 0; i < 6; i++) {
    const ry = ty + h * 0.05 + i * h * 0.095;
    const on = i < rowsShown;
    circ(ctx, mX + tw * 0.04, ry + h * 0.02, h * 0.014, on ? CYAN : SOFT, { fill: on ? 0.6 : 0.15 });
    bar(ctx, mX + tw * 0.1, ry + h * 0.008, tw * 0.4, h * 0.022, WHITE, on ? 0.4 : 0.12, 2);
    bar(ctx, mX + tw * 0.56, ry + h * 0.008, tw * 0.2, h * 0.022, BLUE, on ? 0.3 : 0.1, 2);
    bar(ctx, mX + tw * 0.82, ry + h * 0.008, tw * 0.12, h * 0.022, on ? GREEN : SOFT, on ? 0.4 : 0.12, 2);
  }
}
function scenePortals(ctx: CanvasRenderingContext2D, W: number, H: number, t: number, q: boolean) {
  paintBase(ctx, W, H);
  ctx.globalCompositeOperation = 'lighter';
  // Minimal: one portal dashboard in the left gutter, a responsive reflow trio right.
  const pw = clampI(W * 0.3, 260, 440), ph = clampI(H * 0.5, 240, 410);
  portalWindow(ctx, W * 0.03, H * 0.5 - ph / 2, pw, ph, t, q);
  if (q && W > 720) {
    const rx = W * 0.7, midY = H * 0.5;
    const bump = smooth(cyc(t, 4));
    const frames: Array<[number, number, number]> = [
      [rx, midY - 44, 150],
      [rx + 165, midY, 92],
      [rx + 275, midY + 34, 50],
    ];
    for (const [fx, fy, fw] of frames) {
      const fh = fw * 0.68;
      frame(ctx, fx, fy - fh / 2, fw, fh, 5, SOFT, { lw: 1.2, a: 0.5 + bump * 0.3 });
      seg(ctx, fx, fy - fh / 2 + fh * 0.18, fx + fw, fy - fh / 2 + fh * 0.18, BLUE, 1, false, 0.4);
      bar(ctx, fx + fw * 0.08, fy - fh / 2 + fh * 0.28, fw * 0.84, fh * 0.22, SOFT, 0.12, 3);
      rows(ctx, fx + fw * 0.08, fy - fh / 2 + fh * 0.58, fw * 0.7, 2, 3, WHITE, { a: 0.3, lh: 2 });
    }
    seg(ctx, frames[0][0] + frames[0][2], frames[0][1], frames[1][0], frames[1][1], CYAN, 1, false, 0.3);
    seg(ctx, frames[1][0] + frames[1][2], frames[1][1], frames[2][0], frames[2][1], CYAN, 1, false, 0.3);
  }
}

// ═════════════════════════ SCENE 4 — MARKETING ═══════════════════════════════
function drawLineChart(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, t: number, q: boolean) {
  frame(ctx, x, y, w, h, 8, BLUE, { fill: 0.04, lw: 1.2, halo: q });
  const ox = x + w * 0.1, oy = y + h * 0.86, cw = w * 0.82, chh = h * 0.66;
  seg(ctx, ox, oy, ox + cw, oy, SOFT, 1, false, 0.35);
  seg(ctx, ox, oy, ox, oy - chh, SOFT, 1, false, 0.35);
  const rnd = prng(0x4a17);
  const n = 7;
  const pts: Array<[number, number]> = [];
  for (let i = 0; i < n; i++) {
    const base = i / (n - 1);
    const val = base * 0.7 + 0.12 + Math.sin(t * 0.8 + i) * 0.06 + rnd() * 0.12;
    pts.push([ox + cw * (i / (n - 1)), oy - chh * clamp01(val)]);
  }
  const reveal = clamp01(cyc(t, 7) / 0.7);
  const showN = Math.max(2, Math.ceil(n * reveal));
  // area fill
  ctx.beginPath();
  ctx.moveTo(pts[0][0], oy);
  for (let i = 0; i < showN; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.lineTo(pts[showN - 1][0], oy);
  ctx.closePath();
  ctx.fillStyle = rgba(CYAN, 0.1);
  ctx.fill();
  // line
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < showN; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  strokeGlow(ctx, CYAN, 1.8, q, 0.9);
  const hd = pts[showN - 1];
  circ(ctx, hd[0], hd[1], 3.2, CYAN, { fill: 0.9, lw: 1.4, a: 0.6, halo: q });
  // up arrow
  seg(ctx, x + w * 0.78, y + h * 0.16, x + w * 0.9, y + h * 0.08, GREEN, 1.6, q, 0.85);
  seg(ctx, x + w * 0.9, y + h * 0.08, x + w * 0.83, y + h * 0.09, GREEN, 1.6, false, 0.85);
  seg(ctx, x + w * 0.9, y + h * 0.08, x + w * 0.89, y + h * 0.15, GREEN, 1.6, false, 0.85);
}
function drawFunnel(ctx: CanvasRenderingContext2D, cx: number, y: number, w: number, h: number, t: number) {
  const steps = 4;
  for (let i = 0; i < steps; i++) {
    const topW = w * (1 - i * 0.2), botW = w * (1 - (i + 1) * 0.2);
    const sy = y + i * (h / steps), sh = h / steps - 3;
    ctx.beginPath();
    ctx.moveTo(cx - topW / 2, sy);
    ctx.lineTo(cx + topW / 2, sy);
    ctx.lineTo(cx + botW / 2, sy + sh);
    ctx.lineTo(cx - botW / 2, sy + sh);
    ctx.closePath();
    ctx.fillStyle = rgba([CYAN, SOFT, BLUE, VIOLET][i], 0.12);
    ctx.fill();
    strokeGlow(ctx, [CYAN, SOFT, BLUE, VIOLET][i], 1.2, false, 0.6);
  }
  // flowing highlight token descending
  const p = cyc(t, 3);
  const fy = y + p * h;
  const fw = w * (1 - p * 0.8);
  seg(ctx, cx - fw / 2, fy, cx + fw / 2, fy, WHITE, 1.4, true, 0.5 * (1 - p * 0.4));
}
function sceneMarketing(ctx: CanvasRenderingContext2D, W: number, H: number, t: number, q: boolean) {
  paintBase(ctx, W, H);
  ctx.globalCompositeOperation = 'lighter';
  // Minimal: a rising line chart in the left gutter, a conversion funnel in the right.
  const lcw = clampI(W * 0.26, 200, 380), lch = clampI(H * 0.34, 160, 300);
  drawLineChart(ctx, W * 0.03, H * 0.5 - lch / 2, lcw, lch, t, q);
  const fw = clampI(W * 0.14, 120, 200), fh = clampI(H * 0.34, 160, 280);
  drawFunnel(ctx, W * 0.82, H * 0.5 - fh / 2, fw, fh, t);
  if (q) {
    const px = W * 0.9, py = H * 0.24; // a single subtle "reach" ping
    circ(ctx, px, py, 3, VIOLET, { fill: 0.8 });
    for (let r = 0; r < 3; r++) {
      const p = cyc(t, 2.6, r * 0.33);
      circ(ctx, px, py, 4 + p * 40, VIOLET, { lw: 1.2, a: 0.4 * (1 - p) });
    }
  }
}

const SCENES = [sceneSoftware, sceneMobile, sceneEvents, scenePortals, sceneMarketing];

export function CapabilityBackdrop({ active }: { active: number }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activeRef = useRef(active);
  const staticRef = useRef<((i: number) => void) | null>(null);
  const reduceRef = useRef(false);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    reduceRef.current = reduce;
    const nav = navigator as Navigator & { deviceMemory?: number };
    const lowPower =
      (nav.hardwareConcurrency ?? 8) <= 4 ||
      (nav.deviceMemory ?? 8) <= 4 ||
      window.matchMedia('(pointer: coarse)').matches;
    const HIGH_Q = !lowPower;

    let W = 0, H = 0, dpr = 1;
    function resize() {
      W = wrap!.clientWidth;
      H = wrap!.clientHeight;
      dpr = Math.min(lowPower ? 1.5 : 2, window.devicePixelRatio || 1);
      canvas!.width = Math.max(1, Math.round(W * dpr));
      canvas!.height = Math.max(1, Math.round(H * dpr));
      canvas!.style.width = `${W}px`;
      canvas!.style.height = `${H}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function drawScene(idx: number, alpha: number, t: number) {
      ctx!.save();
      ctx!.globalAlpha = alpha;
      SCENES[idx](ctx!, W, H, t, HIGH_Q);
      ctx!.restore();
    }
    function overlay() {
      // central scrim → keep the front card legible; art stays vivid in the gutters
      ctx!.globalCompositeOperation = 'source-over';
      const rr = Math.min(W * 0.46, H * 0.62);
      const vg = ctx!.createRadialGradient(W / 2, H * 0.5, Math.min(W, H) * 0.05, W / 2, H * 0.5, rr);
      vg.addColorStop(0, rgba(BASE_OUT, 0.82));
      vg.addColorStop(0.5, rgba(BASE_OUT, 0.3));
      vg.addColorStop(1, rgba(BASE_OUT, 0));
      ctx!.fillStyle = vg;
      ctx!.fillRect(0, 0, W, H);
      // soft top/bottom fade into the neighbouring bands
      const eg = ctx!.createLinearGradient(0, 0, 0, H);
      eg.addColorStop(0, rgba(BASE_OUT, 0.55));
      eg.addColorStop(0.12, rgba(BASE_OUT, 0));
      eg.addColorStop(0.88, rgba(BASE_OUT, 0));
      eg.addColorStop(1, rgba(BASE_OUT, 0.55));
      ctx!.fillStyle = eg;
      ctx!.fillRect(0, 0, W, H);
    }

    function renderStatic(idx: number) {
      ctx!.clearRect(0, 0, W, H);
      drawScene(idx, 1, 5.2);
      overlay();
    }
    staticRef.current = renderStatic;

    // crossfade state
    let curIdx = activeRef.current;
    let fromIdx = curIdx;
    let toIdx = curIdx;
    let mix = 1; // 1 == settled on curIdx
    let raf = 0, running = false, visible = true, last = 0;

    function frameLoop(time: number) {
      const t = time / 1000;
      const dt = last ? Math.min(0.05, (time - last) / 1000) : 0.016;
      last = time;

      // detect a card change → begin a fresh crossfade
      const target = activeRef.current;
      if (target !== toIdx) {
        fromIdx = mix < 1 ? toIdx : curIdx;
        toIdx = target;
        mix = 0;
      }

      ctx!.clearRect(0, 0, W, H);
      if (mix < 1) {
        mix = clamp01(mix + dt / 0.55);
        const e = smooth(mix);
        drawScene(fromIdx, 1 - e, t);
        drawScene(toIdx, e, t);
        if (mix >= 1) curIdx = toIdx;
      } else {
        drawScene(curIdx, 1, t);
      }
      overlay();
      raf = requestAnimationFrame(frameLoop);
    }
    function start() {
      if (running || !visible || reduce) return;
      running = true;
      last = 0;
      raf = requestAnimationFrame(frameLoop);
    }
    function stop() {
      running = false;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    }

    resize();
    const ro = new ResizeObserver(() => {
      resize();
      if (reduce) renderStatic(activeRef.current);
    });
    ro.observe(wrap);

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (!visible) stop();
        else if (reduce) renderStatic(activeRef.current);
        else start();
      },
      { rootMargin: '120px 0px' },
    );
    io.observe(wrap);

    const onVis = () => {
      if (document.hidden) stop();
      else if (visible && !reduce) start();
    };
    document.addEventListener('visibilitychange', onVis);

    if (reduce) renderStatic(curIdx);
    else start();

    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      staticRef.current = null;
    };
  }, []);

  // react to card changes: the rAF loop reads activeRef; in reduced-motion we
  // repaint the static frame immediately.
  useEffect(() => {
    activeRef.current = active;
    if (reduceRef.current) staticRef.current?.(active);
  }, [active]);

  return (
    <div ref={wrapRef} aria-hidden className="oc-backdrop">
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
}
