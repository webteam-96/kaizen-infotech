'use client';

import { useCallback, useEffect, useState } from 'react';
import type { ManagedBlog } from '@/types';
import { cloneSeed } from './seed';
import { BLOGS_JSON_URL } from './config';

function published(b: ManagedBlog) {
  return b.status === 'published';
}

/**
 * Public blog data for the /blog pages. Renders the SEED on the server / first
 * paint (so there's never a blank flash and no hydration mismatch), then swaps
 * in the live public/data/blogs.json after mount — which reflects whatever the
 * admin has saved. Re-fetches whenever the tab regains focus/visibility so an
 * already-open blog page picks up admin add/edit/hide/delete changes without a
 * manual reload. Falls back to SEED if the file isn't reachable yet.
 */
export function usePublicBlogs(): { blogs: ManagedBlog[]; loading: boolean } {
  const [blogs, setBlogs] = useState<ManagedBlog[]>(() => cloneSeed().filter(published));
  const [loading, setLoading] = useState(true);

  const load = useCallback((signal?: AbortSignal) => {
    // Cache-bust so a returning visitor always sees the latest file.
    return fetch(`${BLOGS_JSON_URL}?t=${Date.now()}`, { cache: 'no-store', signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('no file'))))
      .then((data: unknown) => {
        if (Array.isArray(data)) setBlogs((data as ManagedBlog[]).filter(published));
      })
      .catch(() => {
        /* keep current/seed data */
      });
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal).finally(() => setLoading(false));

    const onFocus = () => load();
    const onVisible = () => {
      if (document.visibilityState === 'visible') load();
    };
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      controller.abort();
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [load]);

  return { blogs, loading };
}
