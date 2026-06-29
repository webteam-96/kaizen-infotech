import type { BlogImage } from '@/types';

// ---------------------------------------------------------------------------
// Client-side image handling. With no upload server, uploaded files are
// downscaled + compressed in the browser and stored as data-URLs (inside the
// blog JSON / localStorage). Compression keeps them small enough to fit the
// localStorage quota and the JSON file. Users can also paste an image URL.
// ---------------------------------------------------------------------------

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Could not read file'));
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Could not decode image'));
    img.src = src;
  });
}

/**
 * Compress an image file to a data-URL. Downscales to `maxW` and re-encodes as
 * WebP (alpha-safe, small). Falls back to the original data-URL if anything
 * goes wrong or the source is an SVG (kept as-is).
 */
export async function fileToBlogImage(
  file: File,
  opts: { maxW?: number; quality?: number } = {},
): Promise<BlogImage> {
  const { maxW = 1600, quality = 0.82 } = opts;
  const altBase = file.name.replace(/\.[^.]+$/, '');
  const original = await readFileAsDataUrl(file);

  if (file.type === 'image/svg+xml') {
    return { url: original, alt: altBase };
  }

  try {
    const img = await loadImage(original);
    const scale = Math.min(1, maxW / img.width);
    const w = Math.max(1, Math.round(img.width * scale));
    const h = Math.max(1, Math.round(img.height * scale));

    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return { url: original, alt: altBase };
    ctx.drawImage(img, 0, 0, w, h);

    const webp = canvas.toDataURL('image/webp', quality);
    // Some browsers ignore unsupported formats and return a PNG; prefer whichever
    // is smaller than the original.
    const best = webp.length < original.length ? webp : original;
    return { url: best, alt: altBase };
  } catch {
    return { url: original, alt: altBase };
  }
}

/** Rough byte size of a data-URL (for quota warnings). */
export function dataUrlBytes(url: string): number {
  if (!url.startsWith('data:')) return 0;
  const base64 = url.split(',')[1] ?? '';
  return Math.floor((base64.length * 3) / 4);
}

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}
