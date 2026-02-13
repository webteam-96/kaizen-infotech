'use client';

import { create } from 'zustand';
import type { ScrollDirection } from '@/types/animations';

interface ScrollState {
  // Scroll position
  scrollY: number;
  scrollX: number;
  scrollProgress: number;

  // Scroll direction
  direction: ScrollDirection;
  lastScrollY: number;

  // Scroll state flags
  isScrolling: boolean;
  isAtTop: boolean;
  isAtBottom: boolean;

  // Lenis velocity
  velocity: number;

  // Actions
  setScrollPosition: (y: number, x?: number) => void;
  setScrollProgress: (progress: number) => void;
  setDirection: (direction: ScrollDirection) => void;
  setIsScrolling: (scrolling: boolean) => void;
  setVelocity: (velocity: number) => void;
  updateScroll: (data: {
    scrollY: number;
    scrollX?: number;
    progress?: number;
    velocity?: number;
  }) => void;
}

export const useScrollStore = create<ScrollState>((set, get) => ({
  // Position
  scrollY: 0,
  scrollX: 0,
  scrollProgress: 0,

  // Direction
  direction: 'down',
  lastScrollY: 0,

  // Flags
  isScrolling: false,
  isAtTop: true,
  isAtBottom: false,

  // Velocity
  velocity: 0,

  // Individual setters
  setScrollPosition: (y, x = 0) =>
    set((state) => ({
      scrollY: y,
      scrollX: x,
      lastScrollY: state.scrollY,
      direction: y > state.scrollY ? 'down' : 'up',
      isAtTop: y <= 0,
    })),

  setScrollProgress: (progress) => set({ scrollProgress: progress }),

  setDirection: (direction) => set({ direction }),

  setIsScrolling: (scrolling) => set({ isScrolling: scrolling }),

  setVelocity: (velocity) => set({ velocity }),

  // Batch update from Lenis scroll event
  updateScroll: (data) => {
    const state = get();
    const newDirection: ScrollDirection =
      data.scrollY > state.scrollY ? 'down' : data.scrollY < state.scrollY ? 'up' : state.direction;

    set({
      scrollY: data.scrollY,
      scrollX: data.scrollX ?? state.scrollX,
      scrollProgress: data.progress ?? state.scrollProgress,
      velocity: data.velocity ?? state.velocity,
      lastScrollY: state.scrollY,
      direction: newDirection,
      isScrolling: true,
      isAtTop: data.scrollY <= 0,
    });
  },
}));
