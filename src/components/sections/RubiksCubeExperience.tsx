'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { gsap, registerGSAPPlugins, ScrollTrigger } from '@/lib/animations/gsap-setup';

/* ══════════════════════════════════════════════════════════════
   RubiksCubeExperience — 3D Rubik's Cube scroll narrative
   White/light theme matching the rest of the website
   ══════════════════════════════════════════════════════════════ */

/* ── Easing helpers ── */
function easeOutExpo(t: number) { return t === 1 ? 1 : 1 - Math.pow(2, -10 * t); }
function easeInOutCubic(t: number) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
function easeOutCubic(t: number) { return 1 - Math.pow(1 - t, 3); }
function lerp01(val: number, a: number, b: number) { return Math.max(0, Math.min(1, (val - a) / (b - a))); }

/* ── Phase boundaries ── */
const P = { hero: 0.04, s1: 0.12, s2: 0.26, s3: 0.48, s4: 0.60, s5: 0.68, s6: 0.76, s7: 0.83 };

/* ── Side labels ── */
const SIDE_LABELS = [
  [0, 0.12, '01 \u2014 The Scramble'],
  [0.12, 0.26, '02 \u2014 The First Move'],
  [0.26, 0.48, '03 \u2014 How We Apply Kaizen'],
  [0.48, 0.60, '04 \u2014 From Chaos to Clarity'],
  [0.60, 0.68, '05 \u2014 Real Transformation'],
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
  { id: 'card-s1', eIn: 0.040, eFull: 0.062, xS: 0.082, xE: 0.098, side: 'right', stg: 's1', ss: 0.046, st: 0.007 },
  { id: 'card-s1b', eIn: 0.100, eFull: 0.115, xS: 0.126, xE: 0.138, side: 'right', stg: 's1b', ss: 0.105, st: 0.008 },
  { id: 'card-s2', eIn: 0.140, eFull: 0.165, xS: 0.200, xE: 0.220, side: 'left', stg: 's2', ss: 0.148, st: 0.015 },
  { id: 'card-s2b', eIn: 0.222, eFull: 0.245, xS: 0.258, xE: 0.272, side: 'left', stg: 's2b', ss: 0.230, st: 0.012 },
  { id: 'card-s3', eIn: 0.275, eFull: 0.300, xS: 0.360, xE: 0.380, side: 'right', stg: 's3', ss: 0.285, st: 0.012 },
  { id: 'card-s3b', eIn: 0.382, eFull: 0.405, xS: 0.445, xE: 0.465, side: 'right', stg: 's3b', ss: 0.388, st: 0.009 },
  { id: 'card-s4', eIn: 0.495, eFull: 0.525, xS: 0.570, xE: 0.598, side: 'left', stg: 's4', ss: 0.505, st: 0.012 },
  { id: 'card-s5', eIn: 0.610, eFull: 0.638, xS: 0.660, xE: 0.678, side: 'right', stg: 's5', ss: 0.618, st: 0.012 },
  { id: 'card-s6', eIn: 0.700, eFull: 0.725, xS: 0.745, xE: 0.762, side: 'center', stg: 's6', ss: 0.710, st: 0.015 },
  { id: 'card-s7', eIn: 0.770, eFull: 0.795, xS: 0.818, xE: 0.835, side: 'center', stg: 's7', ss: 0.780, st: 0.015 },
  { id: 'card-s8', eIn: 0.870, eFull: 0.910, xS: 1.000, xE: 1.100, side: 'center', stg: 's8', ss: 0.890, st: 0.018 },
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted || !canvasContainerRef.current || !containerRef.current) return;
    registerGSAPPlugins();

    const container = canvasContainerRef.current;
    const rootEl = containerRef.current;
    const fixedLayer = fixedLayerRef.current;

    /* ═══ THREE.js Scene — Light theme ═══ */
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(BG_COLOR);
    scene.fog = new THREE.FogExp2(new THREE.Color(BG_COLOR).getHex(), 0.02);

    const camera = new THREE.PerspectiveCamera(45, innerWidth / innerHeight, 0.1, 100);
    camera.position.set(0, 0, 4.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(innerWidth, innerHeight);
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
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
    scene.add(cubeGroup);

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
      const dir = solvedState[i].p.clone().normalize();
      if (dir.length() < 0.01) dir.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize();
      const dist = 5 + Math.random() * 5;
      cubies[i].userData.explodePos = dir.multiplyScalar(dist).add(
        new THREE.Vector3((Math.random() - 0.5) * 3, (Math.random() - 0.5) * 3, (Math.random() - 0.5) * 3)
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
      if (gp > 0.66 && gp < 0.77) {
        const t = (gp - 0.66) / 0.11;
        pMat.opacity = Math.sin(t * Math.PI) * 0.7;
        const arr = pGeo.attributes.position.array as Float32Array;
        for (let i = 0; i < pCount; i++) {
          arr[i * 3] = pVelocities[i].x * t;
          arr[i * 3 + 1] = pVelocities[i].y * t;
          arr[i * 3 + 2] = pVelocities[i].z * t;
        }
        pGeo.attributes.position.needsUpdate = true;
      } else {
        pMat.opacity = 0;
      }
    }

    /* ═══ Cube target X position ═══ */
    const SHIFT = 2.2;
    let smoothCubeX = 0;
    let baseRotY = 0;

    function cubeTargetX(p: number) {
      if (p < P.hero) return 0;
      if (p < P.s1) return -SHIFT;
      if (p < P.s2) return SHIFT;
      if (p < P.s3) return -SHIFT;
      if (p < P.s4) return SHIFT;
      if (p < P.s5) return -SHIFT;
      return 0;
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
      camera.position.z = THREE.MathUtils.lerp(4.5, 7, easeOutCubic(lp));
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
      smoothCubeX += (targetX - smoothCubeX) * 0.05;
      cubeGroup.position.x = smoothCubeX;
      discGroup.position.x = smoothCubeX;

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

        const sideOffset = cfg.side === 'left' ? -60 : cfg.side === 'right' ? 60 : 0;
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
        if (cfg.side === 'center') {
          el.style.transform = `translate(-50%, -50%) translateY(${ty}px) perspective(800px) rotateX(${rx}deg) scale(${sc})`;
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
    const scrollState = { progress: 0 };
    let smoothProgress = 0;

    ScrollTrigger.create({
      trigger: rootEl.querySelector('[data-scroll-spacer]') as HTMLElement,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 1.5,
      onUpdate: self => { scrollState.progress = self.progress; },
    });

    let animId: number;
    function render() {
      animId = requestAnimationFrame(render);
      smoothProgress += (scrollState.progress - smoothProgress) * 0.05;
      updateCube(smoothProgress);
      updateParticles(smoothProgress);
      updateCards(smoothProgress);
      updateUI(smoothProgress);
      updateFixedVisibility();
      renderer.render(scene, camera);
    }
    render();

    function onResize() {
      camera.aspect = innerWidth / innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(innerWidth, innerHeight);
    }
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
      ScrollTrigger.getAll().forEach(st => st.kill());
      renderer.dispose();
      scene.clear();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [mounted]);

  if (!mounted) return <div style={{ height: '1600vh', background: BG_COLOR }} />;

  return (
    <div ref={containerRef} className="relative" style={{ background: BG_COLOR }}>
      {/* All fixed elements wrapped in a single layer for visibility control */}
      <div ref={fixedLayerRef} className="transition-opacity duration-300" style={{ willChange: 'opacity' }}>
        {/* Fixed canvas */}
        <div ref={canvasContainerRef} className="fixed inset-0 z-0" />

        {/* Subtle vignette for light theme */}
        <div
          className="pointer-events-none fixed inset-0 z-[2]"
          style={{ background: 'radial-gradient(ellipse at center, transparent 45%, rgba(245,245,245,0.7) 100%)' }}
        />

        {/* Side label */}
        <div
          ref={sideRef}
          className="fixed right-6 top-1/2 z-10 -translate-y-1/2 rotate-90 whitespace-nowrap"
          style={{ fontSize: '0.75rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(0,0,0,0.15)' }}
        >
          01 &mdash; The Scramble
        </div>

        {/* Glass card layer */}
        <div className="pointer-events-none fixed inset-0 z-[5] overflow-hidden">
          {/* S1: THE SCRAMBLE */}
          <div data-card="card-s1" className="rc-glass-card rc-side-right rc-card-hero" style={{ opacity: 0 }}>
            <div className="rc-overline">&#x1f539; Kaizen</div>
            <h1 className="rc-headline rc-headline-hero">
              <span className="rc-stagger" data-stg="s1-0">A scrambled Rubik&apos;s Cube</span>
              <span className="rc-stagger" data-stg="s1-1">looks <em>impossible</em> at first.</span>
            </h1>
            <p className="rc-body rc-stagger" data-stg="s1-2">Colors are scattered. Patterns are broken. Every move seems to disrupt something else.</p>
            <div className="rc-scroll-cue"><span>Scroll</span><div className="rc-scroll-line" /></div>
          </div>

          <div data-card="card-s1b" className="rc-glass-card rc-side-right rc-card-hero" style={{ opacity: 0 }}>
            <p className="rc-body rc-stagger" data-stg="s1b-0" style={{ margin: 0, fontSize: '1.0625rem', color: '#1a1a1a' }}>Many organizations feel exactly the same.</p>
            <p className="rc-body rc-stagger" data-stg="s1b-1" style={{ marginTop: '0.6rem' }}>Disconnected systems. Manual processes. Scattered data. Limited visibility. Growing complexity.</p>
          </div>

          {/* S2: THE FIRST MOVE */}
          <div data-card="card-s2" className="rc-glass-card rc-side-left rc-card-s2" style={{ opacity: 0 }}>
            <div className="rc-section-num">02 &mdash; The First Move</div>
            <h2 className="rc-headline rc-headline-s2">
              <span className="rc-stagger" data-stg="s2-0">Trying to fix everything at once only makes it <em>worse.</em></span>
            </h2>
            <p className="rc-body rc-stagger" data-stg="s2-1">But solving a Rubik&apos;s Cube isn&apos;t about random twists. It&apos;s about understanding the structure &mdash; and making the right moves in the right sequence.</p>
          </div>

          <div data-card="card-s2b" className="rc-glass-card rc-side-left rc-card-s2" style={{ opacity: 0 }}>
            <h2 className="rc-headline rc-headline-s2">
              <span className="rc-stagger" data-stg="s2b-0">That philosophy is called <em>Kaizen.</em></span>
            </h2>
            <p className="rc-body rc-stagger" data-stg="s2b-1">Continuous improvement through thoughtful, deliberate action.</p>
          </div>

          {/* S3: HOW WE APPLY KAIZEN */}
          <div data-card="card-s3" className="rc-glass-card rc-side-right rc-card-s3" style={{ opacity: 0 }}>
            <div className="rc-section-num">03 &mdash; How We Apply Kaizen</div>
            <h2 className="rc-headline rc-headline-s3">
              <span className="rc-stagger" data-stg="s3-0">We don&apos;t force technology</span>
              <span className="rc-stagger" data-stg="s3-1">onto your <em>operations.</em></span>
            </h2>
            <p className="rc-body rc-stagger" data-stg="s3-2">We study your business first. Your workflows. Your users. Your bottlenecks. Your growth goals.</p>
          </div>

          <div data-card="card-s3b" className="rc-glass-card rc-side-right rc-card-s3b" style={{ opacity: 0 }}>
            <div className="rc-section-num rc-stagger" data-stg="s3b-0" style={{ marginBottom: '0.6rem' }}>Then we start improving &mdash; step by step.</div>
            <div className="rc-stagger rc-method" data-stg="s3b-1">&#10004; Automating manual processes</div>
            <div className="rc-stagger rc-method" data-stg="s3b-2">&#10004; Integrating disconnected systems</div>
            <div className="rc-stagger rc-method" data-stg="s3b-3">&#10004; Creating meaningful dashboards</div>
            <div className="rc-stagger rc-method" data-stg="s3b-4">&#10004; Enhancing user experience</div>
            <div className="rc-stagger rc-method rc-method-hl" data-stg="s3b-5">&#10004; Strengthening security &amp; scalability</div>
          </div>

          {/* S4: FROM CHAOS TO CLARITY */}
          <div data-card="card-s4" className="rc-glass-card rc-side-left rc-card-s4" style={{ opacity: 0 }}>
            <div className="rc-section-num">04 &mdash; From Chaos to Clarity</div>
            <h2 className="rc-headline rc-headline-s4">
              <span className="rc-stagger" data-stg="s4-0">What looks complex becomes <em>structured.</em></span>
            </h2>
            <div className="rc-stagger rc-solved-word" data-stg="s4-1" style={{ marginTop: '0.8rem' }}>What feels disconnected becomes aligned.</div>
            <div className="rc-stagger rc-solved-word" data-stg="s4-2" style={{ color: 'var(--color-accent-primary)', fontStyle: 'italic' }}>What slows growth begins to accelerate it.</div>
          </div>

          {/* S5: REAL TRANSFORMATION */}
          <div data-card="card-s5" className="rc-glass-card rc-side-right rc-card-s5" style={{ opacity: 0 }}>
            <div className="rc-section-num">05 &mdash; Real Transformation</div>
            <div className="rc-stagger rc-solved-word" data-stg="s5-0">No temporary fixes.</div>
            <div className="rc-stagger rc-solved-word" data-stg="s5-1">Solutions that evolve with you.</div>
            <div className="rc-stagger rc-solved-word" data-stg="s5-2" style={{ color: 'var(--color-accent-primary)', fontStyle: 'italic' }}>Consistent, intelligent progress.</div>
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
            <div className="rc-service-desc rc-stagger" data-stg="s8-1">If your organization feels like a scrambled cube, you don&apos;t need more random moves. You need the right strategy. Let&apos;s turn complexity into clarity &mdash; one intelligent move at a time.</div>
            <div className="rc-cta-row rc-stagger" data-stg="s8-2">
              <a href="/services" className="rc-cta-btn rc-cta-primary">Explore Our Services</a>
              <a href="/contact" className="rc-cta-btn rc-cta-secondary">Talk to Our Experts</a>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll spacer */}
      <div data-scroll-spacer className="relative z-[1]" style={{ height: '1600vh', pointerEvents: 'none' }} />
    </div>
  );
}
