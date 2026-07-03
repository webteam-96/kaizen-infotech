'use client';

import { useState } from 'react';
import { BlogCover } from './BlogCover';

// ---------------------------------------------------------------------------
// A blog photo with a guaranteed fallback. Renders the given image URL, but if
// there's no URL — or the image fails to load (e.g. a dead external link) — it
// swaps in the branded, generated <BlogCover> art instead of a broken-image
// icon. Kept as a client component so the onError swap can re-render.
// ---------------------------------------------------------------------------

interface BlogImageProps {
  url?: string;
  alt?: string;
  slug: string;
  category?: string;
  /** classes for the <img> (call sites vary: object-cover vs object-contain). */
  imgClassName?: string;
  /** classes for the fallback <BlogCover>; defaults to absolute fill. */
  coverClassName?: string;
}

export function BlogImage({
  url,
  alt,
  slug,
  category,
  imgClassName,
  coverClassName = 'absolute inset-0',
}: BlogImageProps) {
  const [failed, setFailed] = useState(false);

  if (!url || failed) {
    return <BlogCover slug={slug} category={category} className={coverClassName} />;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={url} alt={alt || ''} className={imgClassName} onError={() => setFailed(true)} />
  );
}
