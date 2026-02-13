'use client';

import { createContext, useContext, useState, useCallback, useMemo } from 'react';
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
