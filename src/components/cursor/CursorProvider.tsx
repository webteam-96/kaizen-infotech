'use client';

import { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { isTouchDevice } from './isTouchDevice';

export type CursorVariant = 'default' | 'hover' | 'text' | 'hidden';

interface CursorContextType {
  variant: CursorVariant;
  text: string;
  setVariant: (variant: CursorVariant) => void;
  setText: (text: string) => void;
}

export const CursorContext = createContext<CursorContextType>({
  variant: 'default',
  text: '',
  setVariant: () => {},
  setText: () => {},
});

export function CursorProvider({ children }: { children: ReactNode }) {
  const [variant, setVariant] = useState<CursorVariant>('default');
  const [text, setText] = useState('');

  const handleSetVariant = useCallback((v: CursorVariant) => {
    setVariant(v);
  }, []);

  const handleSetText = useCallback((t: string) => {
    setText(t);
  }, []);

  const prefersReducedMotion = useReducedMotion();
  const isFinePointer = useMediaQuery('(pointer: fine)');

  // Toggle .has-custom-cursor on <html> so the CSS cursor:none rule only fires
  // when the custom cursor is actually active (fine pointer + no reduced-motion
  // + not touch). Reactive: if the user flips prefers-reduced-motion or the
  // pointer capability changes mid-session, the class is removed so the native
  // cursor comes back when CustomCursor unmounts.
  useEffect(() => {
    if (isFinePointer && !prefersReducedMotion && !isTouchDevice()) {
      document.documentElement.classList.add('has-custom-cursor');
    } else {
      document.documentElement.classList.remove('has-custom-cursor');
    }

    return () => {
      document.documentElement.classList.remove('has-custom-cursor');
    };
  }, [isFinePointer, prefersReducedMotion]);

  const value = useMemo<CursorContextType>(
    () => ({
      variant,
      text,
      setVariant: handleSetVariant,
      setText: handleSetText,
    }),
    [variant, text, handleSetVariant, handleSetText]
  );

  return (
    <CursorContext.Provider value={value}>{children}</CursorContext.Provider>
  );
}

export function useCursorContext() {
  return useContext(CursorContext);
}
