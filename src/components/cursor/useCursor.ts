'use client';

import { useContext, useCallback } from 'react';
import { CursorContext } from './CursorProvider';
import type { CursorVariant } from './CursorProvider';

export function useCursor() {
  const context = useContext(CursorContext);

  const onMouseEnter = useCallback(
    (variant: CursorVariant, text?: string) => {
      context.setVariant(variant);
      if (text) context.setText(text);
    },
    [context]
  );

  const onMouseLeave = useCallback(() => {
    context.setVariant('default');
    context.setText('');
  }, [context]);

  return {
    ...context,
    onMouseEnter,
    onMouseLeave,
    cursorHandlers: (variant: CursorVariant, text?: string) => ({
      onMouseEnter: () => onMouseEnter(variant, text),
      onMouseLeave: () => onMouseLeave(),
    }),
  };
}
