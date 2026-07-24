'use client';

import { Component, useEffect, useRef, useState, type ReactNode } from 'react';
import dynamic from 'next/dynamic';
import * as THREE from 'three';
import { useGSAP } from '@gsap/react';
import { gsap, registerGSAPPlugins, ScrollTrigger } from '@/lib/animations/gsap-setup';
import { useLoaderStore } from '@/store/loaderStore';
import { useReducedMotion, useDeviceCapability } from '@/hooks';
import { useLenis } from '@/components/layout/SmoothScroll';
import type Lenis from 'lenis';
import { HexGridBackground } from '@/components/shared/HexGridBackground';
import { HexDomeBackground } from '@/components/shared/HexDomeBackground';
import { RubiksHeroStatic } from './RubiksHeroStatic';

/* ══════════════════════════════════════════════════════════════
   RubiksCubeExperience — 3D Rubik's Cube scroll narrative
   White/light theme matching the rest of the website
   ══════════════════════════════════════════════════════════════ */

/* ── Easing helpers ── */
function easeOutExpo(t: number) { return t === 1 ? 1 : 1 - Math.pow(2, -10 * t); }
function easeInOutCubic(t: number) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
function easeOutCubic(t: number) { return 1 - Math.pow(1 - t, 3); }
function easeInCubic(t: number) { return t * t * t; }
function easeInOutSine(t: number) { return -(Math.cos(Math.PI * t) - 1) / 2; }
function easeOutBack(t: number, overshoot = 1.70158) {
  return 1 + (overshoot + 1) * Math.pow(t - 1, 3) + overshoot * Math.pow(t - 1, 2);
}
function lerp01(val: number, a: number, b: number) { return Math.max(0, Math.min(1, (val - a) / (b - a))); }

/* ── Phase boundaries ── */
const P = { hero: 0.04, s1: 0.12, s2: 0.26, s3: 0.48, s4: 0.60, s5: 0.68, s6: 0.76, s7: 0.83 };

/* ── Opening "assembly" act ──
   The intro occupies the first INTRO_END of the *raw* scroll progress. Everything
   after it is the original narrative, re-mapped onto [0..1] so none of the existing
   phase/card constants above need to change. Spacer height grows to give the intro
   real scroll room: ~180vh intro + ~970vh narrative = 1150vh total. */
// Shortened from 180+970=1150vh. The narrative still plays in full — each phase
// just maps to a shorter (more reasonable) scroll distance, dropping the page's
// single biggest scroll-height contributor by ~half.
const INTRO_VH = 120;
const MAIN_VH = 600; // lengthened (was 480) so the narrative scrolls at a calmer,
                     // more uniform speed — no card flies by, none drags.
const SPACER_VH = INTRO_VH + MAIN_VH; // 720
const INTRO_END = INTRO_VH / SPACER_VH; // ≈ 0.167

/* ── Scroll warp ──
   The last three cards (s6, s7, s8 — narrative t ≥ TAIL_START) have the SMALLEST
   native narrative spans, so without help they fly past on a fast scroll. This
   warp gives that tail EXTRA scroll (TAIL_WEIGHT > 1 stretches it) so every late
   card occupies roughly the same scroll distance as the earlier ones — uniform
   pacing, nothing skipped. Piecewise-linear map from scroll fraction → original
   narrative timeline, so every phase/card constant below stays untouched. */
const TAIL_START = 0.68; // covers s6 (eIn 0.70) onward
const TAIL_WEIGHT = 1.5; // stretch the tail (was 0.5, which compressed it)
const WARP_TOTAL = TAIL_START + (1 - TAIL_START) * TAIL_WEIGHT; // 1.16
const WARP_KNEE = TAIL_START / WARP_TOTAL; // ≈ 0.586
function warpMainP(s: number) {
  return s <= WARP_KNEE
    ? s * WARP_TOTAL
    : TAIL_START + ((s - WARP_KNEE) / (1 - WARP_KNEE)) * (1 - TAIL_START);
}

/* ── Side labels ── */
const SIDE_LABELS = [
  [0, 0.21, '01 \u2014 The Scramble'],
  [0.21, 0.39, '02 \u2014 The First Move'],
  [0.39, 0.56, '03 \u2014 How We Apply Kaizen'],
  [0.56, 0.68, '04 \u2014 From Chaos to Clarity'],
  [0.68, 0.76, 'Expertise'],
  [0.76, 0.83, 'Kaizen'],
  [0.83, 1.0, "Let's Solve It"],
] as const;

/* ── Card animation config ── */
interface CardCfg {
  id: string; eIn: number; eFull: number; xS: number; xE: number;
  side: 'left' | 'right' | 'center'; stg: string; ss: number; st: number;
}
const CARDS: CardCfg[] = [
  { id: 'card-s1', eIn: 0.040, eFull: 0.085, xS: 0.180, xE: 0.210, side: 'right', stg: 's1', ss: 0.055, st: 0.015 },
  { id: 'card-s2', eIn: 0.225, eFull: 0.270, xS: 0.355, xE: 0.385, side: 'left',  stg: 's2', ss: 0.240, st: 0.015 },
  { id: 'card-s3', eIn: 0.400, eFull: 0.445, xS: 0.525, xE: 0.555, side: 'right', stg: 's3', ss: 0.415, st: 0.015 },
  { id: 'card-s4', eIn: 0.570, eFull: 0.615, xS: 0.680, xE: 0.695, side: 'left',  stg: 's4', ss: 0.585, st: 0.015 },
  // s6/s7 are the last cards with the smallest native hold windows, so their
  // full-opacity peaks are the first to be missed on a fast scroll. Holds widened
  // to match the earlier cards (≈0.05–0.06) so each occupies comparable distance
  // and reliably paints. Combined with the tail-expanding warp above, these now
  // get more scroll room, not less. s8 entry (0.888) keeps a clean gap after s7.
  { id: 'card-s6', eIn: 0.700, eFull: 0.724, xS: 0.786, xE: 0.800, side: 'center', stg: 's6', ss: 0.706, st: 0.015 },
  { id: 'card-s7', eIn: 0.800, eFull: 0.822, xS: 0.872, xE: 0.884, side: 'center', stg: 's7', ss: 0.806, st: 0.015 },
  { id: 'card-s8', eIn: 0.888, eFull: 0.918, xS: 1.000, xE: 1.100, side: 'center', stg: 's8', ss: 0.896, st: 0.018 },
];

/* ── Rubik's Cube constants ── */
const GAP = 0.07, SIZE = 0.86, UNIT = SIZE + GAP, RADIUS = SIZE * 0.10;
const FCOLORS = {
  right: 0xC00000, left: 0xff8c00, top: 0xfdd835,
  bottom: 0xf5f5f0, front: 0x2ecc71, back: 0x2196f3, inner: 0x222222,
};
const AXES: ('x' | 'y' | 'z')[] = ['x', 'y', 'z'];
const LAYERVALS = [-1, 0, 1];
const ANGLEVALS = [Math.PI / 2, -Math.PI / 2];

/* ── Light theme colors ── */
const BG_COLOR = '#f5f5f5';

/* The Spline React wrapper + runtime (~530KB gz, including its OWN bundled copy of
   three.js) used to be statically imported here, fusing it into the same chunk as
   the app's three.js — so coarse-pointer devices, which never mount <Spline> (see
   allowLiveMonitor), still downloaded and parsed all of it. Code-splitting it means
   phones skip it entirely; desktop timing is preserved by warming the import in the
   same effect that prefetches the scene file (below), all under the countdown loader. */
const Spline = dynamic(() => import('@splinetool/react-spline'), { ssr: false });

/* The heavy Spline 3D scene. SELF-HOSTED (was prod.spline.design, which served it
   with no Cache-Control and from a third-party origin): the file is a plain export
   — to update it, download the new scene.splinecode and bump the filename
   (scene-v2…), because /spline/* is served with a 1-year immutable Cache-Control
   (next.config.ts). Its file is prefetched under the countdown loader so the
   download finishes early, but the <Spline> component is only MOUNTED once the
   loader clears — that way the scene's native typing animation starts fresh as the
   computer reveals, instead of finishing while it's hidden behind the overlay. */
const SPLINE_SCENE_URL = '/spline/scene-v1.splinecode';

/* NOTE on wasm self-hosting: DO NOT pass `wasmPath` to <Spline>. It was tried
   (serving the unpkg-published process/navmesh/boolean.js+wasm and the draco
   decoder from /spline/wasm) and it BREAKS the runtime: with wasmPath set it
   evals the fetched helper .js files into a colliding scope ("Identifier 'n'
   has already been declared" / "Unexpected end of input" from a worker), the
   scene build dies silently AFTER onLoad fires, and the monitor renders
   nothing while the poster has already crossfaded away. With the DEFAULT
   paths the runtime uses its own bundled JS glue and only fetches the .wasm
   binaries (unpkg.com) + draco decoder (www.gstatic.com) — both origins are
   preconnected in src/app/layout.tsx. Verified via public-harness bisect:
   default paths → scene loads; wasmPath → dead canvas. */

/* react-spline has no onError prop — a failed scene/wasm fetch throws through
   React and, uncontained, unmounts the ENTIRE landing page into the app error
   boundary ("Something went wrong"). Contain it here instead: on failure the
   live monitor simply never mounts and the full-quality poster stays as the
   monitor — the page, cube, and every animation keep running. */
class SplineErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(err: unknown) {
    console.warn('[hero] Spline scene failed to load — keeping the static poster.', err);
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

/* The Spline canvas always renders at this fixed square size (big enough to hold
   the whole monitor), then is scaled DOWN to fit any viewport — so the monitor is
   never cropped, even on short laptop screens. */
const SPLINE_DESIGN_W = 1200;
const SPLINE_DESIGN_H = 900;

/* ── Rounded box geometry ── */
function createRoundedBox(w: number, h: number, d: number, r: number, seg = 6) {
  const geo = new THREE.BoxGeometry(w, h, d, seg, seg, seg);
  const pos = geo.attributes.position;
  const v = new THREE.Vector3();
  const halfW = w / 2, halfH = h / 2, halfD = d / 2;
  for (let i = 0; i < pos.count; i++) {
    v.set(pos.getX(i), pos.getY(i), pos.getZ(i));
    const sx = Math.sign(v.x), sy = Math.sign(v.y), sz = Math.sign(v.z);
    const ix = halfW - r, iy = halfH - r, iz = halfD - r;
    const dx = Math.max(0, Math.abs(v.x) - ix);
    const dy = Math.max(0, Math.abs(v.y) - iy);
    const dz = Math.max(0, Math.abs(v.z) - iz);
    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
    if (dist > 0.0001) {
      const scale = r / dist;
      if (scale < 1) {
        v.x = sx * (ix + dx * scale);
        v.y = sy * (iy + dy * scale);
        v.z = sz * (iz + dz * scale);
      }
    }
    pos.setXYZ(i, v.x, v.y, v.z);
  }
  geo.computeVertexNormals();
  return geo;
}

export function RubiksCubeExperience() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const fixedLayerRef = useRef<HTMLDivElement>(null);
  const sideRef = useRef<HTMLDivElement>(null);
  const introCardRef = useRef<HTMLDivElement>(null);
  const introInnerRef = useRef<HTMLDivElement>(null);
  const splineRef = useRef<HTMLDivElement>(null);
  const splineFitRef = useRef<HTMLDivElement>(null);
  const splineFrameRef = useRef<HTMLDivElement>(null);
  const splineZoomRef = useRef<HTMLDivElement>(null);
  // Captured Spline app instance (from onLoad) so the scene can be controlled
  // imperatively later — e.g. splineAppRef.current?.emitEvent('start', 'code 2').
  const splineAppRef = useRef<unknown>(null);
  // Starts/replays the Spline scene's CRT typing intro. The scene loads UNDER the
  // countdown overlay (so it's fully sharp by the time the loader clears), but its
  // render loop is frozen with app.stop() on load so the typing doesn't burn off
  // behind the overlay. The loader-complete effect calls this to play it in view.
  const splineStartRef = useRef<(() => void) | null>(null);
  // Travel-through effect overlays — opacity driven by updateIntro.
  const scanlineRef = useRef<HTMLDivElement>(null);
  const diveVignetteRef = useRef<HTMLDivElement>(null);
  const streaksRef = useRef<HTMLDivElement>(null);
  // The cube-narrative motion background — the "hex dome" canvas recreating
  // the client's reference video: two massive convex honeycomb domes flanking
  // the frame, melting into a bright central glow (HexDomeBackground). Sits
  // UNDER the intro backdrop below and is revealed as that fades on the dive;
  // display-toggled off once the section has fully scrolled past so its rAF
  // idles for the rest of the page.
  const domeBgRef = useRef<HTMLDivElement>(null);
  // The landing (opening act) backdrop — the blue hex-ripple honeycomb behind
  // the Spline computer + hook card. Full strength at rest, fades out (and
  // hard-hides) during the dive, revealing the hex-dome canvas beneath for the
  // rest of the narrative. Restored per client request: landing keeps the old
  // background; the dome takes over after scrolling.
  const introBgFxRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  // Lazy-mount guard for the Spline WebGL scene: only kept in the tree while the
  // hero section is near the viewport, so its GPU/WebGL context is freed once the
  // user scrolls past the hero (it's display:none'd after the intro anyway).
  const [splineNearViewport, setSplineNearViewport] = useState(true);
  // Blurred poster behind the Spline canvas: shown until the heavy 3D scene
  // reports loaded, then faded out. This is the same "no blank flash" benefit the
  // /next Spline gives via its server-rendered placeholder, but done inside this
  // client component so the scroll dive (refs, onLoad, scissor math) is untouched.
  const [splineLoaded, setSplineLoaded] = useState(false);
  const loaderComplete = useLoaderStore((s) => s.isComplete);
  const prefersReducedMotion = useReducedMotion();

  // Touch/coarse-pointer devices (phones, tablets) can't afford TWO live WebGL
  // contexts at once. Running the three.js cube AND the Spline monitor together hung
  // Lighthouse-mobile (PAGE_HUNG) and wrecked real-user INP/LCP. So on touch we keep
  // the signature cube but DROP the second context: the Spline scene is never mounted
  // (its heavy WASM + scene-graph init and continuous GPU cost are skipped) and the
  // poster — already the pre-Spline placeholder — simply stays as a static monitor.
  // `cap.ready` gates it so the live scene is only ever mounted once we've CONFIRMED a
  // non-touch device (never mounted-then-torn-down on a phone).
  const cap = useDeviceCapability();
  const allowLiveMonitor = cap.ready && !cap.coarsePointer;

  // Live mirrors of values the long-lived useGSAP effect reads at interaction
  // time (Enter/Space/tap → "play the dive like a video"). Stored in refs so the
  // effect needn't list them as deps (which would tear down + rebuild the whole
  // THREE.js scene whenever the Lenis instance or loader state changes).
  const { lenis } = useLenis();
  const lenisRef = useRef<Lenis | null>(null);
  const loaderCompleteRef = useRef(false);
  // The page is frozen at the top until the Enter/Space/tap gesture begins the
  // dive. That freeze is OWNED + ENFORCED by SmoothScroll via the loader store's
  // introScrollLocked flag (locked by RubiksHero before this heavy chunk even
  // downloads); this component only detects the gesture and unlocks. Keep just a
  // live Lenis handle for the dive's scrollTo.
  useEffect(() => {
    lenisRef.current = lenis;
  }, [lenis]);
  useEffect(() => {
    loaderCompleteRef.current = loaderComplete;
    if (!loaderComplete) return;
    // Loader has cleared. Resume the Spline scene, which loaded sharp under the
    // overlay but was frozen, so its typing intro now animates in view. The two
    // canvas backdrops (blue hex-ripple intro + hex-dome narrative) are
    // self-animating and only activate now, via active={loaderComplete}, so
    // they never compete with the Spline/Three.js boot on a cold load.
    splineStartRef.current?.();
  }, [loaderComplete]);

  // Warm the HTTP cache for the heavy Spline scene file while the loader counts
  // down, so the scene initialises as early as possible under the overlay.
  useEffect(() => {
    // Touch devices never mount the live Spline scene (see allowLiveMonitor), so
    // don't warm its cache — that download would be pure waste on mobile data.
    if (window.matchMedia('(pointer: coarse)').matches) return;
    // Warm the code-split Spline runtime chunk alongside the scene file, so the
    // dynamic() boundary adds zero latency on devices that WILL mount it.
    void import('@splinetool/react-spline');
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.as = 'fetch';
    link.href = SPLINE_SCENE_URL;
    document.head.appendChild(link);
    return () => {
      link.remove();
    };
  }, []);

  useEffect(() => { setMounted(true); }, []);

  // Unmount the Spline scene when the hero section is well clear of the viewport
  // (and re-mount when it returns). The hero is the first section, so in practice
  // this frees the second WebGL context for the entire rest of the long page.
  useEffect(() => {
    if (!mounted || prefersReducedMotion) return;
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(
      ([entry]) => {
        setSplineNearViewport(entry.isIntersecting);
        // When the hero leaves the viewport the <Spline> unmounts (freeing its
        // WebGL context). Reset the loaded flag so that when it re-enters and
        // remounts, the poster shows again AND a fresh onLoad fires — which is
        // what re-runs playIntro() and replays the CRT text each time.
        if (!entry.isIntersecting) setSplineLoaded(false);
      },
      { rootMargin: '300px 0px 300px 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [mounted, prefersReducedMotion]);

  /* Hook-line entrance (plays once after the loader clears; scroll-out is handled
     separately in the render loop):
       1. "Your Vision" fades in while rising from below to its resting place.
       2. Once it settles, "Our Code" is "written" — a left→right clip reveal that,
          on the cursive script, reads like the words being handwritten in view.
       3. The "Tap to begin" cue fades up last. */
  useEffect(() => {
    if (!mounted || !loaderComplete || !introInnerRef.current) return;
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const el = introInnerRef.current;
    const t1 = el.querySelector<HTMLElement>('.rc-hook-t1');
    const t2 = el.querySelector<HTMLElement>('.rc-hook-t2');
    const cue = el.querySelector<HTMLElement>('.rc-tap-cue');

    if (reduce) {
      gsap.set(el, { opacity: 1 });
      if (t1) gsap.set(t1, { opacity: 1, yPercent: 0 });
      if (t2) gsap.set(t2, { opacity: 1, '--tw': 1 });
      if (cue) gsap.set(cue, { opacity: 1, y: 0 });
      return;
    }

    // The write is driven by `--tw` (0 = hidden … 1 = fully written); the CSS
    // clip-path in .rc-hook-t2 turns it into a left→right sweep.
    gsap.set(el, { opacity: 1 });
    if (t1) gsap.set(t1, { opacity: 0, yPercent: 80 });
    if (t2) gsap.set(t2, { opacity: 0, '--tw': 0 });
    if (cue) gsap.set(cue, { opacity: 0, y: 14 });

    const tl = gsap.timeline({ delay: 0.2 });
    if (t1) tl.to(t1, { opacity: 1, yPercent: 0, duration: 0.9, ease: 'expo.out' });
    if (t2) {
      tl.to(t2, { opacity: 1, duration: 0.25 }, '>-0.02'); // ink appears as writing starts
      tl.to(t2, { '--tw': 1, duration: 1.5, ease: 'power1.inOut' }, '<');
    }
    if (cue) tl.to(cue, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, '-=0.35');
  }, [mounted, loaderComplete]);

  useGSAP(() => {
    // Reduced motion: skip the entire THREE.js + Spline scroll narrative. The
    // component renders a static, fully-visible hero instead (see render below).
    if (prefersReducedMotion) return;
    if (!mounted || !canvasContainerRef.current || !containerRef.current) return;
    registerGSAPPlugins();

    // Hard-refresh fix: disable browser scroll restoration and reset to top.
    // Without this, F5/Ctrl+Shift+R can restore a mid-narrative scroll position;
    // with scrub:0 the ScrollTrigger fires instantly at the restored progress,
    // smoothProgress jumps near 1.0, and updateIntroExit() destroys the intro
    // state before updateIntro() ever runs.
    if (typeof history !== 'undefined') {
      history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);

    const container = canvasContainerRef.current;
    const rootEl = containerRef.current;
    const fixedLayer = fixedLayerRef.current;

    /* ═══ THREE.js Scene — Light theme ═══ */
    const scene = new THREE.Scene();
    // Transparent so the Spline desktop layer (behind the canvas) and the page
    // background (#f5f5f5 on the container) show through during the opening act.
    scene.background = null;
    scene.fog = new THREE.FogExp2(new THREE.Color(BG_COLOR).getHex(), 0.02);

    const camera = new THREE.PerspectiveCamera(45, innerWidth / innerHeight, 0.1, 100);
    camera.position.set(0, 0, 4.5);

    // Touch devices run this cube alongside the hex canvas on a phone GPU. MSAA + a
    // high DPR there is a big raster cost that helped hang mobile, so coarse-pointer
    // devices drop antialiasing and cap DPR at 1 (the cube is small/scaled on mobile,
    // so the softness is negligible next to not hanging). Desktop is unchanged.
    const coarsePointer = window.matchMedia('(pointer: coarse)').matches;
    const renderer = new THREE.WebGLRenderer({ antialias: !coarsePointer, alpha: true, powerPreference: 'high-performance' });
    renderer.setClearColor(0x000000, 0);
    renderer.setSize(innerWidth, innerHeight);
    // Cap DPR at 1.5 on desktop: a full-viewport MSAA canvas at DPR 2–3 alongside the
    // separate Spline WebGL context is a heavy GPU load that causes janky/stuck
    // scrolling. 1.5 keeps it crisp enough at a fraction of the cost; touch caps at 1.
    renderer.setPixelRatio(Math.min(devicePixelRatio, coarsePointer ? 1 : 1.5));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.4;
    container.appendChild(renderer.domElement);

    /* ═══ Lighting — brighter for light theme ═══ */
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.4);
    keyLight.position.set(4, 5, 4);
    scene.add(keyLight);
    const fillLight = new THREE.DirectionalLight(0x8899bb, 0.6);
    fillLight.position.set(-5, 2, 3);
    scene.add(fillLight);
    const rimLight = new THREE.DirectionalLight(0xffeedd, 0.5);
    rimLight.position.set(-1, -3, -5);
    scene.add(rimLight);
    const topLight = new THREE.DirectionalLight(0xffffff, 0.4);
    topLight.position.set(0, 6, 0);
    scene.add(topLight);
    scene.add(new THREE.AmbientLight(0xd0d0e0, 0.8));
    const pl1 = new THREE.PointLight(0x64b5f6, 0.5, 15);
    pl1.position.set(4, 2, -2);
    scene.add(pl1);
    const pl2 = new THREE.PointLight(0xa78bfa, 0.3, 15);
    pl2.position.set(-3, -3, 3);
    scene.add(pl2);

    /* ═══ Rubik's Cube ═══ */
    function makeCubie(x: number, y: number, z: number) {
      const geo = createRoundedBox(SIZE, SIZE, SIZE, RADIUS, 6);
      const mats = [
        new THREE.MeshStandardMaterial({ color: x === 1 ? FCOLORS.right : FCOLORS.inner, roughness: 0.25, metalness: 0.12 }),
        new THREE.MeshStandardMaterial({ color: x === -1 ? FCOLORS.left : FCOLORS.inner, roughness: 0.25, metalness: 0.12 }),
        new THREE.MeshStandardMaterial({ color: y === 1 ? FCOLORS.top : FCOLORS.inner, roughness: 0.25, metalness: 0.12 }),
        new THREE.MeshStandardMaterial({ color: y === -1 ? FCOLORS.bottom : FCOLORS.inner, roughness: 0.25, metalness: 0.12 }),
        new THREE.MeshStandardMaterial({ color: z === 1 ? FCOLORS.front : FCOLORS.inner, roughness: 0.25, metalness: 0.12 }),
        new THREE.MeshStandardMaterial({ color: z === -1 ? FCOLORS.back : FCOLORS.inner, roughness: 0.25, metalness: 0.12 }),
      ];
      const mesh = new THREE.Mesh(geo, mats);
      mesh.position.set(x * UNIT, y * UNIT, z * UNIT);
      return mesh;
    }

    const cubies: THREE.Mesh[] = [];
    const cubeGroup = new THREE.Group();
    for (let x = -1; x <= 1; x++)
      for (let y = -1; y <= 1; y++)
        for (let z = -1; z <= 1; z++) {
          if (x === 0 && y === 0 && z === 0) continue;
          const c = makeCubie(x, y, z);
          cubies.push(c);
          cubeGroup.add(c);
        }
    // The cube pieces live under introStage so the opening act can "dock" them
    // inside the on-screen monitor and release them to full-frame as the camera
    // flies through the screen. introStage is identity during the main narrative,
    // so all existing phase maths run unchanged in world space.
    const introStage = new THREE.Group();
    introStage.add(cubeGroup);
    scene.add(introStage);

    /* ═══ Scramble / Solve ═══ */
    function getGrid(cubie: THREE.Mesh, axis: 'x' | 'y' | 'z') {
      return Math.round(cubie.position[axis] / UNIT);
    }

    function applyMove(axis: 'x' | 'y' | 'z', layer: number, angle: number) {
      const pivot = new THREE.Group();
      scene.add(pivot);
      const affected: THREE.Mesh[] = [];
      for (const c of cubies) {
        if (getGrid(c, axis) === layer) affected.push(c);
      }
      for (const c of affected) pivot.attach(c);
      pivot.rotation[axis] = angle;
      pivot.updateMatrixWorld(true);
      for (const c of affected) cubeGroup.attach(c);
      scene.remove(pivot);
    }

    const scrambleMoves: { axis: 'x' | 'y' | 'z'; layer: number; angle: number }[] = [];
    let lastAxis = '';
    for (let i = 0; i < 14; i++) {
      let ax: 'x' | 'y' | 'z';
      do { ax = AXES[Math.floor(Math.random() * 3)]; } while (ax === lastAxis);
      lastAxis = ax;
      scrambleMoves.push({
        axis: ax,
        layer: LAYERVALS[Math.floor(Math.random() * 3)],
        angle: ANGLEVALS[Math.floor(Math.random() * 2)],
      });
    }
    const solveMoves = scrambleMoves.slice().reverse().map(m => ({
      axis: m.axis, layer: m.layer, angle: -m.angle,
    }));

    for (const m of scrambleMoves) applyMove(m.axis, m.layer, m.angle);

    for (const c of cubies) {
      c.userData.scrPos = c.position.clone();
      c.userData.scrQuat = c.quaternion.clone();
    }

    const solveStates: { p: THREE.Vector3; q: THREE.Quaternion }[][] = [];
    for (const c of cubies) {
      c.position.copy(c.userData.scrPos);
      c.quaternion.copy(c.userData.scrQuat);
    }
    solveStates.push(cubies.map(c => ({ p: c.position.clone(), q: c.quaternion.clone() })));
    for (const m of solveMoves) {
      applyMove(m.axis, m.layer, m.angle);
      solveStates.push(cubies.map(c => ({ p: c.position.clone(), q: c.quaternion.clone() })));
    }
    const solvedState = solveStates[solveStates.length - 1];

    for (let i = 0; i < cubies.length; i++) {
      cubies[i].position.copy(cubies[i].userData.scrPos);
      cubies[i].quaternion.copy(cubies[i].userData.scrQuat);
    }

    for (let i = 0; i < cubies.length; i++) {
      // Scatter direction from solved position, gently biased away from the card.
      const dir = solvedState[i].p.clone().normalize();
      if (dir.length() < 0.01) dir.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize();
      dir.x *= 1.25; // mild left/right widening (was 1.9)
      dir.y *= 1.15; // mild top/bottom widening (was 1.6)
      dir.z *= 0.6;  // stay near the card's depth plane
      // Keep cubes within the visible frustum: use the original, proven-visible range.
      dir.normalize();
      const dist = 5 + Math.random() * 3; // 5–8 units (was 8–12, which flew off-screen)
      const scattered = dir.multiplyScalar(dist);
      // Soft clearance so nothing lands on the card — small minimums, not large clamps.
      const MIN_X = 3.2; // horizontal clearance from center (was 6.5)
      const MIN_Y = 2.2; // vertical clearance from center (was 4.0)
      if (Math.abs(scattered.x) < MIN_X) scattered.x = (scattered.x < 0 ? -1 : 1) * MIN_X;
      if (Math.abs(scattered.y) < MIN_Y) scattered.y = (scattered.y < 0 ? -1 : 1) * MIN_Y;
      cubies[i].userData.explodePos = scattered.add(
        new THREE.Vector3((Math.random() - 0.5) * 1.5, (Math.random() - 0.5) * 1.5, (Math.random() - 0.5) * 1.2)
      );
      cubies[i].userData.explodeRot = new THREE.Euler(
        (Math.random() - 0.5) * Math.PI * 6,
        (Math.random() - 0.5) * Math.PI * 6,
        (Math.random() - 0.5) * Math.PI * 6,
      );
    }

    const origColors = cubies.map(c =>
      (c.material as THREE.MeshStandardMaterial[]).map(m => m.color.clone())
    );

    /* ═══ Opening assembly: monitor + scattered cube starts ═══ */
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = innerWidth <= 768; // include 768 (iPad portrait) in the stacked mobile layout
    // Touch devices: the full-screen Spline canvas captures touch gestures for its
    // 3D orbit and preventDefault()s them, which blocks page scrolling through the
    // pinned intro. We make the Spline non-interactive on touch (it's decorative
    // there — no hover) so swipes scroll the page. Desktop keeps it interactive.
    const isTouch =
      window.matchMedia('(hover: none), (pointer: coarse)').matches ||
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0;

    // "Compact" = phones (isMobile, <=768) PLUS iPad-portrait (769–1024 held
    // portrait). On these the intro hero drops the two-column desktop layout:
    // the Spline monitor goes full-width / centred (and is enlarged + raised via
    // CSS) while the hook copy drops to the bottom (also via CSS). The cube
    // narrative + screen-rect mapping keep using isMobile, so only the intro
    // visual is affected here — limiting blast radius on iPad-portrait.
    const isPortraitTablet =
      innerWidth > 768 &&
      innerWidth <= 1024 &&
      window.matchMedia('(orientation: portrait)').matches;
    const compact = isMobile || isPortraitTablet;

    const WHITE = new THREE.Color(0xffffff);
    const tmpCol = new THREE.Color();
    const tmpV = new THREE.Vector3();

    // The monitor screen as a fraction of the (square, aspect-locked) Spline frame.
    // Stable across viewports because the frame keeps a fixed aspect; measured once
    // via Playwright. The cube viewport + the zoom origin both derive from this.
    const SCREEN_IN_FRAME = isMobile
      ? { x: 0.30, y: 0.16, w: 0.40, h: 0.27 }
      : { x: 0.39, y: 0.201, w: 0.267, h: 0.322 }; // measured (2 methods, centre agrees): CRT black-screen rect

    // Live viewport-fraction rect for the cube scissor; recomputed each intro frame
    // from the frame's on-screen box so it tracks the monitor at any window size.
    const SCREEN_RECT = { x: 0.6, y: 0.2, w: 0.2, h: 0.2 };
    function computeScreenRect() {
      const el = splineFrameRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      if (r.width < 4 || r.height < 4) return;
      SCREEN_RECT.x = (r.left + SCREEN_IN_FRAME.x * r.width) / innerWidth;
      SCREEN_RECT.y = (r.top + SCREEN_IN_FRAME.y * r.height) / innerHeight;
      SCREEN_RECT.w = (SCREEN_IN_FRAME.w * r.width) / innerWidth;
      SCREEN_RECT.h = (SCREEN_IN_FRAME.h * r.height) / innerHeight;
    }

    // Zoom origin must land on the CENTER of the CRT screen so the dive-into-screen
    // scaling stays anchored to that point. Previous static-percentage math applied
    // SCREEN_IN_FRAME fractions (defined relative to the 1200×900 splineFrame) to the
    // splineZoom box (1320×900 — wider due to right:-120 overflow), shifting the
    // origin left by ~14-46px. This reads the actual screen-center in viewport px
    // and converts to a percentage of the zoom element's live bounding rect, so it
    // is correct at any window size, scale, or overflow value.
    function updateZoomOrigin() {
      const zoomEl = splineZoomRef.current;
      const frameEl = splineFrameRef.current;
      if (!zoomEl || !frameEl) return;
      const zoomRect = zoomEl.getBoundingClientRect();
      const frameRect = frameEl.getBoundingClientRect();
      if (zoomRect.width < 4 || zoomRect.height < 4) return;
      const screenCenterX = frameRect.left + (SCREEN_IN_FRAME.x + SCREEN_IN_FRAME.w / 2) * frameRect.width;
      const screenCenterY = frameRect.top  + (SCREEN_IN_FRAME.y + SCREEN_IN_FRAME.h / 2) * frameRect.height;
      const ox = ((screenCenterX - zoomRect.left) / zoomRect.width)  * 100;
      const oy = ((screenCenterY - zoomRect.top)  / zoomRect.height) * 100;
      zoomEl.style.transformOrigin = `${ox.toFixed(2)}% ${oy.toFixed(2)}%`;
    }

    // Single source of truth for the monitor's fit-scale, used by both fitSpline
    // (resize) and updateIntro (per frame) so they can never drift and pop at the
    // intro→main handoff. The DESKTOP computer is enlarged (×SPLINE_ENLARGE) and
    // allowed to overflow its column toward centre — the Spline frame has wide
    // transparent margins, so the monitor pixels grow without colliding with the
    // hook card — but it's still clamped to the available height so it is never
    // cropped vertically. Compact (phones + iPad-portrait) keeps the prior fit
    // untouched, so the card and stacked layout there are unchanged.
    const SPLINE_ENLARGE = 1.5;
    // How far the (aspect-locked) frame may exceed the available height on
    // desktop. The frame carries transparent top/bottom margins, so a little
    // overflow enlarges the visible COMPUTER while only trimming empty space and
    // the very bottom of the keyboard — never the monitor itself.
    const SPLINE_H_OVERFLOW = 1.16;
    function computeSplineScale() {
      const navbarReserve = compact ? 130 : 96;
      // Compact (phones + iPad-portrait): let the monitor grow well past the
      // viewport width (its transparent design margins overflow off-screen, so
      // the COMPUTER reads bigger) while staying clamped to the available height
      // so it is never cropped vertically.
      const fill = compact ? 1.45 : 1.0;
      const colWidth = compact ? innerWidth : innerWidth * 0.6;
      const availW = colWidth * fill;
      const availH = (innerHeight - navbarReserve) * fill;
      let s = Math.min(compact ? 1.8 : 1.7, availW / SPLINE_DESIGN_W, availH / SPLINE_DESIGN_H);
      if (!compact) s = Math.min(s * SPLINE_ENLARGE, (availH / SPLINE_DESIGN_H) * SPLINE_H_OVERFLOW);
      return s;
    }

    // Scale the fixed-size Spline canvas to fit the available space, so the whole
    // monitor is always visible (never cropped vertically) on any screen.
    function fitSpline() {
      if (!splineFitRef.current) return;
      splineFitRef.current.style.transform = `scale(${computeSplineScale()})`;

      // Responsive container padding: the 120px/60px desktop two-column offset
      // shoves the monitor off-centre (and partly off-screen) on phones/tablets.
      // Apply it only above 1024px; centre the scene with zero padding below.
      // Recomputed here so it tracks the 1024px boundary on resize too.
      if (splineRef.current) {
        const desktop = innerWidth > 1024;
        splineRef.current.style.paddingLeft = desktop ? '120px' : '0px';
        splineRef.current.style.paddingTop = desktop ? '60px' : '0px';
      }
    }

    // Anchor the hook card, size the Spline layer + set the zoom origin at the screen.
    if (introCardRef.current) {
      introCardRef.current.style.left = isMobile ? '50%' : '5vw';
      introCardRef.current.style.right = 'auto';
      introCardRef.current.style.top = isMobile ? '24%' : '50%';
      introCardRef.current.style.transform = isMobile ? 'translate(-50%, -50%)' : 'translateY(-50%)';
    }
    if (splineRef.current) {
      // Two-column layout on desktop (monitor right 60%); full-width & centred
      // on phones + iPad-portrait so the enlarged monitor becomes the hero.
      splineRef.current.style.width = compact ? '100%' : '60%';
      // Let touch gestures pass through to the page so the intro can be scrolled.
      splineRef.current.style.pointerEvents = isTouch ? 'none' : 'auto';
    }
    fitSpline();
    computeScreenRect();
    // Must run AFTER fitSpline so the splineFitRef scale is applied and the
    // child bounding rects reflect their true on-screen size.
    updateZoomOrigin();

    // Per-cubie floating start position + idle-float params. Even angular
    // distribution around the ring so the 26 floating cubes never overlap each
    // other in screen space — each cube gets its own ~13.8° slice (with mild
    // jitter for organic variety).
    for (let ci = 0; ci < cubies.length; ci++) {
      const c = cubies[ci];
      // Even slice + jitter; radius varies for parallax depth without overlap.
      const ang = (ci / cubies.length) * Math.PI * 2 + (Math.random() - 0.5) * 0.18;
      const rad = 4.4 + Math.random() * 1.0;
      c.userData.introPos = new THREE.Vector3(
        Math.cos(ang) * rad,
        Math.sin(ang) * rad,
        (Math.random() - 0.5) * 1.5,
      );
      c.userData.introQuat = new THREE.Quaternion().setFromEuler(new THREE.Euler(
        (Math.random() - 0.5) * Math.PI * 4,
        (Math.random() - 0.5) * Math.PI * 4,
        (Math.random() - 0.5) * Math.PI * 4,
      ));
      c.userData.floatPhase = Math.random() * Math.PI * 2;
      c.userData.floatSpeed = 0.6 + Math.random() * 0.8;
      c.userData.floatDir = new THREE.Vector3(
        Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5
      ).normalize();
    }

    /* ── Intro render functions ── */
    function updateIntro(introT: number, t: number) {
      // Portal-style scroll narrative:
      //   Phase 1 — Approach        (0.00 → 0.40): computer slides + grows to viewport centre; card fades.
      //   Phase 2 — Travel-to-screen(0.40 → 0.65): splineZoomRef scales screen up; cube canvas viewport
      //                                             tracks the live screen rect so we ride INTO the screen.
      //   Phase 3 — Pass-through    (0.65 → 0.75): screen has filled the viewport; Spline fades 1 → 0;
      //                                             cubies fade in (we're "inside" now).
      //   Phase 4 — Floating cubes  (0.75 → 0.85): cubies arrive at ring positions (burst).
      //   Phase 5 — Assemble        (0.85 → 1.00): cubies converge into the scrambled cube.
      // Eased Spline crossfade: holds visible longer, then drops out faster.
      // Window widened slightly (0.62 → 0.78) to give the ease room to breathe.
      const splineFade =     easeInCubic(lerp01(introT, 0.62, 0.78));
      const screenZoom = easeInOutCubic(lerp01(introT, 0.32, 0.70)); // Phase 2: dive INTO the screen (widened to 38% of introT)
      // Recenter LAG. The CRT sits right-of-centre, but the cube narrative that
      // follows is viewport-centred — so the focus must end at viewport centre.
      // Driving that recenter off screenZoom slid the focus LEFT the entire dive
      // ("zooming to the left"). Instead, hold the focus ON the screen centre for
      // most of the dive, then glide to viewport centre only over 0.50→0.72 —
      // late enough that the screen has already filled the frame and the Spline
      // is crossfading out, so the move is masked. Reads as "dive straight INTO
      // the screen, punch through, land centred" with no early leftward drift.
      const recenter = easeInOutCubic(lerp01(introT, 0.50, 0.72));
      // Three-segment camera dolly. Burst ring radius is up to ~3 units, which
      // does not fit at z=4.5 (visible half = 2.1) — cropped on wide viewports.
      // So we pull back far (z=7) during the ring/burst window, then settle to
      // z=4.5 at intro-end to match main phase (no handoff snap).
      const cameraPushIn   = easeInOutCubic(lerp01(introT, 0.32, 0.55));  //  6  → 3.2
      const cameraPullback = easeInOutCubic(lerp01(introT, 0.55, 0.75));  //  3.2 → 7
      const cameraSettle   = easeInOutCubic(lerp01(introT, 0.85, 1.00));  //  7  → 4.5
      // Cubie appear: ease-out for a gentle pop, widened to 0.65 → 0.85.
      // Burst pushed later (0.72 → 0.88) so it doesn't collide with the fade-in.
      // Assemble nudged with it (0.88 → 1.00) so conv picks up exactly where burst lands.
      const appear     = easeOutCubic   (lerp01(introT, 0.65, 0.85));
      const burst      = easeOutCubic   (lerp01(introT, 0.72, 0.88));
      const conv       = easeInOutCubic (lerp01(introT, 0.88, 1.00));
      // Spring-style overshoot: cubies briefly scale past 1.0 before settling.
      // easeOutBack peaks at ~1.10 with the default overshoot, lerp extrapolates
      // through the upper bound so popScale peaks at ~1.055 then snaps to 1.0.
      const popScale   = burst < 1
        ? THREE.MathUtils.lerp(0.45, 1.0, easeOutBack(burst))
        : 1.0;
      const floatAmt   = (1 - conv) * 0.45;
      // Phase 3 → 4 lens blur: cubies emerge "out of focus" and snap into focus
      // as they settle. 1 (heavy blur) → 0 (sharp) over introT 0.65 → 0.80.
      const burstBlur  = Math.max(0, 1 - lerp01(introT, 0.65, 0.80));

      // 1) Apply Spline DOM transforms FIRST so the live frame box reflects them
      //    when we read getBoundingClientRect below.
      if (splineRef.current) {
        splineRef.current.style.display = 'flex';
        // Re-arm will-change for the active intro animation (it's cleared in
        // updateIntroExit once we leave the intro; restore on scroll-back-up).
        if (splineRef.current.style.willChange !== 'opacity') {
          splineRef.current.style.willChange = 'opacity';
          if (splineFitRef.current) splineFitRef.current.style.willChange = 'transform';
          if (splineZoomRef.current) splineZoomRef.current.style.willChange = 'transform';
          if (scanlineRef.current) scanlineRef.current.style.willChange = 'opacity';
          if (streaksRef.current) streaksRef.current.style.willChange = 'opacity, transform';
          if (diveVignetteRef.current) diveVignetteRef.current.style.willChange = 'opacity';
        }
        // Fade the computer fully out as the cubes appear.
        // Mobile + iPad portrait now match desktop (floor 0) instead of clamping at 0.85.
        // iPad landscape (768–1024 not portrait) keeps a subtle floor so it doesn't go fully empty.
        // (updateIntroExit still display:none's it past the intro, so it never bleeds into later sections.)
        const isPortraitMobileOrTablet = isMobile || isPortraitTablet;
        const fadeFloor = isPortraitMobileOrTablet
          ? 0
          : (innerWidth <= 1024 ? 0.06 : 0);
        splineRef.current.style.opacity = String(Math.max(1 - splineFade, fadeFloor));
      }
      // Lens-blur the cube canvas while cubies are emerging — sells "we just
      // passed through the surface; eyes are still re-focusing."
      const canvasContainer = canvasContainerRef.current;
      if (canvasContainer) {
        canvasContainer.style.filter = burstBlur > 0.01
          ? `blur(${(burstBlur * 8).toFixed(1)}px)`
          : '';
      }
      if (splineFitRef.current) {
        // Same fit-scale as fitSpline() (shared helper) so the enlarged computer
        // matches at the intro→main handoff. Computer is STATIONARY — no slide,
        // no grow. The dive happens purely via splineZoomRef's scale anchored at
        // the CRT centre, so the CRT screen grows to fill the viewport while the
        // rest of the monitor scales outward and off-screen.
        const baseScale = computeSplineScale();
        splineFitRef.current.style.transform = `scale(${baseScale.toFixed(4)})`;
      }

      // 2) Compute the live screen rect (viewport pixels). The splineFit slide
      //    has already brought the CRT to viewport centre by introT=0.40, so
      //    sCenterX/Y read directly off the live frame rect — no further DOM
      //    translate is needed on the zoom layer (it just scales in place,
      //    anchored at the CRT via its transform-origin).
      const W = innerWidth, H = innerHeight;
      let vx = 0, vy = 0, vw = W, vh = H, vyBottom = 0;
      let zoomFactor = 1;
      // Viewport-% anchor for the dive overlays; lerps screen-centre → centre.
      let screenAnchorX = 50, screenAnchorY = 50;
      const frameEl = splineFrameRef.current;
      if (frameEl) {
        const fr = frameEl.getBoundingClientRect();
        const sIn_w = SCREEN_IN_FRAME.w * fr.width;
        const sIn_h = SCREEN_IN_FRAME.h * fr.height;
        // requiredZoom uses distance-to-furthest-corner so the scissor fully
        // covers the viewport even when the CRT centre is off-centre at rest.
        // Without this, the scissor would clamp asymmetrically and the cube
        // canvas would render off-centre.
        const sCenterX = fr.left + (SCREEN_IN_FRAME.x + SCREEN_IN_FRAME.w / 2) * fr.width;
        const sCenterY = fr.top  + (SCREEN_IN_FRAME.y + SCREEN_IN_FRAME.h / 2) * fr.height;
        // Effective scissor centre LERPS from the CRT viewport position to
        // viewport centre as zoom progresses. By the time cubies become
        // visible (screenZoom ~0.97), the cube canvas viewport is at viewport
        // centre — cubies emerge dead-centre regardless of where the CRT was.
        const effCenterX = THREE.MathUtils.lerp(sCenterX, W / 2, recenter);
        const effCenterY = THREE.MathUtils.lerp(sCenterY, H / 2, recenter);
        // Dive overlays home on the same point so the whole threshold-crossing
        // converges on the CRT screen, then eases to centre with the cube.
        screenAnchorX = THREE.MathUtils.lerp((sCenterX / W) * 100, 50, recenter);
        screenAnchorY = THREE.MathUtils.lerp((sCenterY / H) * 100, 50, recenter);
        // requiredZoom: enough to fully cover the viewport from the effective
        // centre (which ends at viewport centre, so this matches the simple
        // max-of-ratios formula).
        const requiredZoom = Math.max(W / sIn_w, H / sIn_h) * 1.05;
        zoomFactor = 1 + screenZoom * Math.max(0, requiredZoom - 1);
        const sW = sIn_w * zoomFactor;
        const sH = sIn_h * zoomFactor;
        const x1 = Math.max(0, effCenterX - sW / 2);
        const y1 = Math.max(0, effCenterY - sH / 2);
        const x2 = Math.min(W, effCenterX + sW / 2);
        const y2 = Math.min(H, effCenterY + sH / 2);
        vx = x1; vy = y1;
        vw = Math.max(1, x2 - x1);
        vh = Math.max(1, y2 - y1);
        vyBottom = H - vy - vh;
      }
      if (splineZoomRef.current) {
        splineZoomRef.current.style.transform = `scale(${zoomFactor})`;
      }

      // 3) Apply renderer state — cube canvas viewport = live screen rect.
      //    Once the screen overflows the viewport, vx/vy/vw/vh naturally clamp
      //    to (0, 0, W, H), so the scissor becomes a no-op — clean "after-
      //    portal" state without an explicit toggle.
      renderer.setScissorTest(true);
      renderer.setScissor(vx, vyBottom, vw, vh);
      renderer.setViewport(vx, vyBottom, vw, vh);
      camera.aspect = vw / vh;
      camera.updateProjectionMatrix();
      renderer.clear();
      scissorActive = true;

      // 4) Cubies.
      const BURST_RADIUS = 0.5;
      for (let i = 0; i < cubies.length; i++) {
        const c = cubies[i];
        tmpV.copy(c.userData.introPos).multiplyScalar(burst * BURST_RADIUS);
        c.position.lerpVectors(tmpV, c.userData.scrPos, conv);
        if (!prefersReduced && floatAmt > 0.001) {
          c.position.addScaledVector(
            c.userData.floatDir,
            Math.sin(t * c.userData.floatSpeed + c.userData.floatPhase) * floatAmt,
          );
        }
        c.quaternion.slerpQuaternions(c.userData.introQuat, c.userData.scrQuat, conv);
        c.scale.setScalar(popScale);
        c.visible = appear > 0.001;
        (c.material as THREE.MeshStandardMaterial[]).forEach((m, fi) => {
          m.color.copy(origColors[i][fi]);
          m.metalness = 0.12; m.roughness = 0.25;
          m.transparent = appear < 1;
          m.opacity = appear;
        });
      }

      introStage.position.set(0, 0, 0);
      introStage.quaternion.identity();
      introStage.scale.setScalar(1);

      cubeGroup.position.set(0, 0, 0);
      discGroup.position.set(0, 0, 0);
      cubeGroup.scale.setScalar(1); // intro builds the cube at full scale
      smoothCubeX = 0;
      smoothCubeY = 0;
      smoothCubeScale = 1;
      baseRotY = (1 - introT) * 0.6;
      cubeGroup.rotation.set(
        THREE.MathUtils.lerp(0.25, 0.35, introT),
        baseRotY,
        THREE.MathUtils.lerp(0.05, 0.1, introT),
      );
      // Camera trajectory: 6 (rest) → 3.2 (peak push) → 7 (held during burst ring)
      // → 5.5 (settles at intro-end). Lands at 5.5 (not 4.5) so the rotated cube
      // has comfortable margin (0.5 units) at the handoff instead of clipping the
      // top corners. Main phase's phaseHero starts at 5.5 to keep handoff snap-free.
      const zAfterPush     = THREE.MathUtils.lerp(6, 3.2, cameraPushIn);
      const zAfterPullback = THREE.MathUtils.lerp(zAfterPush, 7.0, cameraPullback);
      camera.position.z    = THREE.MathUtils.lerp(zAfterPullback, 5.5, cameraSettle);
      // FOV pulse: gentle widen (+6°) during the dive, returns to base by intro end.
      // Adds peripheral "warping" sense without disorienting the viewer.
      const fovRise = lerp01(introT, 0.32, 0.58);
      const fovFall = 1 - lerp01(introT, 0.58, 0.85);
      const fovPulse = easeInOutSine(Math.max(0, Math.min(fovRise, fovFall)));
      camera.fov = 45 + 6 * fovPulse;
      camera.updateProjectionMatrix();

      // Travel-through overlay effects — three brief pulses around the threshold.
      // Speed streaks: bright radial lines (peak 0.6) suggesting forward velocity.
      // Dive vignette : darkens edges (peak 0.35) for the "crossing the threshold" feel.
      // CRT scanlines : faint horizontal lines (peak 0.18) for lens authenticity.
      const ramp = (a: number, b: number) => easeInOutSine(lerp01(introT, a, b));
      const fade = (a: number, b: number) => 1 - easeInOutSine(lerp01(introT, a, b));
      const streakPulse   = Math.max(0, Math.min(ramp(0.50, 0.65), fade(0.65, 0.78)));
      const vignettePulse = Math.max(0, Math.min(ramp(0.48, 0.62), fade(0.62, 0.78)));
      const scanlinePulse = Math.max(0, Math.min(ramp(0.50, 0.65), fade(0.65, 0.78)));
      if (streaksRef.current) {
        streaksRef.current.style.opacity = (streakPulse * 0.6).toFixed(3);
        // Slight scale-up adds "racing toward us" depth cue, emanating from the
        // CRT screen so the rays point INTO it (not the viewport centre).
        streaksRef.current.style.transformOrigin = `${screenAnchorX.toFixed(1)}% ${screenAnchorY.toFixed(1)}%`;
        streaksRef.current.style.transform = `scale(${(1 + streakPulse * 0.25).toFixed(3)})`;
      }
      if (diveVignetteRef.current) {
        // Lighter dark vignette on phones so the colored cubes read clearly
        // instead of going near-black during the dive.
        diveVignetteRef.current.style.opacity = (vignettePulse * 0.35 * (isMobile ? 0.45 : 1)).toFixed(3);
        // Tunnel darkening centres on the CRT screen during the dive, then eases
        // to viewport centre as the cube takes over.
        diveVignetteRef.current.style.background =
          `radial-gradient(circle at ${screenAnchorX.toFixed(1)}% ${screenAnchorY.toFixed(1)}%, transparent 25%, rgba(0,0,0,0.9) 100%)`;
      }
      if (scanlineRef.current) {
        scanlineRef.current.style.opacity = (scanlinePulse * 0.18).toFixed(3);
      }

      for (const d of discs) {
        (d.material as THREE.MeshStandardMaterial).opacity = 0;
        d.scale.setScalar(0.001);
      }
      pMat.opacity = 0;

      // Hook card: dissolves during the approach (eased holds visible longer,
      // then drops out fast) and drifts up on a slightly tighter window.
      if (introCardRef.current) {
        const dySlide = easeInOutCubic(lerp01(introT, 0.20, 0.40));
        const dy = -dySlide * 130;
        const cardFade = 1 - easeInCubic(lerp01(introT, 0.20, 0.48));
        introCardRef.current.style.opacity = String(Math.max(0, cardFade));
        introCardRef.current.style.transform = isMobile
          ? `translate(-50%, calc(-50% + ${dy}px))`
          : `translateY(calc(-50% + ${dy}px))`;
      }
    }

    function updateIntroExit() {
      // Ambient cube cloud STAYS visible in main phase too — persistent background.
      // Restore full-frame rendering (undo the screen-rect scissor/viewport).
      if (scissorActive) {
        renderer.setScissorTest(false);
        renderer.setViewport(0, 0, innerWidth, innerHeight);
        camera.aspect = innerWidth / innerHeight;
        camera.updateProjectionMatrix();
        scissorActive = false;
      }
      // Hide the Spline desktop once past the intro (also stops it compositing).
      if (splineRef.current && splineRef.current.style.display !== 'none') {
        splineRef.current.style.opacity = '0';
        splineRef.current.style.display = 'none';
        // These intro-only layers are no longer animating — drop their
        // will-change so the compositor can release the promoted layers
        // (a permanent will-change on full-screen fixed layers is costly).
        splineRef.current.style.willChange = 'auto';
        if (splineFitRef.current) splineFitRef.current.style.willChange = 'auto';
        if (splineZoomRef.current) splineZoomRef.current.style.willChange = 'auto';
        if (scanlineRef.current) scanlineRef.current.style.willChange = 'auto';
        if (streaksRef.current) streaksRef.current.style.willChange = 'auto';
        if (diveVignetteRef.current) diveVignetteRef.current.style.willChange = 'auto';
      }
      // Clear the cube-canvas lens blur from Phase 3/4 so main phase renders sharp.
      if (canvasContainerRef.current && canvasContainerRef.current.style.filter) {
        canvasContainerRef.current.style.filter = '';
      }
      // Reset travel-through overlay opacities + camera FOV for main phase.
      if (streaksRef.current) {
        streaksRef.current.style.opacity = '0';
        streaksRef.current.style.transform = 'scale(1)';
      }
      if (diveVignetteRef.current) diveVignetteRef.current.style.opacity = '0';
      if (scanlineRef.current) scanlineRef.current.style.opacity = '0';
      if (camera.fov !== 45) {
        camera.fov = 45;
        camera.updateProjectionMatrix();
      }
      // Reset the stage to identity so the main narrative runs in world space.
      introStage.position.set(0, 0, 0);
      introStage.quaternion.identity();
      introStage.scale.setScalar(1);
      // No hard opacity write here — updateIntro's cardFade already drives
      // the card to opacity 0 by introT=1, so the exit dissolve continues
      // through the approach rather than snapping off at handoff.
    }

    /* ═══ Torus Disc Ring ═══ */
    const DISC_COUNT = 36, torusRadius = 2.0, discRadius = 0.85, discThick = 0.04;
    const discGroup = new THREE.Group();
    const discs: THREE.Mesh[] = [];
    const discPalette = [0x90caf9, 0x2196f3, 0x1565c0, 0xbbdefb, 0x0d47a1, 0x64b5f6, 0x42a5f5, 0xe3f2fd].map(c => new THREE.Color(c));

    for (let i = 0; i < DISC_COUNT; i++) {
      const dGeo = new THREE.CylinderGeometry(discRadius, discRadius, discThick, 32);
      const dMat = new THREE.MeshStandardMaterial({
        color: discPalette[i % discPalette.length],
        metalness: 0.55, roughness: 0.2, transparent: true, opacity: 0, side: THREE.DoubleSide,
      });
      const disc = new THREE.Mesh(dGeo, dMat);
      const ang = (i / DISC_COUNT) * Math.PI * 2;
      disc.userData.torusPos = new THREE.Vector3(Math.cos(ang) * torusRadius, Math.sin(ang) * torusRadius, 0);
      const tangent = new THREE.Vector3(-Math.sin(ang), Math.cos(ang), 0).normalize();
      const q = new THREE.Quaternion();
      const m4 = new THREE.Matrix4().lookAt(new THREE.Vector3(), tangent, new THREE.Vector3(0, 0, 1));
      q.setFromRotationMatrix(m4);
      q.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI / 2));
      disc.userData.torusQuat = q.clone();
      disc.position.copy(disc.userData.torusPos);
      disc.quaternion.copy(disc.userData.torusQuat);
      discs.push(disc);
      discGroup.add(disc);
    }
    scene.add(discGroup);

    const circlePos: THREE.Vector3[] = [];
    for (let i = 0; i < cubies.length; i++) {
      const a = (i / cubies.length) * Math.PI * 2;
      circlePos.push(new THREE.Vector3(Math.cos(a) * torusRadius * 0.5, Math.sin(a) * torusRadius * 0.5, 0));
    }

    /* ═══ Particles ═══ */
    const pCount = 250;
    const pGeo = new THREE.BufferGeometry();
    const pPositions = new Float32Array(pCount * 3);
    const pVelocities: THREE.Vector3[] = [];
    for (let i = 0; i < pCount; i++) {
      pPositions[i * 3] = pPositions[i * 3 + 1] = pPositions[i * 3 + 2] = 0;
      pVelocities.push(new THREE.Vector3((Math.random() - 0.5) * 14, (Math.random() - 0.5) * 14, (Math.random() - 0.5) * 14));
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));
    const pMat = new THREE.PointsMaterial({
      color: 0xC00000, size: 0.04, transparent: true, opacity: 0,
      blending: THREE.NormalBlending, depthWrite: false, sizeAttenuation: true,
    });
    scene.add(new THREE.Points(pGeo, pMat));

    function updateParticles(gp: number) {
      if (gp >= P.s6 && gp <= P.s7) {
        const t = Math.min(1, (gp - P.s6) / (P.s7 - P.s6));
        pMat.opacity = Math.sin(t * Math.PI) * 0.7;
        const et = easeOutExpo(t);
        const arr = pGeo.attributes.position.array as Float32Array;
        for (let i = 0; i < pCount; i++) {
          arr[i * 3]     = pVelocities[i].x * et;
          arr[i * 3 + 1] = pVelocities[i].y * et;
          arr[i * 3 + 2] = pVelocities[i].z * et;
        }
        pGeo.attributes.position.needsUpdate = true;
      } else {
        pMat.opacity = 0;
      }
    }

    /* ═══ Cube target X position ═══ */
    const SHIFT = 2.2;
    // Phones / iPad-portrait (<=768) stack the cube and card VERTICALLY instead of
    // the desktop left/right split. SHIFT_Y is the world-space vertical offset that
    // drops the cube into the bottom half (−Y) or lifts it to the top half (+Y).
    const SHIFT_Y = 1.35;
    // On phones/iPad-portrait the cube shares the screen with a card (stacked), so
    // shrink it a touch to guarantee clean separation in every phase. Smoothed so
    // the intro->main handoff (which builds the cube at scale 1) never pops.
    // (The cube canvas is no longer CSS-scaled on mobile, so this is the cube's
    // only mobile downscale — sized for clean separation from the stacked card.)
    const MOBILE_CUBE_SCALE = 0.55;
    let smoothCubeX = 0;
    let smoothCubeY = 0;
    let smoothCubeScale = 1;
    let baseRotY = 0;
    // Frame-rate independent smoothing helper.
    // `tau` is the time-constant in seconds (≈ time to reach 63%).
    // dt is current frame delta in seconds. Stable on 60Hz/120Hz/144Hz.
    function smoothLerp(current: number, target: number, tau: number, dt: number) {
      const a = 1 - Math.exp(-dt / tau);
      return current + (target - current) * a;
    }

    // Cube sits OPPOSITE the active card so they don't overlap.
    // Boundaries match each card's eIn from the CARDS table:
    //   card-s1 (right) → cube LEFT   from 0.040
    //   card-s2 (left)  → cube RIGHT  from 0.225
    //   card-s3 (right) → cube LEFT   from 0.400
    //   card-s4 (left)  → cube RIGHT  from 0.570
    //   card-s6 (center) → cube CENTER from 0.700
    function cubeTargetX(p: number) {
      if (isMobile) return 0; // phones/iPad-portrait stack vertically (see cubeTargetY)
      if (p < 0.040) return 0;
      if (p < 0.225) return -SHIFT;
      if (p < 0.400) return SHIFT;
      if (p < 0.570) return -SHIFT;
      if (p < 0.700) return SHIFT;
      return 0;
    }

    // Phones / iPad-portrait only: vertical counterpart to cubeTargetX. The cube
    // sits in the half OPPOSITE the card, mapping the card's left/right side to
    // top/bottom — 'right' sections (s1,s3) → card top / cube bottom (−Y → down);
    // 'left' sections (s2,s4) → cube top / card bottom (+Y → up). As you scroll the
    // sides alternate, so the cube and card smoothly interchange halves. Center
    // sections (s6+) keep the cube centred.
    function cubeTargetY(p: number) {
      if (!isMobile) return 0;
      if (p < 0.040) return 0;        // hero
      if (p < 0.225) return -SHIFT_Y; // s1 (right card) → cube bottom
      if (p < 0.400) return SHIFT_Y;  // s2 (left card)  → cube top
      if (p < 0.570) return -SHIFT_Y; // s3 (right card) → cube bottom
      if (p < 0.700) return SHIFT_Y;  // s4 (left card)  → cube top
      return 0;                        // s6+ center
    }

    /* ═══ Animation phases ═══ */
    function phaseHero(lp: number) {
      for (const c of cubies) {
        c.position.copy(c.userData.scrPos);
        c.quaternion.copy(c.userData.scrQuat);
        c.scale.setScalar(1); c.visible = true;
      }
      cubeGroup.rotation.set(0.35, lp * 0.3, 0.1);
      baseRotY = lp * 0.3;
      // Starts at 5.5 to match intro's cameraSettle end value (no handoff snap),
      // then drifts back to 7 across the hero scroll segment.
      camera.position.z = THREE.MathUtils.lerp(5.5, 7, easeOutCubic(lp));
    }

    function phaseScramble(lp: number) {
      for (const c of cubies) {
        c.position.copy(c.userData.scrPos);
        c.quaternion.copy(c.userData.scrQuat);
        c.scale.setScalar(1); c.visible = true;
      }
      cubeGroup.rotation.set(0.35, 0.3 + lp * 0.5, 0.1);
      baseRotY = 0.3 + lp * 0.5;
    }

    function phaseFirstMove(lp: number) {
      const numMoves = Math.ceil(solveMoves.length * 0.3);
      const moveFloat = lp * numMoves;
      const moveIdx = Math.min(Math.floor(moveFloat), numMoves - 1);
      const frac = moveFloat - moveIdx;
      const t = frac < 0.7 ? easeInOutCubic(frac / 0.7) : 1;
      const stateA = solveStates[moveIdx];
      const stateB = solveStates[Math.min(moveIdx + 1, solveStates.length - 1)];
      for (let i = 0; i < cubies.length; i++) {
        cubies[i].position.lerpVectors(stateA[i].p, stateB[i].p, t);
        cubies[i].quaternion.slerpQuaternions(stateA[i].q, stateB[i].q, t);
        cubies[i].scale.setScalar(1); cubies[i].visible = true;
      }
      const ry = 0.8 + lp * 0.4;
      cubeGroup.rotation.set(0.3 - lp * 0.05, ry, 0.1 - lp * 0.05);
      baseRotY = ry;
    }

    function phaseLayers(lp: number) {
      const startMove = Math.ceil(solveMoves.length * 0.3);
      const endMove = Math.ceil(solveMoves.length * 0.85);
      const range = endMove - startMove;
      const moveFloat = lp * range;
      const moveIdx = Math.min(Math.floor(moveFloat), range - 1);
      const frac = moveFloat - moveIdx;
      const t = frac < 0.75 ? easeInOutCubic(frac / 0.75) : 1;
      const absIdx = startMove + moveIdx;
      const stateA = solveStates[absIdx];
      const stateB = solveStates[Math.min(absIdx + 1, solveStates.length - 1)];
      for (let i = 0; i < cubies.length; i++) {
        cubies[i].position.lerpVectors(stateA[i].p, stateB[i].p, t);
        cubies[i].quaternion.slerpQuaternions(stateA[i].q, stateB[i].q, t);
        cubies[i].scale.setScalar(1); cubies[i].visible = true;
      }
      const ry = 1.2 + lp * 0.6;
      cubeGroup.rotation.set(0.25, ry, 0.05);
      baseRotY = ry;
    }

    function phasePrecision(lp: number) {
      const startMove = Math.ceil(solveMoves.length * 0.85);
      const range = solveMoves.length - startMove;
      if (range === 0) {
        for (let i = 0; i < cubies.length; i++) {
          cubies[i].position.copy(solvedState[i].p);
          cubies[i].quaternion.copy(solvedState[i].q);
          cubies[i].scale.setScalar(1); cubies[i].visible = true;
        }
      } else {
        const moveFloat = lp * range;
        const moveIdx = Math.min(Math.floor(moveFloat), range - 1);
        const frac = moveFloat - moveIdx;
        const t = frac < 0.7 ? easeInOutCubic(frac / 0.7) : 1;
        const absIdx = startMove + moveIdx;
        const stateA = solveStates[absIdx];
        const stateB = solveStates[Math.min(absIdx + 1, solveStates.length - 1)];
        for (let i = 0; i < cubies.length; i++) {
          cubies[i].position.lerpVectors(stateA[i].p, stateB[i].p, t);
          cubies[i].quaternion.slerpQuaternions(stateA[i].q, stateB[i].q, t);
          cubies[i].scale.setScalar(1); cubies[i].visible = true;
        }
      }
      camera.position.z = THREE.MathUtils.lerp(7, 5.5, easeInOutCubic(lp));
      const ry = 1.8 + lp * 0.3;
      cubeGroup.rotation.set(0.2, ry, 0.03);
      baseRotY = ry;
    }

    function phaseSolved(lp: number) {
      for (let i = 0; i < cubies.length; i++) {
        cubies[i].position.copy(solvedState[i].p);
        cubies[i].quaternion.copy(solvedState[i].q);
        cubies[i].scale.setScalar(1); cubies[i].visible = true;
      }
      camera.position.z = THREE.MathUtils.lerp(5.5, 7, easeOutCubic(lp));
      const ry = 2.1 + lp * Math.PI * 1.5;
      cubeGroup.rotation.set(0.15, ry, 0.02);
      baseRotY = ry;
    }

    function phaseExplosion(lp: number) {
      const ep = easeOutExpo(lp);
      for (let i = 0; i < cubies.length; i++) {
        cubies[i].position.lerpVectors(solvedState[i].p, cubies[i].userData.explodePos, ep);
        const targetQ = new THREE.Quaternion().setFromEuler(cubies[i].userData.explodeRot);
        cubies[i].quaternion.slerpQuaternions(solvedState[i].q, targetQ, ep);
        cubies[i].scale.setScalar(1 - ep * 0.3);
        cubies[i].visible = true;
      }
      cubeGroup.rotation.set(0.15, baseRotY + lp * 0.4, 0.02);
    }

    function phaseKaizen(lp: number) {
      for (let i = 0; i < cubies.length; i++) {
        const drift = cubies[i].userData.explodePos.clone().multiplyScalar(1 + lp * 0.15);
        cubies[i].position.copy(drift);
        cubies[i].scale.setScalar(Math.max(0.01, 0.7 - lp * 0.5));
        cubies[i].visible = cubies[i].scale.x > 0.02;
      }
    }

    function phaseCircle(lp: number) {
      const mp = easeInOutCubic(lp);
      const bgCol = new THREE.Color(BG_COLOR);
      for (let i = 0; i < cubies.length; i++) {
        const from = cubies[i].userData.explodePos.clone().multiplyScalar(1.15);
        cubies[i].position.lerpVectors(from, circlePos[i], mp);
        const fromQ = new THREE.Quaternion().setFromEuler(cubies[i].userData.explodeRot);
        cubies[i].quaternion.slerpQuaternions(fromQ, new THREE.Quaternion(), mp);
        cubies[i].scale.setScalar(Math.max(0.001, 0.5 * (1 - mp)));
        (cubies[i].material as THREE.MeshStandardMaterial[]).forEach(m => {
          m.color.lerp(bgCol, mp * mp);
          m.transparent = true;
          m.opacity = 1 - mp;
        });
        cubies[i].visible = mp < 0.95;
      }
      const da = Math.max(0, (mp - 0.1) / 0.9);
      for (let i = 0; i < discs.length; i++) {
        const stagger = i / DISC_COUNT;
        const localP = Math.max(0, Math.min(1, (da - stagger * 0.3) / 0.7));
        const lep = easeOutCubic(localP);
        discs[i].position.lerpVectors(new THREE.Vector3(), discs[i].userData.torusPos, lep);
        discs[i].quaternion.slerpQuaternions(new THREE.Quaternion(), discs[i].userData.torusQuat, lep);
        discs[i].scale.setScalar(Math.max(0.001, lep));
        (discs[i].material as THREE.MeshStandardMaterial).opacity = lep * 0.92;
        const shimmer = Math.sin(i * 0.8 + lp * 6) * 0.15;
        (discs[i].material as THREE.MeshStandardMaterial).metalness = 0.5 + shimmer;
        (discs[i].material as THREE.MeshStandardMaterial).roughness = Math.max(0.05, 0.18 - shimmer * 0.1);
      }
      discGroup.rotation.set(
        THREE.MathUtils.lerp(0, 0.6, mp),
        baseRotY + 0.4 + lp * Math.PI * 2,
        THREE.MathUtils.lerp(0, 0.25, mp),
      );
      camera.position.z = THREE.MathUtils.lerp(7, 5.2, mp);
      cubeGroup.rotation.copy(discGroup.rotation);
    }

    /* ═══ Master cube update ═══ */
    function updateCube(p: number) {
      if (p < P.s7) {
        for (let i = 0; i < cubies.length; i++) {
          (cubies[i].material as THREE.MeshStandardMaterial[]).forEach((m, fi) => {
            m.color.copy(origColors[i][fi]);
            m.metalness = 0.12; m.roughness = 0.25;
            m.transparent = false; m.opacity = 1;
          });
          cubies[i].scale.setScalar(1); cubies[i].visible = true;
        }
        if (p >= P.hero) camera.position.z = 7;
        for (const d of discs) {
          (d.material as THREE.MeshStandardMaterial).opacity = 0;
          d.scale.setScalar(0.001);
        }
      }
      if (p > P.s6 && p <= P.s7) {
        for (const d of discs) {
          (d.material as THREE.MeshStandardMaterial).opacity = 0;
          d.scale.setScalar(0.001);
        }
      }

      const targetX = cubeTargetX(p);
      const targetY = cubeTargetY(p);
      // Smooth cube X/Y with ~0.35s time-constant (frame-rate independent).
      // dt is updated by the ticker; fall back to 16.67ms if unavailable.
      smoothCubeX = smoothLerp(smoothCubeX, targetX, 0.35, lastDt);
      smoothCubeY = smoothLerp(smoothCubeY, targetY, 0.35, lastDt);
      cubeGroup.position.x = smoothCubeX;
      discGroup.position.x = smoothCubeX;
      cubeGroup.position.y = smoothCubeY;
      discGroup.position.y = smoothCubeY;
      // Mobile cube downscale (smoothed) for clean card/cube separation.
      smoothCubeScale = smoothLerp(smoothCubeScale, isMobile ? MOBILE_CUBE_SCALE : 1, 0.3, lastDt);
      cubeGroup.scale.setScalar(smoothCubeScale);

      if (p <= P.hero) phaseHero(lerp01(p, 0, P.hero));
      else if (p <= P.s1) phaseScramble(lerp01(p, P.hero, P.s1));
      else if (p <= P.s2) phaseFirstMove(lerp01(p, P.s1, P.s2));
      else if (p <= P.s3) phaseLayers(lerp01(p, P.s2, P.s3));
      else if (p <= P.s4) phasePrecision(lerp01(p, P.s3, P.s4));
      else if (p <= P.s5) phaseSolved(lerp01(p, P.s4, P.s5));
      else if (p <= P.s6) phaseExplosion(lerp01(p, P.s5, P.s6));
      else if (p <= P.s7) phaseKaizen(lerp01(p, P.s6, P.s7));
      else phaseCircle(lerp01(p, P.s7, 1));
    }

    /* ═══ Card animation ═══ */
    const cardEls: Record<string, HTMLElement | null> = {};
    CARDS.forEach(c => { cardEls[c.id] = rootEl.querySelector(`[data-card="${c.id}"]`); });

    function updateCards(p: number) {
      CARDS.forEach(cfg => {
        const el = cardEls[cfg.id];
        if (!el) return;

        // Phones / iPad-portrait: left/right cards stack vertically opposite the
        // cube. 'right' section → card in the TOP half; 'left' section → card in
        // the BOTTOM half. No horizontal slide; the card enters vertically only.
        const stacked = isMobile && (cfg.side === 'left' || cfg.side === 'right');
        const vAnchor = stacked
          ? (cfg.side === 'right' ? -1 : 1) * innerHeight * 0.24
          : 0;

        const sideOffset = stacked ? 0 : (cfg.side === 'left' ? -60 : cfg.side === 'right' ? 60 : 0);
        let opacity = 0, ty = 80, tx = sideOffset, rx = 3, sc = 0.97;

        if (p < cfg.eIn) {
          opacity = 0; ty = 80; tx = sideOffset; rx = 4; sc = 0.94;
        } else if (p < cfg.eFull) {
          const t = easeOutCubic((p - cfg.eIn) / (cfg.eFull - cfg.eIn));
          opacity = t; ty = 80 * (1 - t); tx = sideOffset * (1 - t);
          rx = 4 * (1 - t); sc = 0.94 + 0.06 * t;
        } else if (p < cfg.xS) {
          opacity = 1; ty = 0; tx = 0; rx = 0; sc = 1;
        } else if (p < cfg.xE) {
          const t = easeInOutCubic((p - cfg.xS) / (cfg.xE - cfg.xS));
          opacity = 1 - t; ty = -120 * t; tx = 0; rx = -3 * t; sc = 1 - 0.04 * t;
        } else {
          opacity = 0; ty = -120; tx = 0; rx = -3; sc = 0.96;
        }

        el.style.opacity = String(opacity);
        // autoAlpha-style: a fully-faded card is taken out of the compositor and
        // can never sit invisibly capturing space; anything visible is shown.
        el.style.visibility = opacity < 0.01 ? 'hidden' : 'visible';
        if (cfg.side === 'center') {
          el.style.transform = `translate(-50%, -50%) translateY(${ty}px) perspective(800px) rotateX(${rx}deg) scale(${sc})`;
        } else if (stacked) {
          // Vertically anchored to the top/bottom half; centred horizontally by CSS.
          el.style.transform = `translateY(calc(-50% + ${ty + vAnchor}px)) perspective(800px) rotateX(${rx}deg) scale(${sc})`;
        } else {
          el.style.transform = `translateY(calc(-50% + ${ty}px)) translateX(${tx}px) perspective(800px) rotateX(${rx}deg) scale(${sc})`;
        }

        if (cfg.stg && opacity > 0.2) {
          const items = rootEl.querySelectorAll(`[data-stg^="${cfg.stg}-"]`);
          items.forEach(item => {
            const idx = parseInt(item.getAttribute('data-stg')!.split('-').pop()!);
            if (p >= cfg.ss + idx * cfg.st) {
              item.classList.add('stg-visible');
            } else {
              item.classList.remove('stg-visible');
            }
          });
        }
      });
    }

    /* ═══ UI update ═══ */
    function updateUI(p: number) {
      if (sideRef.current) {
        for (const lbl of SIDE_LABELS) {
          if (p >= lbl[0] && p < lbl[1]) {
            sideRef.current.textContent = lbl[2];
            break;
          }
        }
      }
    }

    /* ═══ Hide fixed layers when scrolled past ═══ */
    function updateFixedVisibility() {
      if (!fixedLayer) return;
      const spacer = rootEl.querySelector('[data-scroll-spacer]') as HTMLElement;
      if (!spacer) return;
      const rect = spacer.getBoundingClientRect();
      // Hex-dome background: display-toggle with the section. display:none
      // collapses its geometry so the IntersectionObserver inside
      // HexDomeBackground reports not-intersecting and idles its rAF for the
      // entire rest of the page (opacity alone would keep the canvas painting).
      if (domeBgRef.current) {
        const show = rect.bottom > 0 ? 'block' : 'none';
        if (domeBgRef.current.style.display !== show) domeBgRef.current.style.display = show;
      }
      // When the bottom of the spacer is above viewport, hide everything
      if (rect.bottom <= 0) {
        fixedLayer.style.opacity = '0';
        fixedLayer.style.pointerEvents = 'none';
      } else if (rect.bottom < window.innerHeight) {
        // Fade out as we approach the end
        const fade = Math.max(0, rect.bottom / window.innerHeight);
        fixedLayer.style.opacity = String(fade);
        fixedLayer.style.pointerEvents = fade < 0.1 ? 'none' : '';
      } else {
        fixedLayer.style.opacity = '1';
        fixedLayer.style.pointerEvents = '';
      }
    }

    /* ═══ Scroll + Render loop ═══ */
    // Use raw scrub progress (no double-smoothing). The JS smoothing layer
    // (smoothProgress) handles the visual ease independent of scroll, so
    // ScrollTrigger.scrub stays at 0 to give us a fresh value every frame.
    const scrollState = { progress: 0 };
    let smoothProgress = 0;
    let lastDt = 1 / 60;
    let elapsed = 0;
    let isVisible = true;
    let scissorActive = false;

    const scrollTrigger = ScrollTrigger.create({
      trigger: rootEl.querySelector('[data-scroll-spacer]') as HTMLElement,
      start: 'top top',
      end: 'bottom bottom',
      // scrub:true reports the RAW (Lenis-smoothed) scroll position every frame —
      // no extra second of ScrollTrigger easing on top. The single smoothing pass
      // and the per-frame velocity clamp on the ticker below do all the work: that
      // clamp is the constant-speed / anti-skip guard, keeping every card's
      // opacity peak renderable no matter how fast the user flicks. Stacking
      // scrub:1 on top of it was what made the motion feel laggy.
      scrub: true,
      invalidateOnRefresh: true,
      onUpdate: self => { scrollState.progress = self.progress; },
      onToggle: self => { isVisible = self.isActive || self.progress < 1; },
      // Snapshot: after a refresh (resize / font swap / Spline load) re-seat the
      // smoothed progress on the real scroll position so no card is left stranded
      // at a partial opacity, and re-apply the correct frame immediately.
      onRefresh: self => {
        scrollState.progress = self.progress;
        smoothProgress = self.progress;
      },
    });

    /* ── "Play like a video" trigger ──
       At the very start (intro visible, still at the top) pressing Enter / Space
       on desktop — or tapping the screen on touch devices — smoothly drives the
       scroll forward through the opening dive until the Rubik's cube has formed,
       so the journey plays like a video. It only animates the scroll position, so
       the existing scroll-driven narrative runs exactly as if scrolled by hand,
       and scrolling back up reverses it unchanged. */
    const AUTOPLAY_TO = INTRO_END + 0.05; // land just past assembly, on the rotating cube
    let autoplaying = false;

    // ── Begin gesture ────────────────────────────────────────────────────────
    // The page is frozen at the very top — that freeze is owned + enforced by
    // SmoothScroll (via the loader store's introScrollLocked flag, locked by
    // RubiksHero before this chunk even downloads), so scrolling/swiping do
    // nothing and nothing time-based ever auto-unlocks. The ONLY first action is
    // Enter/Space (desktop) or a tap (touch): it unlocks the store and drives the
    // opening dive like a video. The CRT reads "Press Enter to begin…".
    // If the gesture happens before the loader clears, remember it and auto-start
    // the instant it does (see tick()).
    let pendingStart = false;
    let loaderClearedMs = 0; // elapsed-clock stamp of when the loader first cleared
    function startFromGesture() {
      if (loaderCompleteRef.current) playIntro();
      else pendingStart = true;
    }

    function playIntro() {
      const lenisInstance = lenisRef.current;
      if (!lenisInstance || autoplaying) return;
      if (!loaderCompleteRef.current) return;   // wait for the loader to clear
      if (scrollState.progress > 0.03) return;  // only from the very start
      const span = scrollTrigger.end - scrollTrigger.start;
      if (span <= 0) return;
      const targetY = scrollTrigger.start + AUTOPLAY_TO * span;
      autoplaying = true;
      // Release the freeze synchronously BEFORE scrolling (a STOPPED Lenis runs
      // the scrollTo animation but never writes it to the page). Clearing the
      // store flag stops SmoothScroll re-locking each frame; we also start Lenis
      // + restore overflow right here so there's no wait for SmoothScroll's async
      // effect. Then the dive runs with lock:true so wheel/touch nudges can't
      // interrupt it — it reads as one clean shot.
      useLoaderStore.getState().unlockIntroScroll();
      const html = document.documentElement;
      html.style.overflow = '';
      html.style.overscrollBehavior = '';
      lenisInstance.start();
      lenisInstance.scrollTo(targetY, {
        duration: 3,
        easing: easeInOutCubic,
        lock: true,   // ignore wheel/touch nudges mid-play so it reads as one clean shot
        onComplete: () => { autoplaying = false; },
      });
    }

    function onKeyDown(e: KeyboardEvent) {
      // Scroll keys are swallowed by SmoothScroll while the freeze is on; here we
      // only care about the begin gesture.
      if (e.key !== 'Enter' && e.key !== ' ' && e.code !== 'Space') return;
      // Don't hijack the key when an interactive element (nav link, button, field)
      // is focused — let its own default behaviour run.
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' ||
          tag === 'BUTTON' || tag === 'A') return;
      if (scrollState.progress > 0.03) return; // only from the very start
      e.preventDefault(); // stop Space/Enter from native page-scroll
      startFromGesture(); // begins now, or the instant the loader clears
    }
    window.addEventListener('keydown', onKeyDown);

    // Touch devices: a tap (not a swipe) near the start plays the dive.
    let touchX = 0, touchY = 0, touchMoved = false;
    function onTouchStart(e: TouchEvent) {
      const t = e.touches[0]; if (!t) return;
      touchX = t.clientX; touchY = t.clientY; touchMoved = false;
    }
    function onTouchMove(e: TouchEvent) {
      const t = e.touches[0]; if (!t) return;
      if (Math.hypot(t.clientX - touchX, t.clientY - touchY) > 12) touchMoved = true;
    }
    // Route taps through startFromGesture (like Enter/Space) so a tap during the
    // countdown is REMEMBERED and begins the dive the instant the loader clears,
    // instead of being dropped by playIntro's not-yet-complete guard.
    function onTouchEnd() { if (!touchMoved) startFromGesture(); }
    if (isTouch) {
      window.addEventListener('touchstart', onTouchStart, { passive: true });
      window.addEventListener('touchmove', onTouchMove, { passive: true });
      window.addEventListener('touchend', onTouchEnd, { passive: true });
    }

    // GSAP ticker drives the loop (single source of truth, lockstep with
    // Lenis + ScrollTrigger). Pass the function reference so we can remove
    // it cleanly on unmount.
    function tick(_time: number, deltaTime: number) {
      // deltaTime is in milliseconds; convert to seconds and clamp so a
      // tab-switch pause can't dump a huge dt into the smoothing math.
      lastDt = Math.min(0.05, Math.max(0.001, deltaTime / 1000));
      elapsed += lastDt;

      // If the user pressed begin while the loader was still up, start the dive
      // — but not the instant the loader clears: the Spline onLoad fires a
      // ScrollTrigger.refresh right then, which would interrupt a dive started on
      // the same frame (leaving it stranded mid-scroll). Wait ~450ms after
      // loader-complete for that burst to settle, then play cleanly.
      if (pendingStart && loaderCompleteRef.current) {
        if (loaderClearedMs === 0) loaderClearedMs = elapsed;
        if (elapsed - loaderClearedMs > 0.45) {
          pendingStart = false;
          playIntro();
        }
      }

      // Skip the heavy three.js work entirely when the section is fully
      // out of view. Cards/UI/visibility checks are cheap so still run.
      updateFixedVisibility();
      // Keep advancing while the eased narrative is still catching up to the
      // scroll position — even if the trigger just went inactive. Otherwise a
      // fast scroll that outruns the smoothed progress would FREEZE the narrative
      // mid-way, stranding the later cards (the old "cards skip to the next
      // section" bug). Only go fully idle once it's both off-screen AND settled.
      if (!isVisible && Math.abs(scrollState.progress - smoothProgress) < 0.002) return;

      // Ease the smoothed progress toward the scroll position, THEN apply a loose
      // per-frame velocity backstop. tau is short (0.16s) so deliberate scrolling
      // tracks closely — crisp, not laggy — and spreads any jump over ~0.16s so a
      // card window can't be crossed in a single frame (anti-skip). The cap
      // (1.4/s) only catches truly violent flicks; it's deliberately well above
      // realistic scroll speed so it never lags the narrative behind the scroll
      // (a tight cap did, then the inactive-trigger gate froze the lagging tail —
      // the old skip bug). The lengthened section + expanded tail keep every
      // card's scroll window wide, so peaks paint across the full 20–60fps range.
      {
        const eased = smoothLerp(smoothProgress, scrollState.progress, 0.16, lastDt);
        const maxStep = 1.4 * lastDt;
        const delta = eased - smoothProgress;
        smoothProgress =
          Math.abs(delta) > maxStep
            ? smoothProgress + Math.sign(delta) * maxStep
            : eased;
      }
      const rawP = smoothProgress;

      // Landing backdrop (blue hex-ripple): full strength while the computer
      // sits at rest, then fades out AS THE COMPUTER ZOOMS IN — the dive runs
      // across introT ~0.32→0.70, so the backdrop recedes with it, revealing
      // the hex-dome canvas beneath (which persists for the whole narrative).
      // Whether the dive is driven by scroll or by the Enter/Space autoplay,
      // both feed the same scroll progress, so the crossfade follows either
      // trigger and reverses on scroll-up. Past the intro it's display:none'd
      // so its canvas rAF idles (the IntersectionObserver inside
      // HexGridBackground stops the loop) for the rest of the cube narrative.
      if (introBgFxRef.current) {
        const introT = rawP / INTRO_END;
        const op = rawP < INTRO_END ? Math.max(0, 1 - lerp01(introT, 0.30, 0.62)) : 0;
        introBgFxRef.current.style.opacity = String(op);
        introBgFxRef.current.style.display = op > 0 ? 'block' : 'none';
      }

      if (rawP < INTRO_END) {
        // Opening act: floating cubes assemble while the hook line holds center.
        updateIntro(rawP / INTRO_END, elapsed);
        if (sideRef.current) sideRef.current.textContent = 'Kaizen Infotech';
      } else {
        // Original narrative — re-mapped onto [0..1] so all phase/card maths
        // below are untouched.
        updateIntroExit();
        const mainP = warpMainP((rawP - INTRO_END) / (1 - INTRO_END));
        updateCube(mainP);
        updateParticles(mainP);
        updateCards(mainP);
        updateUI(mainP);
      }
      renderer.render(scene, camera);
    }
    gsap.ticker.add(tick);

    function onResize() {
      camera.aspect = innerWidth / innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(innerWidth, innerHeight);
      fitSpline();
      computeScreenRect();
      updateZoomOrigin();
    }
    window.addEventListener('resize', onResize);

    return () => {
      gsap.ticker.remove(tick);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('keydown', onKeyDown);
      if (isTouch) {
        window.removeEventListener('touchstart', onTouchStart);
        window.removeEventListener('touchmove', onTouchMove);
        window.removeEventListener('touchend', onTouchEnd);
      }
      // The freeze itself is owned by SmoothScroll (via the store); RubiksHero
      // unlocks it on unmount. Nothing to release here.
      scrollTrigger.kill();
      // Dispose per-mount GPU resources (cubie/disc/particle geometries and
      // materials are all created fresh in this effect) before clearing.
      scene.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        if (mesh.geometry) mesh.geometry.dispose();
        if (mesh.material) {
          const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          mats.forEach((m) => m.dispose());
        }
      });
      renderer.dispose();
      renderer.forceContextLoss?.();
      scene.clear();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, { dependencies: [mounted, prefersReducedMotion], scope: containerRef });

  // Reduced motion: a static, fully-visible stacked list of every message card —
  // no pinning, no fake scroll height, no 3D, no scroll-driven opacity. Each card
  // rests at opacity:1 (same safe resting state as the bento grid), so nothing can
  // ever be skipped or dimmed.
  if (prefersReducedMotion) {
    return <RubiksHeroStatic />;
  }

  if (!mounted) return <div style={{ height: `${SPACER_VH}vh`, background: BG_COLOR }} />;

  return (
    <div ref={containerRef} className="relative" style={{ background: BG_COLOR }}>
      {/* All fixed elements wrapped in a single layer for visibility control */}
      <div ref={fixedLayerRef} className="transition-opacity duration-300" style={{ willChange: 'opacity' }}>
        {/* Cube-narrative motion background — recreates the client's reference
            video (BackDrop Rubix Section.mp4): two massive convex honeycomb
            DOMES flanking lower-left and upper-right, high-density white hex
            lattice over light-grey cells, both surfaces dissolving into a
            bright radial glow at the central vanishing point, with the pattern
            slowly ROLLING along each curved surface in a seamless loop (see
            HexDomeBackground). Sits at the BOTTOM of the backdrop stack: the
            opaque landing backdrop below covers it at rest and fades out on
            the dive, revealing this canvas for the whole cube narrative
            (replacing the old hex-prism field). pointer-events-none so the
            computer/scroll stay interactive; motion is ambient-only per the
            reference. `active` gated on loaderComplete so the canvas never
            competes with the Spline/Three.js boot on a cold load; display is
            toggled off by updateFixedVisibility once the section has fully
            scrolled past. */}
        <div ref={domeBgRef} aria-hidden className="pointer-events-none fixed inset-0 z-[-1]">
          <HexDomeBackground active={loaderComplete} />
        </div>

        {/* Landing-page hex-grid backdrop — continuous, full-bleed animated
            honeycomb for the opening act, sitting behind the Spline computer
            and the hook card. Tiny grey lattice over the soft blue-white stage
            with a 3D light-blue water-ripple flowing left→right and a per-tile
            micro-animation under the cursor (HexGridBackground tracks the
            pointer on `window`, so pointer-events-none keeps the computer/
            scroll interactive). The wrapper's opacity + display are scroll-
            driven in tick(): opaque at rest (covering the hex-dome canvas
            beneath), crossfading out during the dive. */}
        <div
          ref={introBgFxRef}
          aria-hidden
          className="pointer-events-none fixed inset-0 z-[-1]"
          // Soft blue-white stage so the WHITE honeycomb reads and the field
          // feels "white and blue". Opaque, so it fully covers the hex-dome
          // canvas below until the dive crossfades it away.
          style={{ opacity: 1, background: '#e9eef8' }}
        >
          {/* active gated on loaderComplete: the honeycomb stays inert behind
              the countdown loader so it never competes with the Spline/Three.js
              boot on a cold load — it starts the moment the hero reveals. */}
          <HexGridBackground variant="mono" waveDirection="radial" active={loaderComplete} />
        </div>

        {/* Spline desktop (opening act) — right side, behind the transparent cube canvas.
            Width is set per-device in the effect; opacity/scale are scroll-driven. */}
        <div
          ref={splineRef}
          className="fixed inset-y-0 right-0 z-0"
          style={{ pointerEvents: 'auto', willChange: 'opacity', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 60, paddingLeft: 120 }}
        >
          {/* Fit layer: scales the fixed-size canvas DOWN to fit the viewport so the
              whole monitor is always visible (never cropped) at any window size. */}
          <div ref={splineFitRef} style={{ transformOrigin: 'center center', willChange: 'transform' }}>
          {/* Fixed design-size frame (square). Floats gently inside its container. */}
          <div
            ref={splineFrameRef}
            className="rc-spline-float"
            style={{ position: 'relative', width: SPLINE_DESIGN_W, height: SPLINE_DESIGN_H }}
          >
            {/* Blurred poster placeholder — fills the same design-space box as the
                Spline canvas, so it scales/positions 1:1 with it. Held until the
                3D scene loads, then cross-fades out (the real monitor renders in
                the exact same spot, so there's no pop). Inline width/height beat
                the unlayered `img{height:auto}` reset (same trick as the video). */}
            <img
              src="/images/hero/spline-monitor-poster-v2.webp"
              alt=""
              aria-hidden
              draggable={false}
              // LCP element. v2 is the full-quality 2412×1808 capture (~95KB
              // q86) — the old 14.5KB webp relied on a heavy CSS blur to hide
              // its compression, which made the monitor read as permanently
              // smeared on touch devices (where this poster IS the monitor).
              // fetchPriority=high + decoding=async + the matching
              // <link rel=preload> on the home route (src/app/page.tsx) make it
              // discoverable and painted early even though this component is a
              // dynamic(ssr:false) chunk.
              fetchPriority="high"
              decoding="async"
              style={{
                position: 'absolute', inset: 0,
                width: '100%', height: '100%', maxWidth: 'none',
                objectFit: 'fill',
                // Touch: the live Spline never mounts — show the monitor fully
                // CRISP. Desktop: a light defocus as the placeholder "focuses
                // in" when the live scene crossfades over it.
                filter: cap.coarsePointer ? 'none' : 'blur(2.5px)',
                transform: 'scale(1.04)',
                opacity: splineLoaded ? 0 : 1,
                transition: 'opacity 0.9s cubic-bezier(0.22, 1, 0.36, 1)',
                pointerEvents: 'none',
                willChange: 'opacity',
              }}
            />
            {/* Zoom layer — scroll pushes IN toward the monitor screen (immersive).
                transformOrigin is set to the screen centre in the effect. */}
            <div ref={splineZoomRef} style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: -120, transformOrigin: '48% 36%', willChange: 'transform' }}>
              {splineNearViewport && allowLiveMonitor && (
                <SplineErrorBoundary>
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    // Gentle crossfade-in that mirrors the poster's fade-out, with a
                    // tiny scale settle so the computer eases into place rather than
                    // snapping on. Kept on this dedicated wrapper so it never fights
                    // the scroll-driven transforms on the parent zoom/fit layers.
                    opacity: splineLoaded ? 1 : 0,
                    transform: splineLoaded ? 'scale(1)' : 'scale(1.015)',
                    transition:
                      'opacity 0.9s cubic-bezier(0.22, 1, 0.36, 1), transform 1.2s cubic-bezier(0.22, 1, 0.36, 1)',
                    willChange: 'opacity, transform',
                  }}
                >
                <Spline
                  scene={SPLINE_SCENE_URL}
                  onLoad={(app: unknown) => {
                    // Keep a handle on the Spline app so the scene can be driven
                    // imperatively (emit events, find objects) from anywhere.
                    splineAppRef.current = app;

                    // Drive the scene imperatively. The runtime Application exposes
                    // play()/stop() (render-loop control) and emitEvent() (trigger a
                    // scene event). Names can vary, so calls are defensive + swallowed.
                    const splineApp = app as {
                      play?: () => void;
                      stop?: () => void;
                      emitEvent?: (event: string, nameOrUuid: string) => void;
                    };
                    // Resume the render loop and (re)fire the CRT typing so it animates
                    // cleanly from the start, in view, once the loader has cleared.
                    const playIntro = () => {
                      try { splineApp.play?.(); } catch { /* ignore */ }
                      try { splineApp.emitEvent?.('start', 'code 2'); } catch { /* ignore */ }
                      try { splineApp.emitEvent?.('start', 'code'); } catch { /* ignore */ }
                    };
                    splineStartRef.current = playIntro;

                    // Hide the pointing-hand prop, if this scene ships one (older scene did).
                    try {
                      const a = app as { findObjectByName?: (n: string) => { visible?: boolean } | undefined };
                      const hand = a.findObjectByName?.('hand');
                      if (hand) hand.visible = false;
                    } catch {
                      /* no-op */
                    }
                    // The heavy 3D scene paints late; recompute trigger positions.
                    ScrollTrigger.refresh();

                    // Let the canvas paint a couple of real frames, then cross-fade the
                    // poster out onto the sharp scene. If the loader is still up, FREEZE
                    // the scene (stop the render loop) so its typing doesn't burn off
                    // behind the overlay — the loader-complete effect resumes + plays it.
                    // If the loader already cleared (returning visitor), play immediately.
                    requestAnimationFrame(() =>
                      requestAnimationFrame(() => {
                        setSplineLoaded(true);
                        if (loaderCompleteRef.current) {
                          playIntro();
                        } else {
                          try { splineApp.stop?.(); } catch { /* ignore */ }
                        }
                      })
                    );
                  }}
                />
                </div>
                </SplineErrorBoundary>
              )}
              {/* Dissolve the canvas-drawn "Built with Spline" watermark (bottom-right).
                  A flat fill left a bright rectangle because the scene background is a
                  textured gradient, not flat #f5f5f5. Instead we frost the corner with a
                  backdrop blur (uses the REAL pixels behind, so it matches the local
                  colour) plus a faint wash to wipe the wordmark, then fade the whole
                  patch out with a radial mask so there's no hard edge to notice. */}
              <div
                aria-hidden
                className="rc-wm-mask"
                style={{
                  position: 'absolute', bottom: 0, right: 0,
                  width: '38%', height: '14%',
                  background: 'rgba(245,245,245,0.45)',
                  backdropFilter: 'blur(14px)',
                  WebkitBackdropFilter: 'blur(14px)',
                  WebkitMaskImage: 'radial-gradient(135% 135% at 100% 100%, #000 42%, transparent 78%)',
                  maskImage: 'radial-gradient(135% 135% at 100% 100%, #000 42%, transparent 78%)',
                  pointerEvents: 'none',
                }}
              />
            </div>
          </div>
          </div>
        </div>

        {/* CRT scanlines — sits over Spline, under the cube canvas. Opacity is
            driven from updateIntro; transparent outside the dive window. */}
        <div
          ref={scanlineRef}
          aria-hidden
          className="pointer-events-none fixed inset-0 z-[0]"
          style={{
            opacity: 0,
            backgroundImage:
              'repeating-linear-gradient(to bottom, rgba(0,0,0,0.55) 0px, rgba(0,0,0,0.55) 1px, transparent 1px, transparent 3px)',
            mixBlendMode: 'multiply',
            willChange: 'opacity',
          }}
        />

        {/* Fixed canvas (transparent) — cubes render on top of the Spline desktop.
            pointer-events:none so the Spline below stays mouse-interactive (its effects). */}
        <div ref={canvasContainerRef} className="fixed inset-0 z-[1]" style={{ pointerEvents: 'none' }} />

        {/* Subtle vignette for light theme */}
        <div
          className="pointer-events-none fixed inset-0 z-[2]"
          style={{ background: 'radial-gradient(ellipse at center, transparent 45%, rgba(245,245,245,0.7) 100%)' }}
        />

        {/* Dive vignette — darkens viewport edges around the threshold so the
            user feels they're crossing into the screen. Opacity from updateIntro. */}
        <div
          ref={diveVignetteRef}
          aria-hidden
          className="pointer-events-none fixed inset-0 z-[3]"
          style={{
            opacity: 0,
            background: 'radial-gradient(circle at center, transparent 25%, rgba(0,0,0,0.9) 100%)',
            willChange: 'opacity',
          }}
        />

        {/* Radial speed streaks — implies forward velocity through the threshold.
            Conic-gradient creates radial light rays, masked to fade in the centre
            so they don't obscure the subject. Opacity + scale from updateIntro. */}
        <div
          ref={streaksRef}
          aria-hidden
          className="pointer-events-none fixed inset-0 z-[3]"
          style={{
            opacity: 0,
            transformOrigin: '50% 50%',
            backgroundImage:
              'conic-gradient(from 0deg at center, transparent 0deg, rgba(255,255,255,0.55) 1deg, transparent 3deg, transparent 12deg, rgba(255,255,255,0.4) 13deg, transparent 15deg, transparent 27deg, rgba(255,255,255,0.5) 28deg, transparent 30deg, transparent 47deg, rgba(255,255,255,0.35) 48deg, transparent 50deg, transparent 67deg, rgba(255,255,255,0.45) 68deg, transparent 70deg, transparent 92deg, rgba(255,255,255,0.4) 93deg, transparent 95deg, transparent 119deg, rgba(255,255,255,0.5) 120deg, transparent 122deg, transparent 145deg, rgba(255,255,255,0.35) 146deg, transparent 148deg, transparent 175deg, rgba(255,255,255,0.45) 176deg, transparent 178deg, transparent 201deg, rgba(255,255,255,0.4) 202deg, transparent 204deg, transparent 232deg, rgba(255,255,255,0.5) 233deg, transparent 235deg, transparent 261deg, rgba(255,255,255,0.35) 262deg, transparent 264deg, transparent 295deg, rgba(255,255,255,0.45) 296deg, transparent 298deg, transparent 327deg, rgba(255,255,255,0.4) 328deg, transparent 330deg, transparent 359deg)',
            WebkitMaskImage: 'radial-gradient(circle at center, transparent 18%, black 65%)',
            maskImage: 'radial-gradient(circle at center, transparent 18%, black 65%)',
            mixBlendMode: 'screen',
            willChange: 'opacity, transform',
          }}
        />

        {/* Glass card layer */}
        <div className="pointer-events-none fixed inset-0 z-[5] overflow-hidden">
          {/* OPENING HOOK — left side, rises left-bottom → left-center, fades as we enter the screen */}
          <div
            ref={introCardRef}
            className="rc-glass-card rc-side-left rc-hook-card"
            style={{ opacity: 1, transform: 'translateY(-50%)' }}
          >
            <div ref={introInnerRef} className="rc-hook-inner" style={{ opacity: 0 }}>
              {/* div, not h1 — the homepage's semantic <h1> is the server-rendered
                  BrandPromise value prop; this animated hero hook is decorative. */}
              <div className="rc-hook-title">
                <span className="rc-hook-t1">Your Vision</span>
                <em className="rc-hook-t2">Our Code</em>
              </div>
              <span className="rc-tap-cue" aria-hidden="true">Tap to begin</span>
            </div>
          </div>

          {/* S1: THE SCRAMBLE */}
          <div data-card="card-s1" className="rc-glass-card rc-side-right rc-card-hero" style={{ opacity: 0 }}>
            {/* h2 (was h1) — consistent with the other narrative cards (s2… are h2)
                and leaves BrandPromise as the single page <h1>. */}
            <h2 className="rc-headline rc-headline-hero">
              <span className="rc-stagger" data-stg="s1-0">A scrambled Rubik&apos;s Cube looks <em>impossible</em> at first &mdash;</span>
              <span className="rc-stagger" data-stg="s1-1">and so does your business.</span>
            </h2>
          </div>

          {/* S2: THE FIRST MOVE */}
          <div data-card="card-s2" className="rc-glass-card rc-side-left rc-card-s2" style={{ opacity: 0 }}>
            <h2 className="rc-headline rc-headline-s2">
              <span className="rc-stagger" data-stg="s2-0">Fixing everything at once only makes it <em>worse.</em></span>
              <span className="rc-stagger" data-stg="s2-1">The right move, in the right sequence, changes everything.</span>
            </h2>
          </div>

          {/* S3: HOW WE APPLY KAIZEN */}
          <div data-card="card-s3" className="rc-glass-card rc-side-right rc-card-s3" style={{ opacity: 0 }}>
            <h2 className="rc-headline rc-headline-s3">
              <span className="rc-stagger" data-stg="s3-0">We don&apos;t force technology onto your operations.</span>
              <span className="rc-stagger" data-stg="s3-1">We <em>understand your structure</em> &mdash; then solve it, step by step.</span>
            </h2>
          </div>

          {/* S4: FROM CHAOS TO CLARITY */}
          <div data-card="card-s4" className="rc-glass-card rc-side-left rc-card-s4" style={{ opacity: 0 }}>
            <h2 className="rc-headline rc-headline-s4">
              <span className="rc-stagger" data-stg="s4-0">No temporary fixes. What was <em>complex becomes structured.</em></span>
              <span className="rc-stagger" data-stg="s4-1">What slowed you down begins to accelerate you.</span>
            </h2>
          </div>

          {/* S6: TRANSFORMATION */}
          <div data-card="card-s6" className="rc-glass-card rc-side-center rc-card-s6" style={{ opacity: 0 }}>
            <h2 className="rc-headline rc-headline-s6">
              <span className="rc-stagger" data-stg="s6-0"><em>Anyone can twist the cube.</em></span>
              <span className="rc-stagger" data-stg="s6-1">It takes expertise to <em>solve it.</em></span>
            </h2>
          </div>

          {/* S7: KAIZEN */}
          <div data-card="card-s7" className="rc-glass-card rc-side-center rc-card-s7 rc-wide" style={{ opacity: 0 }}>
            <div className="rc-kaizen-title rc-stagger" data-stg="s7-0">This is <span style={{ color: 'var(--color-accent-primary)' }}>Kaizen.</span></div>
            <div className="rc-kaizen-tagline rc-stagger" data-stg="s7-1">Built Layer By Layer</div>
            <div className="rc-kaizen-sub rc-stagger" data-stg="s7-2">Business-First Thinking &middot; Scalable Architecture &middot; Clean Development &middot; Transparent Execution</div>
          </div>

          {/* S8: CTA */}
          <div data-card="card-s8" className="rc-glass-card rc-side-center rc-card-s8 rc-wide" style={{ opacity: 0 }}>
            <div className="rc-service-title rc-stagger" data-stg="s8-0">Let&apos;s Solve It &mdash; <em>The Right Way</em></div>
          </div>
        </div>
      </div>

      {/* Scroll spacer */}
      <div data-scroll-spacer className="relative z-[1]" style={{ height: `${SPACER_VH}vh`, pointerEvents: 'none' }} />
    </div>
  );
}
