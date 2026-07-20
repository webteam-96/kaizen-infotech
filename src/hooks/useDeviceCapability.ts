'use client';

import { useSyncExternalStore } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// useDeviceCapability — one client-only source of truth for "how much experience
// can this device/connection take?", so the heavy 3D hero, background videos and
// canvas effects can adapt consistently instead of each re-deriving device signals.
//
// Resolved via useSyncExternalStore (not useState+useEffect): getServerSnapshot
// returns the SSR default (`ready:false`) so SSR + hydration match, then the REAL
// value is committed on the FIRST client render — before the browser paints —
// instead of one frame LATER in an effect. That timing matters: the old effect-based
// resolution let the hero paint its 720vh placeholder and THEN collapse to the short
// static hero on lite/reduced-motion devices (a large layout shift that CrUX field
// data caught but the loader-masked lab run did not). Fails OPEN: unknown signals
// (Safari/Firefox lack navigator.deviceMemory / Network Information API) keep the
// FULL experience rather than wrongly downgrading.
// ─────────────────────────────────────────────────────────────────────────────

export interface DeviceCapability {
  /** false during SSR + hydration, true on the first client render onward */
  ready: boolean;
  reducedMotion: boolean;
  saveData: boolean;
  coarsePointer: boolean;
  cores: number;
  /** GB — navigator.deviceMemory (Chromium only); defaults to 8 where unknown */
  memory: number;
  /** effectiveType is slow-2g / 2g / 3g */
  slowNetwork: boolean;
  /**
   * Heavy-experience opt-out. When true, skip the multi-WebGL-context 3D hero and
   * multi-MB decorative videos in favour of the already-designed static/flat
   * fallback. Deliberately STRICT so only genuinely constrained devices divert —
   * the brand's motion identity stays intact on all reasonably capable hardware.
   */
  liteExperience: boolean;
}

type ConnectionLike = {
  saveData?: boolean;
  effectiveType?: string;
  addEventListener?: (t: string, cb: () => void) => void;
  removeEventListener?: (t: string, cb: () => void) => void;
};

function readCapability(): Omit<DeviceCapability, 'ready'> {
  const nav = navigator as Navigator & {
    deviceMemory?: number;
    connection?: ConnectionLike;
  };
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarsePointer = window.matchMedia('(pointer: coarse)').matches;
  const cores = nav.hardwareConcurrency ?? 8;
  const memory = nav.deviceMemory ?? 8; // fails OPEN on Safari/Firefox
  const conn = nav.connection;
  const saveData = conn?.saveData === true;
  const et = conn?.effectiveType ?? '';
  const slowNetwork = et === 'slow-2g' || et === '2g' || et === '3g';
  // Hardware gate needs BOTH low memory AND few cores (not OR) so modern
  // phones/iPads that handle the experience fine are not downgraded. reduced-motion
  // / save-data / slow-network are explicit user/connection signals and always win.
  const weakHardware = memory <= 4 && cores <= 4;
  const liteExperience = reducedMotion || saveData || slowNetwork || weakHardware;
  return { reducedMotion, saveData, coarsePointer, cores, memory, slowNetwork, liteExperience };
}

const SSR_DEFAULT: DeviceCapability = {
  ready: false,
  reducedMotion: false,
  saveData: false,
  coarsePointer: false,
  cores: 8,
  memory: 8,
  slowNetwork: false,
  liteExperience: false,
};

// Device signals are global, so a module-level memo is safe and lets getSnapshot
// return a STABLE reference while nothing has changed. useSyncExternalStore requires
// getSnapshot to return an identical reference across calls when the store hasn't
// changed — otherwise it re-renders forever.
let cachedSnapshot: DeviceCapability | null = null;
let cachedKey = '';

function getSnapshot(): DeviceCapability {
  const c = readCapability();
  const key = `${c.reducedMotion}|${c.saveData}|${c.coarsePointer}|${c.cores}|${c.memory}|${c.slowNetwork}|${c.liteExperience}`;
  if (!cachedSnapshot || key !== cachedKey) {
    cachedKey = key;
    cachedSnapshot = { ...c, ready: true };
  }
  return cachedSnapshot;
}

function getServerSnapshot(): DeviceCapability {
  return SSR_DEFAULT;
}

function subscribe(onChange: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  // Re-evaluate when the user toggles reduced-motion, switches pointer type, or the
  // connection changes. Each change invalidates the memo on the next getSnapshot.
  const mqs = [
    window.matchMedia('(prefers-reduced-motion: reduce)'),
    window.matchMedia('(pointer: coarse)'),
  ];
  mqs.forEach((mq) => mq.addEventListener?.('change', onChange));
  const conn = (navigator as Navigator & { connection?: ConnectionLike }).connection;
  conn?.addEventListener?.('change', onChange);
  return () => {
    mqs.forEach((mq) => mq.removeEventListener?.('change', onChange));
    conn?.removeEventListener?.('change', onChange);
  };
}

export function useDeviceCapability(): DeviceCapability {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
