# Kaizen Infotech — Premium Uplift Design

**Date:** 2026-06-10
**Status:** Approved (scope: Premium uplift · hero: tighten + enhance · rhythm: strategic dark bands)

## Goal

Elevate the whole site's animation, UX, and design to a premium-agency level without discarding
the approved brand, copy, or the Rubik's-cube hero narrative. Fix every credibility bug, unify the
motion language, replace the monotone white inner pages with a distinctive shared hero +
dark-band rhythm, and tighten the homepage hero scroll.

## Constraints

- Existing approved client copy must not be rewritten (headlines/descriptions stay).
- No invented facts: no fake years, no fake policies, no fake social URLs.
- The cube hero's choreography (Spline monitor dive, scissor zoom, card alternation) stays; only
  pacing, dead zones, and card styling change.
- All motion must respect `prefers-reduced-motion`.
- Working tree has uncommitted WIP — do not revert or rewrite unrelated hunks.

## Phase 0 — Credibility & correctness

| Item | File(s) | Change |
|---|---|---|
| About `[Year]` placeholders | `src/app/about/page.tsx` | Replace year-based journey timeline with a fact-based milestone strip using only approved copy facts (10+ years, Rotary network 4,500 clubs / 1.8 lakh members, Mumbai Port Trust, Income Tax Dept, 3Mn+ users). No invented dates. Structure keeps a `// TODO: real years` seam. |
| Careers `[FILL IN]` | `src/app/careers/page.tsx` | Drop the unverifiable "Flexible Working" bullet; keep verifiable benefits. |
| Dead social links | `src/lib/utils/constants.ts`, `src/components/layout/Footer.tsx`, `src/app/contact/page.tsx` | Single `SITE_CONFIG.social` source; entries whose URL is `#`/empty are filtered out of the UI (not rendered dead). |
| Email mismatch | `src/app/contact/page.tsx` | Error fallback uses `connect@kaizeninfotech.com`. |
| Blog empty covers | `src/components/ui/BlogCover.tsx` (new), `src/app/blog/page.tsx`, `src/app/blog/[slug]/BlogPostClient.tsx` | Deterministic per-category SVG cover art (brand-blue geometric compositions, seeded by slug). No empty gradient boxes. |

## Phase 1 — Motion system unification

- `src/lib/animations/config.ts`: extend `ANIMATION_CONFIG` (durations: micro 0.15, fast 0.3,
  normal 0.6, slow 1.0, cinematic 1.5, ambient 3; shared Framer ease export
  `EASE_OUT = [0.25, 0.46, 0.45, 0.94]`). Refit `FadeIn`, `StaggerChildren`, `FloatingElement`,
  `CustomCursor`, `SectionCounter`, `Hero` to use it.
- Reduced-motion: gate `CountdownLoader` (skip count, quick fade) and `SectionCounter` flip.
- `RubiksCubeExperience`: full unmount cleanup (cancel RAF, remove listeners, dispose renderer,
  null Spline refs).
- Perf: `will-change: transform` on parallax orbs / ProcessSteps panels / StatsGrid; remove
  `children` from `TextReveal` dep array; memoize `CountUp` display updates.

## Phase 2 — Shared foundation

### Design tokens (`src/app/globals.css`)
- Ink surface tokens: `--surface-ink: #0E1B2C` (deep navy-ink), `--surface-ink-soft: #16273D`,
  `--text-on-ink: #F5F8FC`, `--text-on-ink-muted: rgba(245,248,252,0.64)`,
  `--accent-on-ink: #5AB6F7`. A `.section-ink` class applies surface + text color and adapts
  child headings/links.
- Accent tint scale: `--accent-10/20/30` rgba steps of `#2196F3` to replace hardcoded rgba.
- `.focus-ring` utility: `outline: 2px solid var(--color-accent-primary); outline-offset: 3px`
  via `:focus-visible`; applied to nav links, footer links, cards, accordion, filters.
- Cursor fallback: remove `cursor: none !important`; add `html.has-custom-cursor * { cursor: none }`
  toggled by `CursorProvider` on mount (desktop + fine pointer only).

### New components
- `src/components/sections/PageHero.tsx`: props `{ kicker, title, accentWords?, description?,
  breadcrumbs?, stats?, align? }`. Oversized clamp() display type with per-line masked reveal
  (GSAP, config eases), animated gradient-mesh backdrop (two slow-drifting radial blobs in brand
  blues + grain overlay, CSS-animated, paused under reduced motion), breadcrumb row, optional
  stat strip. Used by About, Services, Work, Blog, Contact, Careers.
- `src/components/sections/LogoMarquee.tsx`: "Trusted by organisations that can't afford
  downtime" + infinite text-wordmark marquee (Rotary International Zones 4–7, Mumbai Port Trust,
  Income Tax Department, JITO, MRPL, Orion Gametes). CSS keyframe loop, pause on hover,
  static wrap under reduced motion.
- Focus trap in mobile menu (`Navbar.tsx`): trap Tab, Esc closes, focus first item on open,
  restore focus on close.

## Phase 3 — Homepage

- `RubiksCubeExperience.tsx`:
  - Spacer 1780vh → ~1150vh; rebalance phase boundaries so `INTRO_END` zoom feels identical
    (same eased ranges over new total).
  - Dead-zone fix: dispersal phase compressed and overlapped — BrandPromise section begins
    rising (negative margin / earlier trigger) while pieces exit, so the viewport is never
    near-empty for more than ~0.5 viewport heights.
  - Narration cards: tighter glass (stronger blur + 1px ink border + smaller radius), kicker in
    mono caps, body in display font at higher contrast.
- `BrandPromise.tsx`: scroll-scrubbed per-word color fill `#C9CFD6 → #15202E`; never below
  WCAG AA mid-scroll end state.
- `ServicesScroll.tsx`: add "End-to-End Technology Services" heading + "View All Services" CTA.
- `StatsGrid.tsx` → ink band; `CTASection.tsx` → ink band with oversized type + magnetic CTA.
- `src/app/page.tsx` order: Hero → BrandPromise → LogoMarquee → ServicesScroll → Stats(ink) →
  FeaturedWork → ProcessSteps → Industries → TechStack → WhyChoose → CTA(ink).

## Phase 4 — Inner pages

- **About**: PageHero (breadcrumb Home/About) + milestone strip (Phase 0) + Mission/Vision
  pinned section becomes an ink band.
- **Services**: PageHero (keeps keyword rotation as accent word swap). `ServiceCardDeck`
  ghost-state fix: replace opacity-scrub with translate/scale parallax stack — text never
  below 90% opacity once revealed. Ink CTA band.
- **Service detail**: breadcrumb current-page state, focus states on related cards.
- **Work**: PageHero + filter pills focus states; `StickyProjectCard` keyboard focus ring +
  client-name legibility (gradient scrim floor).
- **Project detail**: breadcrumb (Home/Work/title), prev–next links get hover/focus polish.
- **Blog**: covers wired in; featured post gets cover + larger title hierarchy; newsletter
  success message persists (no auto-clear) with reset option.
- **Blog post**: cover banner, author block stays generic (no fake names).
- **Contact**: form grouped into "Who you are" / "Your project" fieldsets, Budget/ProjectType/
  Phone/Company marked optional; ink info sidebar; social via SITE_CONFIG filter; email fix.
- **Careers**: PageHero; empty state becomes talent-pool capture card (mailto CV CTA +
  newsletter-style email field posting to existing `/api/newsletter`).
- **Footer**: ink treatment aligned to band system, Privacy/Terms links from `navigation.ts`,
  social filtered via SITE_CONFIG, newsletter wired to `/api/newsletter` with success state.

## Phase 5 — Verification

- `npm run build` clean.
- Playwright sweep: desktop 1440×900 + mobile 390×844 screenshots of all pages including
  deep-scroll homepage; confirm hero pacing, ink bands, hero readability, no empty boxes.
- Reduced-motion spot check (`emulateMedia({ reducedMotion: 'reduce' })`) on home + about.
- Keyboard pass: tab through navbar/mobile menu/accordion/filters.

## Out of scope (TODO seams left in code)

Real social URLs, real journey years, careers policy copy, contact/newsletter email-provider
wiring, logo redesign, dark-mode toggle.
