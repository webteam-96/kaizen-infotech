import { create } from 'zustand';

interface LoaderState {
  isComplete: boolean;
  setComplete: () => void;
}

export const useLoaderStore = create<LoaderState>((set) => ({
  isComplete: false,
  setComplete: () => set({ isComplete: true }),
}));
