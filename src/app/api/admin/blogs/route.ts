import { NextResponse } from 'next/server';
import type { ManagedBlog } from '@/types';
import { getBlogs, saveBlogs, STORE_BACKEND } from '@/lib/blog/serverStore';

// Node runtime (default) — the file backend writes public/data/blogs.json; the
// KV backend writes over the network (works on serverless / read-only hosts).
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const TOKEN =
  process.env.ADMIN_TOKEN ?? process.env.NEXT_PUBLIC_ADMIN_PASSWORD ?? 'kaizen-admin-2026';

// GET /api/admin/blogs → the full set (lazily seeds the store if missing).
export async function GET() {
  const blogs = await getBlogs();
  return NextResponse.json({ blogs, backend: STORE_BACKEND }, { headers: { 'Cache-Control': 'no-store' } });
}

// POST /api/admin/blogs → overwrite public/data/blogs.json with the full set.
// Body: { blogs: ManagedBlog[] }  ·  Header: x-admin-token
export async function POST(req: Request) {
  if ((req.headers.get('x-admin-token') ?? '') !== TOKEN) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }

  const blogs = (body as { blogs?: unknown })?.blogs;
  if (!Array.isArray(blogs)) {
    return NextResponse.json({ error: 'blogs must be an array' }, { status: 400 });
  }

  try {
    await saveBlogs(blogs as ManagedBlog[]);
    return NextResponse.json({ ok: true, count: blogs.length, backend: STORE_BACKEND });
  } catch (err) {
    // File backend on a read-only FS (e.g. Vercel with no KV configured) — report
    // so the client can warn and fall back to the Export-JSON download.
    return NextResponse.json(
      { error: 'write failed', backend: STORE_BACKEND, detail: String(err instanceof Error ? err.message : err) },
      { status: 500 },
    );
  }
}
