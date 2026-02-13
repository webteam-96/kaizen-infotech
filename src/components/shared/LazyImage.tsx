'use client';

import React, { useState, useCallback } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils/cn';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface LazyImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  priority?: boolean;
  fill?: boolean;
}

// ---------------------------------------------------------------------------
// LazyImage
// ---------------------------------------------------------------------------

export function LazyImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  fill = false,
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div
      className={cn(
        'relative overflow-hidden',
        fill ? 'h-full w-full' : undefined,
        className
      )}
    >
      {/* Blur placeholder background */}
      <div
        aria-hidden
        className={cn(
          'absolute inset-0 bg-[var(--color-bg-tertiary)]',
          'transition-opacity duration-500 ease-[var(--ease-out-expo)]',
          isLoaded ? 'opacity-0' : 'opacity-100'
        )}
      />

      <Image
        src={src}
        alt={alt}
        {...(fill
          ? { fill: true, sizes: '100vw' }
          : { width, height })}
        priority={priority}
        placeholder="blur"
        blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiMxQTFBMUQiLz48L3N2Zz4="
        onLoad={handleLoad}
        className={cn(
          'transition-opacity duration-700 ease-[var(--ease-out-expo)]',
          fill ? 'object-cover' : undefined,
          isLoaded ? 'opacity-100' : 'opacity-0'
        )}
      />
    </div>
  );
}
