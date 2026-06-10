'use client';

import { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import type { ReactNode } from 'react';

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

  // Toggle .has-custom-cursor on <html> so the CSS cursor:none rule only fires
  // when the custom cursor is actually active (fine pointer + no reduced-motion).
  useEffect(() => {
    const isFinePonter = window.matchMedia('(pointer: fine)').matches;
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    const isTouch =
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      window.matchMedia('(hover: none)').matches;

    if (isFinePonter && !prefersReducedMotion && !isTouch) {
      document.documentElement.classList.add('has-custom-cursor');
    }

    return () => {
      document.documentElement.classList.remove('has-custom-cursor');
    };
  }, []);

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
