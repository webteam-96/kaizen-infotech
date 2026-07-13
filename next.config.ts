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
    optimizePackageImports: ['framer-motion', 'gsap'],
  },
  // Long-lived caching for static media so repeat visitors don't re-download the
  // (multi-MB) videos and images on every navigation. Applies on `next start`
  // (self-hosted / IIS reverse-proxy to node) and on Vercel alike.
  // NOTE: /videos and /images filenames are NOT content-hashed — any future
  // replacement MUST use a new filename or returning visitors get the stale asset
  // for up to a year. /data (admin-mutable blogs.json) is explicitly kept fresh so
  // blog edits keep surfacing. /_next/static is already 1yr-immutable by Next.
  async headers() {
    const IMMUTABLE = 'public, max-age=31536000, immutable';
    return [
      { source: '/videos/:path*', headers: [{ key: 'Cache-Control', value: IMMUTABLE }] },
      { source: '/images/:path*', headers: [{ key: 'Cache-Control', value: IMMUTABLE }] },
      { source: '/fonts/:path*', headers: [{ key: 'Cache-Control', value: IMMUTABLE }] },
      {
        source: '/data/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' }],
      },
    ];
  },
};

export default nextConfig;
