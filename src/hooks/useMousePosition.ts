'use client';

import { useState, useEffect } from 'react';

export interface MousePosition {
  x: number;
  y: number;
}

export function useMousePosition(
  elementRef?: React.RefObject<Element | null>
): MousePosition {
  const [position, setPosition] = useState<MousePosition>({ x: 0, y: 0 });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleMouseMove = (e: MouseEvent) => {
      if (elementRef?.current) {
        const rect = elementRef.current.getBoundingClientRect();
        setPosition({
          x: (e.clientX - rect.left) / rect.width,
          y: (e.clientY - rect.top) / rect.height,
        });
      } else {
        setPosition({
          x: e.clientX / window.innerWidth,
          y: e.clientY / window.innerHeight,
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [elementRef]);

  return position;
}
