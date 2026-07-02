import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Self-contained production server for self-hosting (IIS / Windows Server, a
  // VM, or Docker). `next build` emits .next/standalone with server.js + a
  // trimmed node_modules; run it with `node server.js`. Ignored by Vercel.
  output: 'standalone',
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
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
};

export default nextConfig;
