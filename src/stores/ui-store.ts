'use client';

import { create } from 'zustand';
import type { CursorVariant } from '@/types/animations';

interface UIState {
  // Navigation
  isNavOpen: boolean;
  isNavVisible: boolean;

  // Cursor
  cursorVariant: CursorVariant;
  cursorText: string;

  // Page loading
  isPageLoading: boolean;
  isInitialLoad: boolean;

  // Active section (for nav highlights)
  activeSection: string;

  // Actions
  openNav: () => void;
  closeNav: () => void;
  toggleNav: () => void;
  setNavVisible: (visible: boolean) => void;
  setCursorVariant: (variant: CursorVariant) => void;
  setCursorText: (text: string) => void;
  resetCursor: () => void;
  setPageLoading: (loading: boolean) => void;
  setInitialLoad: (loading: boolean) => void;
  setActiveSection: (section: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  // Navigation state
  isNavOpen: false,
  isNavVisible: true,

  // Cursor state
  cursorVariant: 'default',
  cursorText: '',

  // Loading state
  isPageLoading: false,
  isInitialLoad: true,

  // Active section
  activeSection: '',

  // Navigation actions
  openNav: () => set({ isNavOpen: true }),
  closeNav: () => set({ isNavOpen: false }),
  toggleNav: () => set((state) => ({ isNavOpen: !state.isNavOpen })),
  setNavVisible: (visible) => set({ isNavVisible: visible }),

  // Cursor actions
  setCursorVariant: (variant) => set({ cursorVariant: variant }),
  setCursorText: (text) => set({ cursorText: text, cursorVariant: 'text' }),
  resetCursor: () => set({ cursorVariant: 'default', cursorText: '' }),

  // Loading actions
  setPageLoading: (loading) => set({ isPageLoading: loading }),
  setInitialLoad: (loading) => set({ isInitialLoad: loading }),

  // Section actions
  setActiveSection: (section) => set({ activeSection: section }),
}));
