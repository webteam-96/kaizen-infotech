'use client';

import { useRef, useState } from 'react';
import { Upload, X, ArrowUp, ArrowDown, Link2 } from 'lucide-react';
import type { BlogImage } from '@/types';
import { fileToBlogImage, dataUrlBytes, formatBytes } from '@/lib/blog/image';

interface GalleryFieldProps {
  value: BlogImage[];
  onChange: (images: BlogImage[]) => void;
}

export function GalleryField({ value, onChange }: GalleryFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const onPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = '';
    if (!files.length) return;
    setBusy(true);
    try {
      const added = await Promise.all(files.map((f) => fileToBlogImage(f, { maxW: 1400 })));
      onChange([...value, ...added]);
    } finally {
      setBusy(false);
    }
  };

  const addByUrl = () => {
    const url = window.prompt('Image URL');
    if (url) onChange([...value, { url, alt: '' }]);
  };

  const update = (i: number, patch: Partial<BlogImage>) =>
    onChange(value.map((g, idx) => (idx === i ? { ...g, ...patch } : g)));
  const remove = (i: number) => onChange(value.filter((_, idx) => idx !== i));
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= value.length) return;
    const next = [...value];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label className="block text-[length:var(--text-sm)] font-medium text-[var(--color-text-primary)]">
          Gallery <span className="text-[var(--color-text-tertiary)]">({value.length})</span>
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="flex items-center gap-1.5 rounded-[var(--radius-md)] border border-dashed border-[var(--color-border)] px-3 py-1.5 text-[length:var(--text-sm)] text-[var(--color-text-secondary)] transition-colors hover:border-[var(--color-accent-primary)] hover:text-[var(--color-text-primary)]"
          >
            <Upload size={15} /> {busy ? 'Processing…' : 'Add images'}
          </button>
          <button
            type="button"
            onClick={addByUrl}
            className="flex items-center gap-1.5 rounded-[var(--radius-md)] border border-[var(--color-border)] px-3 py-1.5 text-[length:var(--text-sm)] text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-text-primary)]"
          >
            <Link2 size={15} /> URL
          </button>
        </div>
      </div>

      {value.length === 0 ? (
        <p className="rounded-[var(--radius-md)] border border-dashed border-[var(--color-border)] px-4 py-6 text-center text-[length:var(--text-sm)] text-[var(--color-text-tertiary)]">
          No gallery images yet.
        </p>
      ) : (
        <ul className="space-y-3">
          {value.map((g, i) => (
            <li
              key={i}
              className="flex gap-3 rounded-[var(--radius-md)] border border-[var(--color-border)] p-3"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={g.url}
                alt={g.alt || 'gallery item'}
                className="h-20 w-28 shrink-0 rounded-[var(--radius-sm)] border border-[var(--color-border)] object-cover"
              />
              <div className="flex-1 space-y-2">
                <input
                  type="text"
                  value={g.alt ?? ''}
                  onChange={(e) => update(i, { alt: e.target.value })}
                  placeholder="Alt text"
                  className="block w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-bg-primary)] px-2.5 py-1.5 text-[length:var(--text-sm)] text-[var(--color-text-primary)]"
                />
                <input
                  type="text"
                  value={g.caption ?? ''}
                  onChange={(e) => update(i, { caption: e.target.value })}
                  placeholder="Caption (optional)"
                  className="block w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-bg-primary)] px-2.5 py-1.5 text-[length:var(--text-sm)] text-[var(--color-text-primary)]"
                />
                {g.url.startsWith('data:') && (
                  <p className="text-[length:var(--text-xs)] text-[var(--color-text-tertiary)]">
                    ~{formatBytes(dataUrlBytes(g.url))}
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <button type="button" onClick={() => move(i, -1)} title="Move up" className="rounded p-1 text-[var(--color-text-tertiary)] hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)]"><ArrowUp size={15} /></button>
                <button type="button" onClick={() => move(i, 1)} title="Move down" className="rounded p-1 text-[var(--color-text-tertiary)] hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)]"><ArrowDown size={15} /></button>
                <button type="button" onClick={() => remove(i)} title="Remove" className="rounded p-1 text-[var(--red-brand)] hover:bg-[rgba(192,0,0,0.08)]"><X size={15} /></button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={onPick} />
    </div>
  );
}
