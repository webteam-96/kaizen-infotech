import { create } from 'zustand';

interface ScrollState {
  scrollY: number;
  scrollDirection: 'up' | 'down';
  scrollProgress: number;
  scrollVelocity: number;
  activeSection: number;
  isScrolling: boolean;
  setScrollY: (y: number) => void;
  setScrollDirection: (dir: 'up' | 'down') => void;
  setScrollProgress: (progress: number) => void;
  setScrollVelocity: (v: number) => void;
  setActiveSection: (index: number) => void;
  setIsScrolling: (scrolling: boolean) => void;
  /** Merge several scroll fields in ONE set() — used by the per-frame scroll
   *  handler so a scroll frame does one allocation + one notify sweep, not five. */
  setScrollState: (partial: Partial<ScrollState>) => void;
}

export const useScrollStore = create<ScrollState>((set) => ({
  scrollY: 0,
  scrollDirection: 'down',
  scrollProgress: 0,
  scrollVelocity: 0,
  activeSection: 0,
  isScrolling: false,
  setScrollY: (y) => set({ scrollY: y }),
  setScrollDirection: (dir) => set({ scrollDirection: dir }),
  setScrollProgress: (progress) => set({ scrollProgress: progress }),
  setScrollVelocity: (v) => set({ scrollVelocity: v }),
  setActiveSection: (index) => set({ activeSection: index }),
  setIsScrolling: (scrolling) => set({ isScrolling: scrolling }),
  setScrollState: (partial) => set(partial),
}));
