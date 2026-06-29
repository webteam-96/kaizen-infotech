'use client';

import { useRef, useState } from 'react';
import { Upload, X, Link2 } from 'lucide-react';
import type { BlogImage } from '@/types';
import { fileToBlogImage, dataUrlBytes, formatBytes } from '@/lib/blog/image';

interface ImageFieldProps {
  label: string;
  hint?: string;
  value?: BlogImage;
  onChange: (img: BlogImage | undefined) => void;
  maxW?: number;
}

export function ImageField({ label, hint, value, onChange, maxW = 1600 }: ImageFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const onPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setBusy(true);
    try {
      const img = await fileToBlogImage(file, { maxW });
      onChange({ ...img, alt: value?.alt || img.alt });
    } finally {
      setBusy(false);
    }
  };

  const addByUrl = () => {
    const url = window.prompt('Image URL');
    if (url) onChange({ url, alt: value?.alt ?? '' });
  };

  return (
    <div>
      <label className="mb-1.5 block text-[length:var(--text-sm)] font-medium text-[var(--color-text-primary)]">
        {label}
      </label>
      {hint && <p className="mb-2 text-[length:var(--text-xs)] text-[var(--color-text-tertiary)]">{hint}</p>}

      {value?.url ? (
        <div className="space-y-2">
          <div className="relative inline-block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value.url}
              alt={value.alt || 'preview'}
              className="max-h-48 rounded-[var(--radius-md)] border border-[var(--color-border)] object-cover"
            />
            <button
              type="button"
              onClick={() => onChange(undefined)}
              title="Remove image"
              className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-[var(--red-brand)] text-white shadow-md"
            >
              <X size={15} />
            </button>
          </div>
          <input
            type="text"
            value={value.alt ?? ''}
            onChange={(e) => onChange({ ...value, alt: e.target.value })}
            placeholder="Alt text (for accessibility / SEO)"
            className="block w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-primary)] px-3 py-2 text-[length:var(--text-sm)] text-[var(--color-text-primary)]"
          />
          {value.url.startsWith('data:') && (
            <p className="text-[length:var(--text-xs)] text-[var(--color-text-tertiary)]">
              ~{formatBytes(dataUrlBytes(value.url))} stored inline
            </p>
          )}
        </div>
      ) : (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="flex items-center gap-2 rounded-[var(--radius-md)] border border-dashed border-[var(--color-border)] px-4 py-3 text-[length:var(--text-sm)] text-[var(--color-text-secondary)] transition-colors hover:border-[var(--color-accent-primary)] hover:text-[var(--color-text-primary)]"
          >
            <Upload size={16} /> {busy ? 'Processing…' : 'Upload image'}
          </button>
          <button
            type="button"
            onClick={addByUrl}
            className="flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] px-4 py-3 text-[length:var(--text-sm)] text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-text-primary)]"
          >
            <Link2 size={16} /> URL
          </button>
        </div>
      )}

      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onPick} />
    </div>
  );
}
