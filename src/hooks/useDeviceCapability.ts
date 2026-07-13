'use client';

import { useEffect, useState } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// useDeviceCapability — one client-only source of truth for "how much experience
// can this device/connection take?", so the heavy 3D hero, background videos and
// canvas effects can adapt consistently instead of each re-deriving device signals.
//
// Resolves AFTER mount (matchMedia/navigator are undefined during SSR), so consumers
// must render an SSR-safe placeholder while `ready` is false to avoid hydration
// mismatch. Fails OPEN: unknown signals (Safari/Firefox lack navigator.deviceMemory
// / Network Information API) keep the FULL experience rather than wrongly downgrading.
// ─────────────────────────────────────────────────────────────────────────────

export interface DeviceCapability {
  /** false during SSR + first client render, true once the effect has resolved */
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

export function useDeviceCapability(): DeviceCapability {
  const [cap, setCap] = useState<DeviceCapability>(SSR_DEFAULT);

  useEffect(() => {
    const resolve = () => setCap({ ...readCapability(), ready: true });
    resolve();
    // Re-evaluate if the user toggles reduced-motion or the connection changes.
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    mq.addEventListener?.('change', resolve);
    const conn = (navigator as Navigator & { connection?: ConnectionLike }).connection;
    conn?.addEventListener?.('change', resolve);
    return () => {
      mq.removeEventListener?.('change', resolve);
      conn?.removeEventListener?.('change', resolve);
    };
  }, []);

  return cap;
}
