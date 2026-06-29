'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import type { ManagedBlog } from '@/types';
import { BlogForm } from '@/components/admin/BlogForm';
import { loadAdminBlogs, getById } from '@/lib/blog/adminStore';

export default function EditBlogPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const [blog, setBlog] = useState<ManagedBlog | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'missing'>('loading');

  useEffect(() => {
    let active = true;
    loadAdminBlogs().then(() => {
      if (!active) return;
      const found = id ? getById(id) : undefined;
      setBlog(found ?? null);
      setState(found ? 'ready' : 'missing');
    });
    return () => { active = false; };
  }, [id]);

  if (state === 'loading') {
    return <p className="py-16 text-center text-[length:var(--text-sm)] text-[var(--color-text-tertiary)]">Loading…</p>;
  }
  if (state === 'missing' || !blog) {
    return (
      <div className="py-16 text-center">
        <p className="mb-4 text-[length:var(--text-base)] text-[var(--color-text-secondary)]">That post could not be found.</p>
        <Link href="/admin/blogs" className="text-[var(--color-accent-primary)] hover:underline">← Back to Manage Blogs</Link>
      </div>
    );
  }
  return <BlogForm initial={blog} mode="edit" />;
}
