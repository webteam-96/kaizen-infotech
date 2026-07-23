import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Self-contained production server for self-hosting (IIS / Windows Server, a
  // VM, or Docker). `next build` emits .next/standalone with server.js + a
  // trimmed node_modules; run it with `node server.js`. Ignored by Vercel.
  output: 'standalone',
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    // Optimised variants are keyed by src+width+quality, so identical pixels can
    // be cached for a year. Default is 4h (Next 16); bumping to 1yr avoids
    // re-encoding the same card/team/project images on every cold optimizer miss.
    minimumCacheTTL: 31536000,
    // Allow the brand logo (a trusted, first-party SVG in /public) to be served
    // through next/image. Hardened per Next's guidance: force download rather
    // than inline execution and lock scripts down via CSP.
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  // svg-captcha (used by /api/captcha) reads its bundled font off disk via
  // `__dirname`. If Next bundles it, `__dirname` is rewritten and the font
  // read fails ("ENOENT …/svg-captcha/fonts/Comismsh.ttf"). Keeping it external
  // makes it load from node_modules with a real `__dirname`.
  serverExternalPackages: ['svg-captcha'],
  // …and force the font asset into the serverless function bundle so it ships to
  // Vercel (file tracing doesn't always follow the dynamic readFileSync path).
  outputFileTracingIncludes: {
    '/api/captcha': ['./node_modules/svg-captcha/fonts/**'],
  },
  experimental: {
    // lucide-react added so icon imports are rewritten to per-icon deep imports
    // (drops barrel/legacy-JS overhead flagged by Lighthouse).
    optimizePackageImports: ['framer-motion', 'gsap', 'lucide-react'],
    // Inline each route's critical CSS into its prerendered HTML instead of a
    // render-blocking <link> to the ~124KB stylesheet. Same bytes, delivered
    // inside the (already-gzipped) document → one fewer blocking round-trip on
    // first paint. The homepage is static, so this ships in the prerender.
    inlineCss: true,
  },
  // Long-lived caching for static media so repeat visitors don't re-download the
  // (multi-MB) videos and images on every navigation. Applies on `next start`
  // (self-hosted / IIS reverse-proxy to node) and on Vercel alike.
  // NOTE: /videos and /images filenames are NOT content-hashed — any future
  // replacement MUST use a new filename or returning visitors get the stale asset
  // for up to a year. /data (admin-mutable blogs.json) is explicitly kept fresh so
  // blog edits keep surfacing. /_next/static is already 1yr-immutable by Next.
  // The privacy page originally shipped at /privacy; the sitemap and any early
  // external links may still point there.
  async redirects() {
    return [{ source: '/privacy', destination: '/privacy-policy', permanent: true }];
  },
  async headers() {
    const IMMUTABLE = 'public, max-age=31536000, immutable';
    return [
      // HSTS: skips the http→https 301 round-trip on repeat visits (and hardens
      // the site). No 'preload' until the canonical host direction (www vs apex)
      // is settled at the server layer.
      {
        source: '/:path*',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
        ],
      },
      { source: '/images/:path*', headers: [{ key: 'Cache-Control', value: IMMUTABLE }] },
      { source: '/fonts/:path*', headers: [{ key: 'Cache-Control', value: IMMUTABLE }] },
      // Self-hosted Spline scene + wasm helpers. Both are version-pinned by
      // NAME (scene-v1…, wasm dir tied to @splinetool/runtime's exact version),
      // so immutable is safe — bump the filename/dir when either changes.
      { source: '/spline/:path*', headers: [{ key: 'Cache-Control', value: IMMUTABLE }] },
      {
        source: '/data/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' }],
      },
    ];
  },
};

export default nextConfig;
