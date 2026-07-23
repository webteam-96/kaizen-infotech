'use client';

import dynamic from 'next/dynamic';
import type { CSSProperties } from 'react';
import { useDeviceCapability } from '@/hooks';
import { RubiksHeroStatic } from './RubiksHeroStatic';

// ─────────────────────────────────────────────────────────────────────────────
// RubiksHero — the home hero's capability gate + code-split boundary.
//
// The full experience (RubiksCubeExperience) statically pulls three.js (~1.94MB)
// and @splinetool/react-spline (~2.58MB). Importing it directly meant that ~4.5MB
// was fetched + parsed on EVERY device — including reduced-motion / low-end / metered
// users who only ever see the static text hero — and was route-prefetched onto every
// other page. This wrapper fixes both:
//   • next/dynamic(ssr:false) puts three+Spline in a separate chunk that loads only
//     when a CAPABLE device actually mounts the experience (masked by the countdown
//     loader), so it never blocks first paint/hydration and is no longer prefetched
//     everywhere.
//   • Constrained devices render RubiksHeroStatic and NEVER trigger the import, so the
//     4.5MB (and the two live WebGL contexts that hang weak GPUs) are skipped entirely.
//
// The full path is byte-for-byte the original experience on capable devices.
// ─────────────────────────────────────────────────────────────────────────────

// Matches RubiksCubeExperience's own SPACER_VH (120 intro + 600 narrative) and
// BG_COLOR so the loading/SSR placeholder is identical to what the heavy component
// emitted while un-mounted — no layout shift, no hydration mismatch.
const SPACER_VH = 720;
const BG_COLOR = '#f5f5f5';

// ── SSR poster: the LCP fix ──────────────────────────────────────────────────
// The spacer used to be a blank block, so the first viewport had NO contentful
// paint until this dynamic chunk (687KB gz) downloaded, hydrated and mounted —
// Lighthouse pinned mobile LCP at ~8s (the post-countdown reveal). Painting the
// blurred monitor poster (the experience's own designated LCP element, already
// <link rel=preload>-ed in page.tsx) inside the spacer server-side gives the
// browser a large first-viewport LCP candidate at HTML-parse time. LCP counts
// paints occluded by the countdown overlay, so on first visits LCP binds at
// ~1-2s beneath the loader with zero visible change; on repeat visits this
// replaces the old blank flash until the experience takes over with its
// identical poster in the same spot.
//
// Geometry mirrors RubiksCubeExperience's computeSplineScale() (fit-scale of a
// 1200×900 design frame) closely enough that the takeover doesn't jump behind
// the 7px blur:
//   desktop (>1024): right 60% column, height-fit ×1.16 overflow, 90vw width cap
//   compact (≤1024): centred, width-driven 145vw, height-clamped ×1.45
const posterImgStyle: CSSProperties = {
  aspectRatio: '4 / 3',
  maxWidth: 'none',
  objectFit: 'fill',
  filter: 'blur(7px)',
  transform: 'scale(1.04)',
};

const Spacer = () => (
  <div style={{ height: `${SPACER_VH}vh`, background: BG_COLOR }}>
    <div
      className="sticky top-0 overflow-hidden"
      // #e9eef8 = the experience's opaque intro-stage backdrop (introBgFx), so
      // the pre-mount frame matches the mounted first frame.
      style={{ height: '100svh', background: '#e9eef8' }}
    >
      {/* compact (phones + portrait tablets): monitor-as-hero, centred */}
      <div className="absolute inset-0 flex items-center justify-center lg:hidden">
        <img
          src="/images/hero/spline-monitor-poster.webp"
          alt=""
          aria-hidden
          draggable={false}
          fetchPriority="high"
          decoding="async"
          style={{ ...posterImgStyle, width: 'min(145vw, calc((100svh - 130px) * 1.933))' }}
        />
      </div>
      {/* desktop (>1024): two-column layout, monitor right */}
      <div className="absolute inset-y-0 right-0 hidden w-[60%] items-center justify-center pl-[120px] pt-[60px] lg:flex">
        <img
          src="/images/hero/spline-monitor-poster.webp"
          alt=""
          aria-hidden
          draggable={false}
          fetchPriority="high"
          decoding="async"
          style={{ ...posterImgStyle, width: 'min(90vw, calc((100svh - 96px) * 1.547))' }}
        />
      </div>
    </div>
  </div>
);

const RubiksCubeExperience = dynamic(
  () => import('./RubiksCubeExperience').then((m) => m.RubiksCubeExperience),
  { ssr: false, loading: () => <Spacer /> },
);

export function RubiksHero() {
  const cap = useDeviceCapability();

  // SSR + first client render (before the capability resolves): emit the exact same
  // spacer, so hydration matches and the page height is stable.
  if (!cap.ready) return <Spacer />;

  // Constrained / reduced-motion / metered / low-end → already-designed static hero,
  // and the heavy chunk is never requested.
  if (cap.liteExperience) return <RubiksHeroStatic />;

  // Capable devices → full 3D experience (deferred, non-blocking).
  return <RubiksCubeExperience />;
}
