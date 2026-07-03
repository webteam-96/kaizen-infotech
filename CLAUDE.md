# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Marketing/portfolio website for **Kaizen Infotech Solutions** — a heavily
animated, single-brand Next.js site with a small self-hosted blog CMS. The repo
root (`kaizen-infotech/`) is the app; the parent directory holds brand/spec docs
and legacy WordPress content (`Old Content/`) that are NOT part of the build.

## Commands

```bash
npm run dev      # dev server on http://localhost:3000
npm run build    # production build → emits .next/standalone (see Deployment)
npm run start    # serve a production build
npm run lint     # eslint (next/core-web-vitals + next/typescript)
```

- **No unit-test runner exists and none should be added.** Verification is
  `npm run build` plus the Playwright screenshot probes in `scripts/`.
- Run a probe script directly with node against a *running* dev server:
  `node scripts/audit-shots.mjs`. They use `playwright-core`/`chromium`,
  **must** launch with `--use-angle=swiftshader` (software GL — matches CI/no-GPU
  boxes), and set `sessionStorage['kaizen-intro-seen'] = '1'` to skip the intro
  loader. Screenshots land in `audit-shots/` (git-ignored, throwaway).
- These scripts are one-off QA/debugging probes accumulated during development —
  reuse `audit-shots.mjs` as the template for a new one rather than reading all of them.

## Tech stack & conventions

- **Next.js 16 (App Router), React 19, TypeScript strict.** Path alias
  `@/*` → `src/*`.
- **Tailwind v4** — configured entirely in `src/app/globals.css` via
  `@import "tailwindcss"` + an `@theme inline` block. There is **no
  `tailwind.config`**. Design tokens are CSS variables on `:root` in
  `globals.css` (colors, fluid `--text-*` scale, fonts). Use
  `var(--color-accent-primary)` etc.; do not hard-code brand colors.
  - Custom variant `desk:` = `(min-width:1024px) and (hover:hover) and (pointer:fine)`
    — a *real mouse desktop*. Unprefixed classes target phone **and all iPads**
    (iPads are ≥768px, so `md:` would wrongly give them the desktop layout).
    Use `desk:` for anything that assumes a pointer/hover.
- **Prettier**: single quotes, semicolons, 2-space, `printWidth: 100`, LF.
- Fonts are loaded via `next/font/google` in `src/app/layout.tsx` and exposed as
  CSS variables (`--font-display`, `--font-body`, `--font-poster`, etc.).
- Merge classnames with `cn()` from `@/lib/utils/cn` (clsx + tailwind-merge).

## Animation system (central to this codebase)

The site's identity is motion. Stack: **GSAP 3 + `@gsap/react`** (pinned/scroll
sequences), **Framer Motion 11** (component transitions), **Lenis** (smooth
scroll), plus **Spline/three** for the 3D hero.

- Smooth scrolling is owned by `SmoothScroll` (Lenis) wired in
  `src/app/providers.tsx`; scroll position is published to a Zustand store
  (`@/lib/store/scroll-store`) that `ScrollProgress`/`SectionCounter` read.
- Reusable primitives live in `src/components/animation/` (`Reveal`,
  `PinnedSection`, `HorizontalScroll`, `TextReveal`, …) and hooks in
  `src/hooks/` (`useScrollTrigger`, `useLenis`, `useSplitText`, `useMagnetic`, …).
  Prefer composing these over hand-rolling new GSAP timelines.
- **Every animation must respect reduced motion** — via the `useReducedMotion()`
  hook or a CSS `@media (prefers-reduced-motion: reduce)` fallback.
- Shared config/presets: `src/lib/animations/`.
- State stores are split across `src/lib/store/` (scroll, ui) and
  `src/store/loaderStore.ts` (intro loader). `src/stores/` is a stale duplicate —
  import from `@/lib/store/*` and `@/store/loaderStore`, not `@/stores/*`.

## Content & pages

- Marketing copy/data is **static TypeScript** in `src/content/` (`services.ts`,
  `projects.ts`, `team.ts`, `testimonials.ts`, `navigation.ts`, `blog.ts`).
  Edit these to change site content; approved client copy must not be reworded
  and no facts should be invented.
- App Router pages in `src/app/` (`about`, `services/[slug]`, `work/[slug]`,
  `blog/[slug]`, `careers`, `contact`, plus `sitemap.ts`/`robots.ts`).
  Page-level composition uses section components from `src/components/sections/`.

## Blog CMS & admin (the subsystem with real backend logic)

`/admin/blogs` writes to a **canonical store** that the public `/blog` +
`/blog/[slug]` pages read. `src/lib/blog/serverStore.ts` is the single source of
truth and picks a backend at runtime (server-only — never import into a client
component; it uses `node:fs`):

- **File backend (default)** → `public/data/blogs.json`. Used on any host with a
  persistent writable FS: local `next dev` and self-hosted `next start`
  (incl. Windows Server). No config needed.
- **KV backend** → activated when `KV_REST_API_URL`+`KV_REST_API_TOKEN`
  (Vercel KV) or `UPSTASH_REDIS_REST_URL`+`UPSTASH_REDIS_REST_TOKEN` are set.
  **Required on serverless/read-only hosts** (Vercel), where FS writes are lost —
  this is why admin edits wouldn't otherwise show on `/blog`.

The admin write API (`src/app/api/admin/blogs/route.ts`, `runtime: 'nodejs'`,
`force-dynamic`) is gated by an `x-admin-token` header matched against
`ADMIN_TOKEN` / `NEXT_PUBLIC_ADMIN_PASSWORD` (default `kaizen-admin-2026`).

Other API routes in `src/app/api/`: `contact` (Resend email), `captcha`
(svg-captcha) + `newsletter`. Env keys are documented in `.env.example`.

## Deployment (self-hosted, Windows/IIS-first)

`next.config.ts` sets `output: 'standalone'`, so `npm run build` emits a
self-contained `.next/standalone` server. The prepared IIS bundle lives in
`deploy/kaizen-infotech-iis/` (server.js + trimmed node_modules + web.config +
`README-DEPLOY.txt`); `deploy/` and `*.zip` are git-ignored build artifacts.

Config gotchas already handled in `next.config.ts` — preserve them:
- `svg-captcha` is in `serverExternalPackages` + `outputFileTracingIncludes` so
  its bundled font (`__dirname`-relative `readFileSync`) survives bundling/tracing.
- SVG through `next/image` is allowed only for the first-party brand logo, locked
  down with `contentDispositionType: 'attachment'` + a `script-src 'none'` CSP.
