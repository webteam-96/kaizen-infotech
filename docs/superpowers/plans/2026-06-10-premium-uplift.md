# Premium Uplift Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Site-wide animation/UX/design uplift: fix credibility bugs, unify motion language, add a shared PageHero + LogoMarquee + ink dark-band system, tighten the homepage cube hero, and polish every inner page.

**Architecture:** Foundation-first: design tokens and animation config land before components; new shared components (PageHero, LogoMarquee, BlogCover) land before page refits; the delicate RubiksCubeExperience tightening is executed inline by the main agent. Verification is `npm run build` + Playwright screenshot sweeps (no unit-test runner exists in this project — do not add one).

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind v4 (`@theme inline` in globals.css), GSAP 3.14 + @gsap/react, Framer Motion 11, Lenis, Playwright (devDep, launch with `--use-angle=swiftshader`).

**Spec:** `docs/superpowers/specs/2026-06-10-premium-uplift-design.md`

**Ground rules for every task:**
- The working tree has pre-existing uncommitted WIP. NEVER revert, stash, or `git checkout --` anything. Only `git add` the specific files you touched.
- Match existing code style (the repo uses CSS variables like `var(--color-accent-primary)`, `cn()` for classnames, `'use client'` page components).
- Every animation must respect `prefers-reduced-motion` via the existing `useReducedMotion()` hook or CSS `@media (prefers-reduced-motion: reduce)`.
- Approved client copy (headlines, descriptions) must not be rewritten. No invented facts (no fake years, URLs, policies).
- After each task: `npm run lint` passes for touched files; commit with the message given.
- Dev server already runs at `http://localhost:3000` — do NOT start another (`next dev` lock will fail).

---

### Task 1: Design tokens — ink surfaces, accent tints, focus ring, cursor fallback

**Files:**
- Modify: `src/app/globals.css`
- Modify: `src/components/cursor/CursorProvider.tsx`

- [ ] **Step 1: Read `src/app/globals.css` fully.** Locate the `:root` token block (~lines 6–140) and the `@theme inline` block.

- [ ] **Step 2: Add ink + tint tokens** inside `:root`, after the existing color tokens:

```css
  /* Ink dark-band surfaces */
  --surface-ink: #0e1b2c;
  --surface-ink-soft: #16273d;
  --text-on-ink: #f5f8fc;
  --text-on-ink-muted: rgba(245, 248, 252, 0.64);
  --accent-on-ink: #5ab6f7;

  /* Accent tint scale (replaces ad-hoc rgba of #2196F3) */
  --accent-10: rgba(33, 150, 243, 0.1);
  --accent-20: rgba(33, 150, 243, 0.2);
  --accent-30: rgba(33, 150, 243, 0.3);
```

- [ ] **Step 3: Add the `.section-ink` class and PageHero/marquee keyframes** at the end of globals.css (with the other utility classes):

```css
/* ===== Ink dark-band system ===== */
.section-ink {
  background-color: var(--surface-ink);
  color: var(--text-on-ink);
}
.section-ink h1, .section-ink h2, .section-ink h3, .section-ink h4 {
  color: var(--text-on-ink);
}
.section-ink p {
  color: var(--text-on-ink-muted);
}
.section-ink .ink-accent {
  color: var(--accent-on-ink);
}

/* ===== Focus ring (a11y) ===== */
.focus-ring:focus-visible {
  outline: 2px solid var(--color-accent-primary);
  outline-offset: 3px;
  border-radius: var(--radius-sm);
}
.section-ink .focus-ring:focus-visible {
  outline-color: var(--accent-on-ink);
}

/* ===== PageHero gradient mesh ===== */
@keyframes ph-drift-a {
  0%, 100% { transform: translate3d(-6%, -4%, 0) scale(1); }
  50% { transform: translate3d(8%, 6%, 0) scale(1.15); }
}
@keyframes ph-drift-b {
  0%, 100% { transform: translate3d(5%, 8%, 0) scale(1.1); }
  50% { transform: translate3d(-8%, -6%, 0) scale(0.95); }
}
@media (prefers-reduced-motion: reduce) {
  .ph-blob { animation: none !important; }
}

/* ===== Logo marquee ===== */
@keyframes marquee-x {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}
.marquee-track {
  animation: marquee-x 38s linear infinite;
  will-change: transform;
}
.marquee-mask:hover .marquee-track {
  animation-play-state: paused;
}
@media (prefers-reduced-motion: reduce) {
  .marquee-track { animation: none; }
}
```

- [ ] **Step 4: Fix the hidden-cursor risk.** In globals.css find the rule that hides the cursor (search `cursor: none`). Replace any unconditional `html`/`body`/`*` `cursor: none !important` with:

```css
html.has-custom-cursor,
html.has-custom-cursor * {
  cursor: none !important;
}
```

- [ ] **Step 5: Toggle the class from CursorProvider.** Read `src/components/cursor/CursorProvider.tsx`. In the effect where the custom cursor activates (it should already check for fine pointer / desktop), add `document.documentElement.classList.add('has-custom-cursor')` on activation and remove it in the cleanup. If no such gating exists, gate on `window.matchMedia('(pointer: fine)').matches && !prefersReducedMotion`.

- [ ] **Step 6: Verify.** Run `npm run lint`. Then check the dev server renders: `node -e "fetch('http://localhost:3000').then(r=>console.log(r.status))"` → 200.

- [ ] **Step 7: Commit**

```bash
git add src/app/globals.css src/components/cursor/CursorProvider.tsx
git commit -m "feat: ink surface tokens, accent tints, focus-ring utility, cursor fallback"
```

---

### Task 2: Animation config consolidation

**Files:**
- Modify: `src/lib/animations/config.ts`
- Create: `src/lib/animations/framer.ts`
- Modify: `src/components/animation/FadeIn.tsx`, `src/components/animation/StaggerChildren.tsx`, `src/components/animation/FloatingElement.tsx`, `src/components/cursor/CustomCursor.tsx`

- [ ] **Step 1: Extend `ANIMATION_CONFIG.duration`** in `src/lib/animations/config.ts` — add `ambient: 3` after `cinematic: 1.5` (used by FloatingElement bobs).

- [ ] **Step 2: Create `src/lib/animations/framer.ts`:**

```ts
// Centralized Framer Motion easing/transition values.
// GSAP eases live in ANIMATION_CONFIG.ease; Framer needs bezier arrays/spring configs.
import { ANIMATION_CONFIG } from './config';

export const EASE_OUT: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94];

export const SPRING_SOFT = { type: 'spring', stiffness: 120, damping: 20 } as const;
export const SPRING_SNAPPY = { type: 'spring', stiffness: 300, damping: 20 } as const;

export const TRANSITION_FAST = { duration: ANIMATION_CONFIG.duration.fast, ease: EASE_OUT } as const;
export const TRANSITION_NORMAL = { duration: ANIMATION_CONFIG.duration.normal, ease: EASE_OUT } as const;
```

- [ ] **Step 3: Refit consumers.** In `FadeIn.tsx` and `StaggerChildren.tsx`, replace the inline `[0.25, 0.46, 0.45, 0.94]` arrays with `EASE_OUT` imported from `@/lib/animations/framer`. In `FloatingElement.tsx`, replace the hardcoded `duration: 3` default with `ANIMATION_CONFIG.duration.ambient`. In `CustomCursor.tsx`, replace hardcoded `0.15`/`0.2` durations with `ANIMATION_CONFIG.duration.instant` and keep the spring config but import `SPRING_SOFT` if the values match (stiffness 120 / damping 20) — if values differ, leave the spring untouched.

- [ ] **Step 4: Export from index.** Add `export * from './framer';` to `src/lib/animations/index.ts`.

- [ ] **Step 5: Verify + commit**

```bash
npm run lint
git add src/lib/animations/ src/components/animation/FadeIn.tsx src/components/animation/StaggerChildren.tsx src/components/animation/FloatingElement.tsx src/components/cursor/CustomCursor.tsx
git commit -m "refactor: centralize Framer eases and ambient duration in animation config"
```

---

### Task 3: Reduced-motion compliance — CountdownLoader + SectionCounter

**Files:**
- Modify: `src/components/sections/CountdownLoader.tsx`
- Modify: `src/components/layout/SectionCounter.tsx`

- [ ] **Step 1: CountdownLoader.** Read the file. Import `useReducedMotion` from `@/hooks/useReducedMotion`. When `prefersReducedMotion` is true: skip the digit countdown entirely — show the overlay, then fade it out after ~300ms and call the same completion path (`loaderStore` setComplete + `ScrollTrigger.refresh()` if present). The sessionStorage gate must still be set so the loader doesn't replay.

- [ ] **Step 2: SectionCounter.** Read the file. The flip animation (~lines 141–162) uses an inline CSS transition. When `prefersReducedMotion` is true, swap the number instantly (no flip transition, no intermediate state).

- [ ] **Step 3: Verify with Playwright** (file `scripts/verify-rm.mjs`, delete after):

```js
import { chromium } from 'playwright-core';
const b = await chromium.launch({ args: ['--use-angle=swiftshader'] });
const ctx = await b.newContext({ reducedMotion: 'reduce' });
const p = await ctx.newPage();
await p.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
await p.waitForTimeout(2000);
// loader must be gone quickly under reduced motion
const overlayVisible = await p.evaluate(() => {
  const el = document.querySelector('[class*="loader" i], [data-loader]');
  return el ? getComputedStyle(el).display !== 'none' && getComputedStyle(el).opacity !== '0' : false;
});
console.log('overlay still visible:', overlayVisible); // expect false
await b.close();
```

Run: `node scripts/verify-rm.mjs` → expect `overlay still visible: false`.

- [ ] **Step 4: Commit**

```bash
git add src/components/sections/CountdownLoader.tsx src/components/layout/SectionCounter.tsx
git commit -m "fix: respect prefers-reduced-motion in countdown loader and section counter"
```

---

### Task 4: Perf & cleanup — RubiksCube unmount, TextReveal deps, CountUp memo, will-change

**Files:**
- Modify: `src/components/sections/RubiksCubeExperience.tsx`
- Modify: `src/components/animation/TextReveal.tsx`
- Modify: `src/components/animation/CountUp.tsx`
- Modify: `src/components/sections/Hero.tsx`, `src/components/sections/ProcessSteps.tsx`

- [ ] **Step 1: RubiksCube cleanup.** In `RubiksCubeExperience.tsx`, find the main setup `useEffect`. Ensure its cleanup function: cancels any `requestAnimationFrame` id stored for the render loop, removes every `window`/`document` listener added in setup (resize, mousemove, etc.), calls `renderer.dispose()` and `renderer.forceContextLoss?.()` on the THREE renderer, kills ScrollTriggers created by the component (they may already be killed via gsap context — verify), and nulls the Spline app ref. Do NOT restructure anything else in this file.

- [ ] **Step 2: TextReveal deps.** In `TextReveal.tsx` (~line 105) remove `children` from the `useGSAP` dependency array; derive a stable string key instead: `const textKey = typeof children === 'string' ? children : undefined;` and use `textKey` in the deps. This stops re-splitting on every parent render while still re-running if the actual text changes.

- [ ] **Step 3: CountUp render churn.** In `CountUp.tsx`, the GSAP `onUpdate` calls `setDisplay` ~60fps. Replace the React-state display with a ref write: render `<span ref={displayRef}>` and in `onUpdate` set `displayRef.current.textContent = format(valueRef.current.val)`. Keep initial/final values rendered for SSR/no-JS correctness.

- [ ] **Step 4: will-change.** Add `will-change-transform` (Tailwind class) to: the parallax orb wrappers in `Hero.tsx`, and the per-panel animated elements in `ProcessSteps.tsx` (the elements driven by quickSetter).

- [ ] **Step 5: Verify.** `npm run lint`, then load `http://localhost:3000` via Playwright, navigate to `/about` and back to `/`, and assert no console errors (listen to `page.on('pageerror')`).

- [ ] **Step 6: Commit**

```bash
git add src/components/sections/RubiksCubeExperience.tsx src/components/animation/TextReveal.tsx src/components/animation/CountUp.tsx src/components/sections/Hero.tsx src/components/sections/ProcessSteps.tsx
git commit -m "perf: hero unmount cleanup, stable TextReveal deps, ref-based CountUp, will-change hints"
```

---

### Task 5: Social links single source + Footer upgrade

**Files:**
- Modify: `src/content/navigation.ts`
- Modify: `src/components/layout/Footer.tsx`

- [ ] **Step 1: Neutralize unverified URLs.** In `src/content/navigation.ts`, the `socialLinks` URLs (linkedin.com/company/kaizen-infotech etc.) were never confirmed by the client. Set each `href` to `'#'` and add one comment above the array: `// TODO(client): replace '#' with real profile URLs — links with '#' are hidden in the UI.`

- [ ] **Step 2: Footer rework.** Read `Footer.tsx`. Changes:
  1. Replace the hardcoded link arrays with imports: `footerLinkGroups`, `socialLinks` from `@/content/navigation` (this adds the missing Privacy/Terms links via the Resources group).
  2. Render social icons only for entries where `href && href !== '#'`: `socialLinks.filter((s) => s.href && s.href !== '#')`. If the filtered list is empty, omit the whole social row.
  3. Apply the ink band: add `section-ink` class to the footer root and swap any explicit light-bg/dark-text classes for the ink tokens (`var(--text-on-ink)`, `var(--text-on-ink-muted)`, links hover `var(--accent-on-ink)`).
  4. Wire the newsletter form: on submit, `POST /api/newsletter` with `{ email }` (same contract as the blog page form — read `src/app/blog/page.tsx` newsletter handler and reuse its fetch shape), show inline success ("You're subscribed.") or error state; disable the button while pending. Success message persists (no auto-clear).
  5. Add `focus-ring` class to every footer link and the newsletter input/button.

- [ ] **Step 3: Verify.** Playwright: screenshot the footer on `/about` (scroll to bottom). Confirm: ink background, Privacy/Terms present, NO social icons rendered (all '#'), newsletter input visible.

- [ ] **Step 4: Commit**

```bash
git add src/content/navigation.ts src/components/layout/Footer.tsx
git commit -m "feat: ink footer with single-source nav data, hidden placeholder socials, working newsletter UI"
```

---

### Task 6: PageHero shared component

**Files:**
- Create: `src/components/sections/PageHero.tsx`
- Modify: `src/components/sections/index.ts` (add export)

- [ ] **Step 1: Create the component:**

```tsx
'use client';

import Link from 'next/link';
import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ANIMATION_CONFIG } from '@/lib/animations/config';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/utils/cn';

interface Crumb {
  label: string;
  href?: string;
}

interface Stat {
  value: string;
  label: string;
}

interface PageHeroProps {
  kicker: string;
  title: string;
  /** Words within title rendered in the accent color (matched case-insensitively). */
  accentWords?: string[];
  description?: string;
  breadcrumbs?: Crumb[];
  stats?: Stat[];
  align?: 'left' | 'center';
  /** Extra content under the description (e.g. rotating keyword). */
  children?: React.ReactNode;
}

const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E\")";

export function PageHero({
  kicker,
  title,
  accentWords = [],
  description,
  breadcrumbs,
  stats,
  align = 'left',
  children,
}: PageHeroProps) {
  const rootRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const accentSet = new Set(accentWords.map((w) => w.toLowerCase().replace(/[^\w]/g, '')));

  useGSAP(
    () => {
      if (!rootRef.current) return;
      const words = rootRef.current.querySelectorAll<HTMLElement>('[data-ph-word] > span');
      const rest = rootRef.current.querySelectorAll<HTMLElement>('[data-ph-rest]');
      if (prefersReducedMotion) {
        gsap.set([words, rest], { opacity: 1, yPercent: 0, y: 0 });
        return;
      }
      const tl = gsap.timeline({ defaults: { ease: ANIMATION_CONFIG.ease.textReveal } });
      tl.fromTo(
        words,
        { yPercent: 112 },
        {
          yPercent: 0,
          duration: ANIMATION_CONFIG.duration.slow,
          stagger: ANIMATION_CONFIG.stagger.fast,
        }
      ).fromTo(
        rest,
        { opacity: 0, y: 18 },
        {
          opacity: 1,
          y: 0,
          duration: ANIMATION_CONFIG.duration.normal,
          stagger: ANIMATION_CONFIG.stagger.normal,
          ease: ANIMATION_CONFIG.ease.smooth,
        },
        '-=0.45'
      );
    },
    { scope: rootRef, dependencies: [prefersReducedMotion] }
  );

  const centered = align === 'center';

  return (
    <section
      ref={rootRef}
      className="relative flex min-h-[72vh] items-end overflow-hidden pb-[clamp(3rem,6vw,6rem)] pt-[clamp(8rem,14vh,11rem)]"
    >
      {/* Gradient mesh backdrop */}
      <div aria-hidden className="absolute inset-0 -z-10">
        <div
          className="ph-blob absolute left-[-12%] top-[-18%] h-[55vmax] w-[55vmax] rounded-full opacity-60 blur-3xl"
          style={{
            background:
              'radial-gradient(circle at 35% 35%, var(--accent-20), transparent 65%)',
            animation: 'ph-drift-a 22s ease-in-out infinite',
          }}
        />
        <div
          className="ph-blob absolute bottom-[-25%] right-[-10%] h-[48vmax] w-[48vmax] rounded-full opacity-50 blur-3xl"
          style={{
            background:
              'radial-gradient(circle at 60% 60%, rgba(135, 206, 235, 0.25), transparent 65%)',
            animation: 'ph-drift-b 26s ease-in-out infinite',
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.035] mix-blend-multiply"
          style={{ backgroundImage: GRAIN }}
        />
      </div>

      <div className={cn('container-main w-full', centered && 'text-center')}>
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav aria-label="Breadcrumb" data-ph-rest className="mb-6 opacity-0">
            <ol
              className={cn(
                'flex flex-wrap items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] text-[var(--color-text-tertiary)]',
                centered && 'justify-center'
              )}
            >
              {breadcrumbs.map((crumb, i) => (
                <li key={crumb.label} className="flex items-center gap-2">
                  {i > 0 && <span aria-hidden>/</span>}
                  {crumb.href ? (
                    <Link
                      href={crumb.href}
                      className="focus-ring transition-colors hover:text-[var(--color-accent-primary)]"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span aria-current="page" className="text-[var(--color-text-secondary)]">
                      {crumb.label}
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}

        <p
          data-ph-rest
          className="mb-5 font-mono text-xs uppercase tracking-[0.24em] text-[var(--color-accent-primary)] opacity-0"
        >
          {kicker}
        </p>

        <h1
          className={cn(
            'max-w-[16ch] font-display text-[clamp(2.75rem,7vw,5.5rem)] font-semibold leading-[1.02] tracking-tight text-[var(--color-text-primary)]',
            centered && 'mx-auto'
          )}
        >
          {title.split(' ').map((word, i) => (
            <span key={i} data-ph-word className="inline-block overflow-hidden pb-[0.08em] align-bottom">
              <span
                className={cn(
                  'inline-block',
                  accentSet.has(word.toLowerCase().replace(/[^\w]/g, '')) &&
                    'text-[var(--color-accent-primary)]'
                )}
              >
                {word}
              </span>
              {' '}
            </span>
          ))}
        </h1>

        {description && (
          <p
            data-ph-rest
            className={cn(
              'mt-7 max-w-[52ch] text-lg leading-relaxed text-[var(--color-text-secondary)] opacity-0',
              centered && 'mx-auto'
            )}
          >
            {description}
          </p>
        )}

        {children && (
          <div data-ph-rest className="mt-6 opacity-0">
            {children}
          </div>
        )}

        {stats && stats.length > 0 && (
          <div
            data-ph-rest
            className={cn(
              'mt-12 flex flex-wrap gap-x-14 gap-y-6 border-t border-[var(--color-border,rgba(0,0,0,0.08))] pt-8 opacity-0',
              centered && 'justify-center'
            )}
          >
            {stats.map((stat) => (
              <div key={stat.label}>
                <div className="font-display text-3xl font-semibold text-[var(--color-text-primary)]">
                  {stat.value}
                </div>
                <div className="mt-1 text-sm text-[var(--color-text-tertiary)]">{stat.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
```

Adjust the container class (`container-main`) to whatever the repo actually uses for page gutters (check an existing page — likely a `container` utility or `mx-auto max-w-* px-*` pattern) and the display-font class (`font-display`) to the repo's convention before finalizing. Check `gsap` import convention used by sibling components (`import gsap from 'gsap'` vs the project's `gsap-setup`) and match it.

- [ ] **Step 2: Export it** from `src/components/sections/index.ts`.

- [ ] **Step 3: Verify** lint passes. Visual verification happens in the page-refit tasks.

- [ ] **Step 4: Commit**

```bash
git add src/components/sections/PageHero.tsx src/components/sections/index.ts
git commit -m "feat: PageHero shared hero with mesh backdrop, breadcrumbs, masked title reveal"
```

---

### Task 7: LogoMarquee component

**Files:**
- Create: `src/components/sections/LogoMarquee.tsx`
- Modify: `src/components/sections/index.ts`

- [ ] **Step 1: Create the component:**

```tsx
'use client';

import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/utils/cn';

const CLIENTS = [
  'Rotary International Zones 4–7',
  'Mumbai Port Trust',
  'Income Tax Department',
  'JITO',
  'MRPL',
  'Orion Gametes',
];

export function LogoMarquee({ className }: { className?: string }) {
  const prefersReducedMotion = useReducedMotion();

  const items = (keyPrefix: string, ariaHidden = false) => (
    <div
      aria-hidden={ariaHidden || undefined}
      className="flex shrink-0 items-center gap-[clamp(2.5rem,6vw,5.5rem)] pr-[clamp(2.5rem,6vw,5.5rem)]"
    >
      {CLIENTS.map((name) => (
        <span
          key={`${keyPrefix}-${name}`}
          className="whitespace-nowrap font-display text-xl font-medium tracking-tight text-[var(--color-text-tertiary)] transition-colors duration-300 hover:text-[var(--color-text-primary)] md:text-2xl"
        >
          {name}
        </span>
      ))}
    </div>
  );

  return (
    <section className={cn('overflow-hidden py-[clamp(3.5rem,7vw,6rem)]', className)}>
      <p className="container-main mb-8 font-mono text-xs uppercase tracking-[0.24em] text-[var(--color-text-tertiary)]">
        Trusted by organisations that can&apos;t afford downtime
      </p>
      {prefersReducedMotion ? (
        <div className="container-main flex flex-wrap items-center gap-x-10 gap-y-4">
          {items('static')}
        </div>
      ) : (
        <div
          className="marquee-mask flex"
          style={{
            maskImage:
              'linear-gradient(90deg, transparent, black 8%, black 92%, transparent)',
          }}
        >
          <div className="marquee-track flex">
            {items('a')}
            {items('b', true)}
          </div>
        </div>
      )}
    </section>
  );
}
```

(Same caveat as Task 6: align `container-main`/`font-display` with repo conventions.)

- [ ] **Step 2: Export from `index.ts`, lint, commit**

```bash
git add src/components/sections/LogoMarquee.tsx src/components/sections/index.ts
git commit -m "feat: trusted-by logo marquee with reduced-motion static fallback"
```

---

### Task 8: BlogCover deterministic cover art

**Files:**
- Create: `src/components/ui/BlogCover.tsx`

- [ ] **Step 1: Create the component:**

```tsx
import { cn } from '@/lib/utils/cn';

/** Deterministic per-post cover art: brand-blue geometric compositions seeded by slug. */

const PALETTES: Record<string, [string, string, string]> = {
  'government-tech': ['#0e1b2c', '#2196F3', '#5ab6f7'],
  'enterprise-software': ['#10243a', '#1976d2', '#87CEEB'],
  'mobile-development': ['#0d2030', '#29a3f4', '#bfe3fb'],
  'event-technology': ['#142a40', '#42a5f5', '#90caf9'],
  'digital-marketing': ['#102136', '#1e88e5', '#a8d8f8'],
  default: ['#0e1b2c', '#2196F3', '#87CEEB'],
};

function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

interface BlogCoverProps {
  slug: string;
  category?: string;
  className?: string;
}

export function BlogCover({ slug, category = 'default', className }: BlogCoverProps) {
  const seed = hash(slug);
  const key = category.toLowerCase().replace(/\s+/g, '-');
  const [bg, mid, hi] = PALETTES[key] ?? PALETTES.default;
  const variant = seed % 3;
  const rot = (seed % 4) * 90;
  const cx = 25 + (seed % 50);
  const cy = 25 + ((seed >> 3) % 50);

  return (
    <div className={cn('relative overflow-hidden', className)} aria-hidden>
      <svg
        viewBox="0 0 400 250"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full"
      >
        <rect width="400" height="250" fill={bg} />
        <g transform={`rotate(${rot} 200 125)`} opacity="0.9">
          {variant === 0 && (
            <>
              <circle cx={cx * 4} cy={cy * 2.5} r="150" fill="none" stroke={mid} strokeWidth="1.5" opacity="0.5" />
              <circle cx={cx * 4} cy={cy * 2.5} r="105" fill="none" stroke={mid} strokeWidth="1.5" opacity="0.7" />
              <circle cx={cx * 4} cy={cy * 2.5} r="60" fill={mid} opacity="0.55" />
              <circle cx={cx * 4} cy={cy * 2.5} r="24" fill={hi} />
            </>
          )}
          {variant === 1 && (
            <>
              {Array.from({ length: 7 }, (_, i) => (
                <rect
                  key={i}
                  x={i * 62 - 30}
                  y={((seed >> i) % 5) * 28}
                  width="34"
                  height="250"
                  fill={i % 2 ? mid : hi}
                  opacity={0.16 + (i % 3) * 0.18}
                />
              ))}
              <circle cx={cx * 4} cy={cy * 2.5} r="46" fill={hi} opacity="0.9" />
            </>
          )}
          {variant === 2 && (
            <>
              <path
                d={`M 0 ${125 + (seed % 60)} Q 130 ${30 + (seed % 80)} 230 ${110 + (seed % 50)} T 430 ${100 + (seed % 70)}`}
                fill="none"
                stroke={mid}
                strokeWidth="40"
                opacity="0.4"
                strokeLinecap="round"
              />
              <path
                d={`M -20 ${165 + (seed % 40)} Q 150 ${70 + (seed % 60)} 260 ${140 + (seed % 40)} T 440 ${130 + (seed % 60)}`}
                fill="none"
                stroke={hi}
                strokeWidth="14"
                opacity="0.85"
                strokeLinecap="round"
              />
            </>
          )}
        </g>
        <rect width="400" height="250" fill="url(#vignette)" opacity="0" />
      </svg>
    </div>
  );
}
```

- [ ] **Step 2: Lint + commit**

```bash
git add src/components/ui/BlogCover.tsx
git commit -m "feat: deterministic geometric blog cover art component"
```

---

### Task 9: Homepage sections — BrandPromise contrast, ServicesScroll heading, ink bands, marquee placement

**Files:**
- Modify: `src/components/sections/BrandPromise.tsx`
- Modify: `src/components/sections/ServicesScroll.tsx`
- Modify: `src/components/sections/StatsGrid.tsx`
- Modify: `src/components/sections/CTASection.tsx`
- Modify: `src/app/page.tsx`

- [ ] **Step 1: BrandPromise scroll-fill.** Read the file (it pins three lines: "Solve real business problems. / Deliver measurable results. / Build systems that scale."). Replace the low-contrast static color with a scrubbed background-clip fill per line:
  - Each line gets `style={{ backgroundImage: 'linear-gradient(90deg, #15202e 50%, #c9cfd6 50%)', backgroundSize: '200% 100%', backgroundPositionX: '100%', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}`.
  - A ScrollTrigger scrub (use the section's existing pin/trigger if present, `scrub: ANIMATION_CONFIG.scrub.tight`) animates each line's `backgroundPositionX` from `100%` to `0%`, staggered so line N starts as line N-1 passes ~60%.
  - Reduced motion: set all lines fully filled (`backgroundPositionX: '0%'`).
  - End state (all-filled `#15202e` on white) passes WCAG AA by construction.

- [ ] **Step 2: ServicesScroll heading + CTA.** Add above the carousel (matching existing section-header patterns elsewhere on the homepage): kicker `OUR SERVICES`, heading `End-to-End Technology Services`, and after/beside it a link-style CTA `View All Services →` to `/services` with `focus-ring`. Do not alter the carousel mechanics.

- [ ] **Step 3: StatsGrid ink band.** Add `section-ink` to the section root; adjust number/label colors to `var(--text-on-ink)` / `var(--text-on-ink-muted)`; any accent strokes use `var(--accent-on-ink)`.

- [ ] **Step 4: CTASection ink band.** Add `section-ink`; headline `var(--text-on-ink)`; primary button stays accent-filled (verify contrast on ink: #2196F3 on #0e1b2c is fine); secondary/ghost buttons get on-ink borders (`border-[rgba(245,248,252,0.25)] text-[var(--text-on-ink)]`).

- [ ] **Step 5: Page order.** In `src/app/page.tsx` insert `<LogoMarquee />` between `<BrandPromise />` and `<ServicesScroll />` (import from `@/components/sections/LogoMarquee`).

- [ ] **Step 6: Verify visually.** Playwright at 1440×900, sessionStorage `kaizen-intro-seen=1`: screenshot scroll positions covering BrandPromise (text must be readable mid-scroll), marquee, stats band, CTA band. Confirm ink bands render with light text and the marquee scrolls.

- [ ] **Step 7: Commit**

```bash
git add src/components/sections/BrandPromise.tsx src/components/sections/ServicesScroll.tsx src/components/sections/StatsGrid.tsx src/components/sections/CTASection.tsx src/app/page.tsx
git commit -m "feat: homepage rhythm — scroll-fill brand promise, services heading/CTA, ink stats+CTA bands, trusted-by marquee"
```

---

### Task 10: RubiksCube hero tightening (EXECUTED INLINE BY MAIN AGENT — do not dispatch)

**Files:**
- Modify: `src/components/sections/RubiksCubeExperience.tsx`

This file is a 1780vh scroll-driven Three.js narrative with finely tuned phase boundaries (see memory notes + `docs/superpowers/specs/2026-06-10-premium-uplift-design.md`). Changes:

- [ ] **Step 1:** Reduce the scroll spacer `1780vh` → `1150vh`. Compensate `INTRO_END` from ~0.10 → ~0.155 (preserves the same absolute pixel distance for the monitor-dive intro: 0.10 × 1780 ≈ 178vh ≈ 0.155 × 1150).
- [ ] **Step 2:** Map the remaining `mainP` phase boundaries so narrative beats keep their relative proportions, EXCEPT the final dispersal segment which is compressed ~50% (this is the dead zone where pieces scatter and the viewport is near-empty).
- [ ] **Step 3:** Narration card restyle: tighter glass (`backdrop-blur` up, `bg-white/65` → stronger, 1px ink border `border-[rgba(14,27,44,0.12)]`, radius `var(--radius-md)`), kicker in mono caps accent, body text at `var(--color-text-primary)` weight 500.
- [ ] **Step 4:** Screenshot sweep at ~12 scroll offsets through the hero; verify: intro dive unchanged in feel, no frame between last narration card and BrandPromise is >80% empty, cards readable.
- [ ] **Step 5: Commit**

```bash
git add src/components/sections/RubiksCubeExperience.tsx
git commit -m "feat: tighten cube hero scroll length, remove dispersal dead zone, restyle narration cards"
```

---

### Task 11: About page — PageHero, milestone strip, ink mission/vision

**Files:**
- Modify: `src/app/about/page.tsx`

- [ ] **Step 1: Replace the hero section** (the current full-height centered text hero) with:

```tsx
<PageHero
  kicker="About Kaizen Infotech"
  title="A Technology Partner Focused on Solving Real Business Problems"
  accentWords={['Solving', 'Real']}
  description="For over a decade, we have partnered with enterprises, government bodies, associations, and institutions across India to design and deliver digital platforms that simplify operations, improve engagement, and support long-term growth."
  breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'About' }]}
  stats={[
    { value: '10+', label: 'Years of Experience' },
    { value: '100+', label: 'Projects Delivered' },
    { value: '8+', label: 'Industries Served' },
  ]}
/>
```

(Keep title/description text EXACTLY as currently in the page — the strings above must be checked against the file and the file's strings win.)

- [ ] **Step 2: Journey timeline → milestone strip.** Remove the three `[Year]` placeholder entries and the first-govt-project `[Describe...]` placeholder. Replace the timeline with a horizontal milestone strip (no dates), each milestone a card with kicker + fact, using ONLY facts already in the page/approved copy:
  1. "Where it started" — founding belief: technology should simplify life, not complicate it.
  2. "Rotary International" — digital ecosystem serving 4,500 clubs and 1.8 lakh members across Zones 4–7.
  3. "Government scale" — digitising operations at Mumbai Port Trust and the Income Tax Department.
  4. "Today" — platforms serving 3Mn+ users across 8+ industries.
  Add `{/* TODO(client): add real years to milestones when provided */}`. Animate with existing `ScrollFadeIn` stagger.

- [ ] **Step 3: Mission/Vision ink band.** The pinned Mission/Vision section gets `section-ink`; the kicker uses `ink-accent` class; pagination dots adapt (`bg-[var(--accent-on-ink)]` active, `bg-[rgba(245,248,252,0.25)]` inactive).

- [ ] **Step 4: Verify.** Screenshots: hero (mesh + masked reveal, no empty void), milestones (no `[Year]` anywhere — also grep the file for `[Year]` and `[Describe` → zero matches), ink band.

- [ ] **Step 5: Commit**

```bash
git add src/app/about/page.tsx
git commit -m "feat: about page — PageHero, fact-based milestone strip (no placeholder years), ink mission/vision"
```

---

### Task 12: Services page + ServiceCardDeck readability + service detail polish

**Files:**
- Modify: `src/app/services/page.tsx`
- Modify: `src/components/sections/ServiceCardDeck.tsx`
- Modify: `src/app/services/[slug]/ServiceDetailClient.tsx`

- [ ] **Step 1: Services hero → PageHero.** Keep the rotating keyword: pass the existing rotating-word element as `children` (the `AnimatePresence` word swap moves inside PageHero's children slot). Breadcrumbs `Home / Services`. Title/description = existing strings.

- [ ] **Step 2: Deck ghost-state fix.** In `ServiceCardDeck.tsx`, find the scroll-driven card transforms. Wherever card `opacity` is scrubbed across the whole transition (causing long unreadable ghost states — confirmed via screenshot at scroll≈1500), clamp it: opacity transitions happen only in the first/last 15% of each card's segment (e.g. map segment progress through `gsap.utils.clamp`/remap so opacity is 1 for the middle 70%), and add a translateY/scale parallax for the transition feel instead. Cards must be readable at every static scroll position.

- [ ] **Step 3: Service detail.** In `ServiceDetailClient.tsx`: mark the breadcrumb current page with `aria-current="page"` + secondary text color; add `focus-ring` to related-service cards and CTA links; apply `section-ink` to the bottom CTA section.

- [ ] **Step 4: Verify.** Screenshots of /services at 6 scroll offsets — every frame must show readable card content (no near-blank frames like the audit's services-1500.png). Screenshot one service detail page.

- [ ] **Step 5: Commit**

```bash
git add src/app/services/page.tsx src/components/sections/ServiceCardDeck.tsx "src/app/services/[slug]/ServiceDetailClient.tsx"
git commit -m "feat: services PageHero, readable card deck (no ghost states), detail page polish"
```

---

### Task 13: Work pages — PageHero, focus states, scrim

**Files:**
- Modify: `src/app/work/page.tsx`
- Modify: `src/components/ui/StickyProjectCard.tsx`
- Modify: `src/app/work/[slug]/ProjectDetailClient.tsx`

- [ ] **Step 1: Work hero → PageHero** (breadcrumbs `Home / Work`, existing title/description). Filter pills get `focus-ring`.
- [ ] **Step 2: StickyProjectCard.** Add `focus-ring` + `tabIndex`/link semantics if missing; strengthen the bottom scrim behind the client name/title: `bg-gradient-to-t from-black/70 via-black/30 to-transparent` so text is legible on any image.
- [ ] **Step 3: Project detail.** Breadcrumb row (`Home / Work / {title}` — title non-link with `aria-current`), prev/next links get hover underline + `focus-ring`.
- [ ] **Step 4: Verify** with screenshots (work list + one detail), keyboard-tab through filters.
- [ ] **Step 5: Commit**

```bash
git add src/app/work/page.tsx src/components/ui/StickyProjectCard.tsx "src/app/work/[slug]/ProjectDetailClient.tsx"
git commit -m "feat: work pages — PageHero, focus states, legible card scrims, detail breadcrumbs"
```

---

### Task 14: Blog pages — covers, hierarchy, persistent newsletter state

**Files:**
- Modify: `src/app/blog/page.tsx`
- Modify: `src/app/blog/[slug]/BlogPostClient.tsx`

- [ ] **Step 1: Blog hero → PageHero** (breadcrumbs `Home / Blog`; existing title/description).
- [ ] **Step 2: Covers.** Replace the gradient-placeholder divs (featured post ~lines 140–142, grid cards ~lines 207–214) with `<BlogCover slug={post.slug} category={post.category} className="absolute inset-0" />` inside the existing aspect-ratio containers. Featured post title bumps one size step (e.g. `text-3xl → text-4xl`).
- [ ] **Step 3: Newsletter persistence.** Find the success-state auto-clear (timeout reset) and remove it — success message persists; add a small "Subscribe another email" reset link instead.
- [ ] **Step 4: Blog post banner.** In `BlogPostClient.tsx`, add a `<BlogCover>` banner (aspect ~21/9, rounded) between the hero meta and article body.
- [ ] **Step 5: Verify**: blog index screenshot — zero empty image boxes; featured card has art; post page has banner.
- [ ] **Step 6: Commit**

```bash
git add src/app/blog/page.tsx "src/app/blog/[slug]/BlogPostClient.tsx"
git commit -m "feat: blog cover art everywhere, stronger featured hierarchy, persistent newsletter confirmation"
```

---

### Task 15: Contact page — grouped form, ink sidebar, email fix

**Files:**
- Modify: `src/app/contact/page.tsx`

- [ ] **Step 1: Hero → PageHero** (breadcrumbs `Home / Contact`, existing copy).
- [ ] **Step 2: Email fix.** Line ~271: the error fallback message must reference `SITE_CONFIG.contactEmail` (connect@kaizeninfotech.com), not `info@`.
- [ ] **Step 3: Form grouping.** Wrap fields in two `<fieldset>`s with `<legend>`s: "Who you are" (Name, Email, Phone, Company) and "Your project" (Budget, Project Type, Message). Phone/Company/Budget/Project Type labels get a muted `(optional)` suffix — only if they are not actually required by the submit handler (check `required` attrs / validation first; Name, Email, Message stay required). Legends styled as mono-caps kickers; fieldsets separated by `var(--space-10)`.
- [ ] **Step 4: Ink sidebar.** The contact-info column becomes an ink panel (`section-ink rounded-2xl p-8` or similar): contact details in on-ink colors, copy-buttons adapted, social row uses the same `href !== '#'` filter as the footer (import `socialLinks` from `@/content/navigation`).
- [ ] **Step 5: Verify**: screenshot; tab through the form (focus rings visible); grep page for `info@kaizeninfotech` in the error path → zero matches.
- [ ] **Step 6: Commit**

```bash
git add src/app/contact/page.tsx
git commit -m "feat: contact — PageHero, grouped lighter-feel form, ink info panel, correct fallback email"
```

---

### Task 16: Careers page — PageHero, verifiable benefits, talent-pool capture

**Files:**
- Modify: `src/app/careers/page.tsx`

- [ ] **Step 1: Hero → PageHero** (breadcrumbs `Home / Careers`, existing copy).
- [ ] **Step 2: Remove the `[FILL IN - Specify actual policy]` benefit** (line ~35). Keep the remaining verifiable benefits; add `{/* TODO(client): add flexible-working policy copy when provided */}`.
- [ ] **Step 3: Talent-pool capture.** Replace the plain "no open roles" box with an engaging empty state card:
  - Heading: "No open roles right now — but we're always meeting good people."
  - Email field + "Keep me posted" button POSTing to `/api/newsletter` (same contract as footer), with persistent success state.
  - Secondary mailto CTA: `Send your CV to ${SITE_CONFIG.email}` (`mailto:` link, `focus-ring`).
- [ ] **Step 4: Verify**: screenshot; grep for `FILL IN` → zero matches.
- [ ] **Step 5: Commit**

```bash
git add src/app/careers/page.tsx
git commit -m "feat: careers — PageHero, verified benefits only, talent-pool capture instead of dead end"
```

---

### Task 17: Navbar — focus trap + focus-visible pass

**Files:**
- Modify: `src/components/layout/Navbar.tsx`

- [ ] **Step 1: Focus trap.** When the mobile menu opens: focus the first menu link; on `Tab`/`Shift+Tab` wrap focus within the menu (links + close button); `Escape` closes and returns focus to the hamburger button. Implement with a `keydown` listener on the menu container (no new dependency).
- [ ] **Step 2: Focus-visible.** Add `focus-ring` to desktop nav links, the logo link, hamburger, and mobile menu items.
- [ ] **Step 3: Verify** with Playwright keyboard simulation: open menu (click hamburger), press Tab ×10 — `document.activeElement` always inside the menu; press Escape — menu closed, focus on hamburger.
- [ ] **Step 4: Commit**

```bash
git add src/components/layout/Navbar.tsx
git commit -m "fix: mobile menu focus trap and focus-visible indicators across navbar"
```

---

### Task 18: Final verification sweep

**Files:**
- Create: `scripts/verify-uplift.mjs` (screenshot sweep — desktop 1440×900 + mobile 390×844, all routes, deep homepage scrolls)

- [ ] **Step 1:** `npm run build` → must pass with zero errors.
- [ ] **Step 2:** Run the screenshot sweep (extend `scripts/audit-shots.mjs` pattern: same skip-loader sessionStorage, both viewports, all 7 routes + one service/work/blog detail each). Review every image for: ink bands rendering, hero readability, no empty boxes, no placeholder text, mobile layout integrity.
- [ ] **Step 3:** Reduced-motion run (`reducedMotion: 'reduce'` context) on `/` and `/about` — no marquee motion, hero text visible immediately.
- [ ] **Step 4:** Grep the whole `src/` for `[Year]`, `FILL IN`, `[Describe` → zero matches. Grep rendered social links for `href="#"` → none rendered (data may still contain '#', UI must filter).
- [ ] **Step 5:** Fix anything found; re-run until clean. Commit fixes individually.
- [ ] **Step 6:** Final commit of verification script:

```bash
git add scripts/verify-uplift.mjs
git commit -m "chore: add uplift verification screenshot sweep"
```
