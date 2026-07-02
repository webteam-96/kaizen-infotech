'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  Pencil, Trash2, EyeOff, Globe, Plus, Download, Upload, RotateCcw, AlertTriangle, Star,
} from 'lucide-react';
import type { ManagedBlog } from '@/types';
import {
  loadAdminBlogs, subscribe, getLocal, deleteBlog, setStatus, setFeatured, replaceAll,
} from '@/lib/blog/adminStore';
import { sortBlogs } from '@/lib/blog/order';
import { cloneSeed } from '@/lib/blog/seed';

const STATUS_STYLE: Record<string, string> = {
  published: 'bg-green-100 text-green-700',
  hidden: 'bg-gray-200 text-gray-600',
  draft: 'bg-amber-100 text-amber-700',
};

export default function ManageBlogsPage() {
  const [blogs, setBlogs] = useState<ManagedBlog[]>([]);
  const [loading, setLoading] = useState(true);
  const [warn, setWarn] = useState<string | null>(null);
  const importRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let active = true;
    loadAdminBlogs().then((b) => {
      if (active) { setBlogs(b); setLoading(false); }
    });
    const unsub = subscribe(() => setBlogs(getLocal()));
    return () => { active = false; unsub(); };
  }, []);

  const flash = (res: { fileOk: boolean; error?: string }) => {
    setWarn(res.fileOk ? null : `Saved locally, but blogs.json write failed${res.error ? ` (${res.error})` : ''}. Use Export JSON to publish.`);
  };

  const toggle = async (b: ManagedBlog) => {
    flash(await setStatus(b.id, b.status === 'published' ? 'hidden' : 'published'));
  };
  const feature = async (b: ManagedBlog) => {
    // Single-select: featuring one clears the flag on every other post.
    flash(await setFeatured(b.id, !b.featured));
  };
  const del = async (b: ManagedBlog) => {
    if (window.confirm(`Delete "${b.title}"? This cannot be undone.`)) flash(await deleteBlog(b.id));
  };

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(getLocal(), null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'blogs.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const onImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        if (!Array.isArray(parsed)) throw new Error('not an array');
        flash(await replaceAll(parsed));
      } catch {
        setWarn('Import failed — the file is not valid blogs JSON.');
      }
    };
    reader.readAsText(file);
  };

  const reset = async () => {
    if (window.confirm('Reset to the original sample posts? Your current blogs will be replaced.')) {
      flash(await replaceAll(cloneSeed()));
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[length:var(--h-card)] font-bold text-[var(--color-text-primary)]">Manage Blogs</h1>
          <p className="text-[length:var(--text-sm)] text-[var(--color-text-tertiary)]">
            {blogs.length} post{blogs.length === 1 ? '' : 's'} · saved to your browser and published to the live blog store
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={exportJson} className="flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] px-3 py-2 text-[length:var(--text-sm)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"><Download size={16} /> Export JSON</button>
          <button onClick={() => importRef.current?.click()} className="flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] px-3 py-2 text-[length:var(--text-sm)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"><Upload size={16} /> Import JSON</button>
          <button onClick={reset} className="flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] px-3 py-2 text-[length:var(--text-sm)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"><RotateCcw size={16} /> Reset</button>
          <Link href="/admin/blogs/new" className="flex items-center gap-2 rounded-[var(--radius-md)] bg-[var(--color-accent-primary)] px-4 py-2 text-[length:var(--text-sm)] font-semibold text-white hover:opacity-90"><Plus size={16} /> New Post</Link>
        </div>
      </div>

      {warn && (
        <div className="mb-5 flex items-start gap-2 rounded-[var(--radius-md)] border border-amber-200 bg-amber-50 px-4 py-3 text-[length:var(--text-sm)] text-amber-800">
          <AlertTriangle size={17} /> <span>{warn}</span>
        </div>
      )}

      <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-primary)]">
        {loading ? (
          <p className="px-5 py-10 text-center text-[length:var(--text-sm)] text-[var(--color-text-tertiary)]">Loading…</p>
        ) : blogs.length === 0 ? (
          <p className="px-5 py-10 text-center text-[length:var(--text-sm)] text-[var(--color-text-tertiary)]">
            No posts yet. Click <strong>New Post</strong> to create one.
          </p>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-[length:var(--text-xs)] uppercase tracking-wide text-[var(--color-text-tertiary)]">
                <th className="px-4 py-3 font-semibold">Title</th>
                <th className="px-4 py-3 font-semibold">Category</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortBlogs(blogs).map((b) => (
                <tr
                  key={b.id}
                  className={`border-b border-[var(--color-border)] last:border-0 ${b.featured ? 'bg-amber-50/70' : ''}`}
                >
                  <td className="px-4 py-3">
                    <p className="flex flex-wrap items-center gap-2 font-medium text-[var(--color-text-primary)]">
                      {b.title || '(untitled)'}
                      {b.featured && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[length:var(--text-xs)] font-semibold text-amber-700">
                          <Star size={11} fill="currentColor" /> Featured
                        </span>
                      )}
                    </p>
                    <p className="text-[length:var(--text-xs)] text-[var(--color-text-tertiary)]">/blog/{b.slug}</p>
                  </td>
                  <td className="px-4 py-3 text-[length:var(--text-sm)] text-[var(--color-text-secondary)]">{b.category}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-[length:var(--text-xs)] font-semibold capitalize ${STATUS_STYLE[b.status]}`}>{b.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => feature(b)}
                        title={b.featured ? 'Featured blog — click to remove' : 'Make this the Featured blog (pinned first on /blog)'}
                        className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[length:var(--text-xs)] font-semibold ${
                          b.featured
                            ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                            : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)] hover:text-amber-600'
                        }`}
                      >
                        <Star size={15} fill={b.featured ? 'currentColor' : 'none'} /> {b.featured ? 'Featured' : 'Feature'}
                      </button>
                      {b.status === 'published' ? (
                        <button onClick={() => toggle(b)} title="Unpublish — remove from the public blog page" className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[length:var(--text-xs)] font-semibold text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)]">
                          <EyeOff size={15} /> Unpublish
                        </button>
                      ) : (
                        <button onClick={() => toggle(b)} title="Publish to the public blog page" className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[length:var(--text-xs)] font-semibold text-green-700 hover:bg-green-50">
                          <Globe size={15} /> Publish
                        </button>
                      )}
                      <Link href={`/admin/blogs/${b.id}/edit`} title="Edit" className="rounded-md p-2 text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)]"><Pencil size={16} /></Link>
                      <button onClick={() => del(b)} title="Delete" className="rounded-md p-2 text-[var(--red-brand)] hover:bg-[rgba(192,0,0,0.08)]"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
