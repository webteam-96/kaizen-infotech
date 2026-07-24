import { create } from 'zustand';

interface LoaderState {
  isComplete: boolean;
  setComplete: () => void;

  // ── Home intro gate ──────────────────────────────────────────────────────
  // While `introScrollLocked` is true the page is frozen at the very top: the
  // ONLY first action is pressing Enter/Space (desktop) or tapping (touch),
  // which begins the 3D dive. Nothing time-based ever releases it — the page
  // waits for that gesture (matching the on-screen "Press Enter to begin" cue).
  //
  // Only the full 3D hero locks it (RubiksHero, when it mounts
  // RubiksCubeExperience). Lite / reduced-motion / static heroes never lock, so
  // those users scroll freely. The lock is ENFORCED by SmoothScroll (the Lenis
  // owner, which mounts early) — not by the heavy 3D chunk, which mounts too
  // late to catch the first frames. RubiksCubeExperience only detects the
  // gesture and calls unlockIntroScroll().
  introScrollLocked: boolean;
  lockIntroScroll: () => void;
  unlockIntroScroll: () => void;
}

export const useLoaderStore = create<LoaderState>((set) => ({
  isComplete: false,
  setComplete: () => set({ isComplete: true }),

  introScrollLocked: false,
  lockIntroScroll: () => set({ introScrollLocked: true }),
  unlockIntroScroll: () => set({ introScrollLocked: false }),
}));
