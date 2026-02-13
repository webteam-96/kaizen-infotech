import { create } from 'zustand';

interface UIState {
  isMenuOpen: boolean;
  isLoading: boolean;
  cursorVariant: 'default' | 'hover' | 'text' | 'hidden';
  cursorText: string;
  toggleMenu: () => void;
  setMenuOpen: (open: boolean) => void;
  setLoading: (loading: boolean) => void;
  setCursorVariant: (variant: 'default' | 'hover' | 'text' | 'hidden') => void;
  setCursorText: (text: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isMenuOpen: false,
  isLoading: true,
  cursorVariant: 'default',
  cursorText: '',
  toggleMenu: () => set((state) => ({ isMenuOpen: !state.isMenuOpen })),
  setMenuOpen: (open) => set({ isMenuOpen: open }),
  setLoading: (loading) => set({ isLoading: loading }),
  setCursorVariant: (variant) => set({ cursorVariant: variant }),
  setCursorText: (text) => set({ cursorText: text }),
}));
