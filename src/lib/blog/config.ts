// Shared blog-admin config. The password/token here is LIGHTWEIGHT gating for an
// internal localStorage-backed tool — it is NOT strong security (client code is
// inspectable). Override via env: NEXT_PUBLIC_ADMIN_PASSWORD (client) and
// ADMIN_TOKEN (server). For a real public deployment, move to server-side auth.

export const ADMIN_PASSWORD =
  process.env.NEXT_PUBLIC_ADMIN_PASSWORD ?? 'kaizen-admin-2026';

// Bumped to v2 when the blog set was replaced with the imported posts — this
// invalidates any stale v1 localStorage so the admin reloads from blogs.json.
export const ADMIN_STORAGE_KEY = 'kaizen_blogs_v2';
export const ADMIN_SESSION_KEY = 'kaizen_admin_ok';

// The public blog list reads this dynamic endpoint (which reads the canonical
// KV/file store) rather than the static /data/blogs.json, so admin changes show
// up on serverless hosts too. The static file is kept only as the file backend.
export const PUBLIC_BLOGS_API = '/api/blogs';
export const BLOGS_JSON_URL = '/data/blogs.json';
