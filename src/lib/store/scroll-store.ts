import { create } from 'zustand';

interface ScrollState {
  scrollY: number;
  scrollDirection: 'up' | 'down';
  scrollProgress: number;
  activeSection: number;
  isScrolling: boolean;
  setScrollY: (y: number) => void;
  setScrollDirection: (dir: 'up' | 'down') => void;
  setScrollProgress: (progress: number) => void;
  setActiveSection: (index: number) => void;
  setIsScrolling: (scrolling: boolean) => void;
}

export const useScrollStore = create<ScrollState>((set) => ({
  scrollY: 0,
  scrollDirection: 'down',
  scrollProgress: 0,
  activeSection: 0,
  isScrolling: false,
  setScrollY: (y) => set({ scrollY: y }),
  setScrollDirection: (dir) => set({ scrollDirection: dir }),
  setScrollProgress: (progress) => set({ scrollProgress: progress }),
  setActiveSection: (index) => set({ activeSection: index }),
  setIsScrolling: (scrolling) => set({ isScrolling: scrolling }),
}));
