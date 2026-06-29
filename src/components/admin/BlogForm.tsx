'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, X, Wand2, AlertTriangle, CheckCircle2, Globe } from 'lucide-react';
import type { ManagedBlog, BlogStatus } from '@/types';
import { blogCategories } from '@/content/blog';
import { RichEditor } from './RichEditor';
import { ImageField } from './ImageField';
import { GalleryField } from './GalleryField';
import { sanitizeHtml } from '@/lib/blog/markdown';
import { saveBlog, slugify, estimateReadingTime, getLocal } from '@/lib/blog/adminStore';

const CATEGORIES = blogCategories.filter((c) => c !== 'All');
const STATUSES: { value: BlogStatus; label: string }[] = [
  { value: 'published', label: 'Published (public)' },
  { value: 'draft', label: 'Draft (not public)' },
  { value: 'hidden', label: 'Hidden (kept, not public)' },
];

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-1.5 block text-[length:var(--text-sm)] font-medium text-[var(--color-text-primary)]">
      {children}
    </label>
  );
}
const inputCls =
  'block w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-primary)] px-3 py-2.5 text-[length:var(--text-sm)] text-[var(--color-text-primary)] focus:border-[var(--color-accent-primary)] focus:outline-none';

export function BlogForm({ initial, mode }: { initial: ManagedBlog; mode: 'new' | 'edit' }) {
  const router = useRouter();
  const [blog, setBlog] = useState<ManagedBlog>(initial);
  const [slugEdited, setSlugEdited] = useState(mode === 'edit');
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ kind: 'ok' | 'warn'; msg: string } | null>(null);

  const set = <K extends keyof ManagedBlog>(key: K, val: ManagedBlog[K]) =>
    setBlog((b) => ({ ...b, [key]: val }));

  const onTitle = (title: string) => {
    setBlog((b) => ({ ...b, title, slug: slugEdited ? b.slug : slugify(title) }));
  };

  const uniqueSlug = (raw: string): string => {
    const base = slugify(raw) || `post-${Date.now()}`;
    const others = getLocal().filter((b) => b.id !== blog.id);
    let slug = base;
    let n = 2;
    while (others.some((b) => b.slug === slug)) slug = `${base}-${n++}`;
    return slug;
  };

  const onSave = async (overrideStatus?: BlogStatus) => {
    if (!blog.title.trim()) {
      setNotice({ kind: 'warn', msg: 'Please add a title.' });
      return;
    }
    setSaving(true);
    setNotice(null);
    const status = overrideStatus ?? blog.status;
    const finalBlog: ManagedBlog = {
      ...blog,
      status,
      slug: uniqueSlug(blog.slug || blog.title),
      bodyHtml: sanitizeHtml(blog.bodyHtml),
      tags: blog.tags.map((t) => t.trim()).filter(Boolean),
    };
    if (overrideStatus) set('status', overrideStatus);
    const res = await saveBlog(finalBlog);
    setSaving(false);

    if (res.fileOk) {
      router.push('/admin/blogs');
      router.refresh();
    } else {
      // Saved locally but the JSON file write failed (e.g. read-only host).
      setNotice({
        kind: 'warn',
        msg:
          'Saved to this browser, but writing public/data/blogs.json failed' +
          (res.error ? ` (${res.error})` : '') +
          '. On a read-only host, use Export JSON from the blog list to publish.',
      });
    }
  };

  return (
    <div className="mx-auto max-w-3xl pb-24">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-[length:var(--h-card)] font-bold text-[var(--color-text-primary)]">
          {mode === 'new' ? 'New blog post' : 'Edit blog post'}
        </h1>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => router.push('/admin/blogs')}
            className="flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] px-4 py-2 text-[length:var(--text-sm)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
          >
            <X size={16} /> Cancel
          </button>
          <button
            type="button"
            onClick={() => onSave()}
            disabled={saving}
            title="Save with the selected status"
            className="flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] px-5 py-2 text-[length:var(--text-sm)] font-semibold text-[var(--color-text-primary)] transition-opacity hover:bg-[var(--color-bg-tertiary)] disabled:opacity-60"
          >
            <Save size={16} /> {saving ? 'Saving…' : 'Save'}
          </button>
          <button
            type="button"
            onClick={() => onSave('published')}
            disabled={saving}
            title="Save and make it live on the public blog page"
            className="flex items-center gap-2 rounded-[var(--radius-md)] bg-green-600 px-5 py-2 text-[length:var(--text-sm)] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            <Globe size={16} /> {saving ? 'Publishing…' : 'Save & Publish'}
          </button>
        </div>
      </div>

      {notice && (
        <div
          className={`mb-5 flex items-start gap-2 rounded-[var(--radius-md)] border px-4 py-3 text-[length:var(--text-sm)] ${
            notice.kind === 'ok'
              ? 'border-green-200 bg-green-50 text-green-800'
              : 'border-amber-200 bg-amber-50 text-amber-800'
          }`}
        >
          {notice.kind === 'ok' ? <CheckCircle2 size={17} /> : <AlertTriangle size={17} />}
          <span>{notice.msg}</span>
        </div>
      )}

      <div className="space-y-6">
        {/* Heading */}
        <div>
          <Label>Heading *</Label>
          <input
            type="text"
            value={blog.title}
            onChange={(e) => onTitle(e.target.value)}
            placeholder="The blog title"
            className={inputCls}
          />
        </div>

        {/* Slug */}
        <div>
          <Label>Slug (URL)</Label>
          <div className="flex items-center gap-2">
            <span className="text-[length:var(--text-sm)] text-[var(--color-text-tertiary)]">/blog/</span>
            <input
              type="text"
              value={blog.slug}
              onChange={(e) => { setSlugEdited(true); set('slug', e.target.value); }}
              placeholder="auto-generated-from-heading"
              className={inputCls}
            />
          </div>
        </div>

        {/* Excerpt */}
        <div>
          <Label>Excerpt (summary on the blog list)</Label>
          <textarea
            value={blog.excerpt}
            onChange={(e) => set('excerpt', e.target.value)}
            rows={2}
            placeholder="A one or two sentence summary…"
            className={inputCls}
          />
        </div>

        {/* Main image */}
        <ImageField
          label="Main image (cover)"
          hint="Optional. If left empty, an auto-generated cover is used."
          value={blog.mainImage}
          onChange={(img) => set('mainImage', img)}
        />

        {/* Body */}
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <Label>Description / Body *</Label>
            <button
              type="button"
              onClick={() => set('readingTime', estimateReadingTime(blog.bodyHtml))}
              className="flex items-center gap-1 text-[length:var(--text-xs)] text-[var(--color-accent-primary)] hover:underline"
            >
              <Wand2 size={13} /> auto reading time
            </button>
          </div>
          <RichEditor value={blog.bodyHtml} onChange={(html) => set('bodyHtml', html)} />
        </div>

        {/* Gallery */}
        <GalleryField value={blog.gallery} onChange={(g) => set('gallery', g)} />

        {/* Meta row */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <Label>Category</Label>
            <input
              type="text"
              list="blog-categories"
              value={blog.category}
              onChange={(e) => set('category', e.target.value)}
              className={inputCls}
            />
            <datalist id="blog-categories">
              {CATEGORIES.map((c) => <option key={c} value={c} />)}
            </datalist>
          </div>
          <div>
            <Label>Status</Label>
            <select
              value={blog.status}
              onChange={(e) => set('status', e.target.value as BlogStatus)}
              className={inputCls}
            >
              {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
          <div>
            <Label>Tags (comma separated)</Label>
            <input
              type="text"
              value={blog.tags.join(', ')}
              onChange={(e) => set('tags', e.target.value.split(','))}
              placeholder="Case Study, Enterprise"
              className={inputCls}
            />
          </div>
          <div>
            <Label>Reading time</Label>
            <input type="text" value={blog.readingTime} onChange={(e) => set('readingTime', e.target.value)} className={inputCls} />
          </div>
          <div>
            <Label>Author name</Label>
            <input type="text" value={blog.authorName} onChange={(e) => set('authorName', e.target.value)} className={inputCls} />
          </div>
          <div>
            <Label>Author role</Label>
            <input type="text" value={blog.authorRole} onChange={(e) => set('authorRole', e.target.value)} className={inputCls} />
          </div>
          <div>
            <Label>Published date (display)</Label>
            <input type="text" value={blog.publishedAt} onChange={(e) => set('publishedAt', e.target.value)} className={inputCls} />
          </div>
        </div>

        <div>
          <Label>Author bio</Label>
          <textarea value={blog.authorBio} onChange={(e) => set('authorBio', e.target.value)} rows={2} className={inputCls} />
        </div>

        {/* SEO */}
        <details className="rounded-[var(--radius-md)] border border-[var(--color-border)] p-4">
          <summary className="cursor-pointer text-[length:var(--text-sm)] font-medium text-[var(--color-text-primary)]">
            SEO (optional)
          </summary>
          <div className="mt-4 space-y-4">
            <div>
              <Label>Meta title</Label>
              <input
                type="text"
                value={blog.seo?.metaTitle ?? ''}
                onChange={(e) => set('seo', { ...blog.seo, metaTitle: e.target.value })}
                className={inputCls}
              />
            </div>
            <div>
              <Label>Meta description</Label>
              <textarea
                value={blog.seo?.metaDescription ?? ''}
                onChange={(e) => set('seo', { ...blog.seo, metaDescription: e.target.value })}
                rows={2}
                className={inputCls}
              />
            </div>
          </div>
        </details>
      </div>
    </div>
  );
}
