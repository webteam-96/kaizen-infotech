'use client';

import dynamic from 'next/dynamic';
import { useEffect, type CSSProperties } from 'react';
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
// CLS-hardened sizing: the img's LAYOUT box is the full sticky viewport
// (inset-0, width/height 100%, object-fit contain — no calc()/min()/svh width
// math, nothing the browser can re-resolve mid-load; an earlier version sized
// the img with min(90vw, calc(…svh…)) inline widths and Lighthouse caught the
// box re-laying-out between streaming/hydration frames as a ~0.14 CLS event).
// ALL geometry matching against RubiksCubeExperience's computeSplineScale()
// happens in `transform` + object-position instead, which are paint-only and
// exempt from layout-shift scoring by spec:
//   desktop (>1024): contain height ≈ 100svh ≈ the frame's (svh−96)×1.16;
//     translate(calc(20% + 60px)) re-centres onto the right column
//     (0.7·vw + 60px) at every viewport width; ×1.04 closes the size gap.
//   compact (≤1024): contain is width-driven on portrait; ×1.45 = the
//     experience's own compact `fill` factor exactly.
// Poster asset is the FULL-QUALITY 2412×1808 capture (v2, ~95KB q86) — the old
// 14.5KB webp was compressed on the assumption a heavy CSS blur would always
// hide its artifacts, which made the monitor read as permanently smeared
// (especially on phones, where the poster IS the monitor and never crossfades
// to the live scene). Compact/touch now shows it fully crisp; desktop keeps a
// light 2.5px defocus purely as the "focuses in" placeholder feel until the
// live Spline scene fades over it.
const posterImgStyle: CSSProperties = {
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
  objectFit: 'contain',
  pointerEvents: 'none',
};

const Spacer = () => (
  <div style={{ height: `${SPACER_VH}vh`, background: BG_COLOR }}>
    <div
      className="sticky top-0 overflow-hidden"
      // #e9eef8 = the experience's opaque intro-stage backdrop (introBgFx), so
      // the pre-mount frame matches the mounted first frame.
      style={{ height: '100svh', background: '#e9eef8' }}
    >
      {/* compact (phones + portrait tablets): monitor-as-hero, centred, CRISP —
          on touch this poster stays as the monitor, so no placeholder blur */}
      <img
        className="lg:hidden"
        src="/images/hero/spline-monitor-poster-v2.webp"
        alt=""
        aria-hidden
        draggable={false}
        fetchPriority="high"
        decoding="async"
        style={{
          ...posterImgStyle,
          objectPosition: '50% 45%',
          transform: 'scale(1.45)',
          transformOrigin: '50% 45%',
        }}
      />
      {/* desktop (>1024): two-column layout, monitor right; light defocus until
          the live scene takes over */}
      <img
        className="hidden lg:block"
        src="/images/hero/spline-monitor-poster-v2.webp"
        alt=""
        aria-hidden
        draggable={false}
        fetchPriority="high"
        decoding="async"
        style={{
          ...posterImgStyle,
          objectPosition: '50% 50%',
          filter: 'blur(2.5px)',
          transform: 'translate(calc(20% + 60px), 30px) scale(1.04)',
        }}
      />
    </div>
  </div>
);

const RubiksCubeExperience = dynamic(
  () => import('./RubiksCubeExperience').then((m) => m.RubiksCubeExperience),
  { ssr: false, loading: () => <Spacer /> },
);

export function RubiksHero() {
  const cap = useDeviceCapability();

  // Warm the Spline runtime chunk + scene file the moment a capable
  // fine-pointer device is confirmed — in PARALLEL with the hero chunk
  // download instead of serially after it mounts. Shortens the blurred
  // placeholder window on desktop by roughly the hero chunk's fetch+parse
  // time; phones/lite devices (which never mount the live scene) request
  // nothing. The experience's own warm-up stays as a fallback — import() is
  // cached and duplicate prefetch links dedupe to a single request.
  useEffect(() => {
    if (!cap.ready || cap.liteExperience) return;
    if (window.matchMedia('(pointer: coarse)').matches) return;
    void import('@splinetool/react-spline');
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.as = 'fetch';
    // Keep in sync with SPLINE_SCENE_URL in RubiksCubeExperience — NOT
    // imported from there, because a static import would fuse the heavy hero
    // chunk into this eager one.
    link.href = '/spline/scene-v1.splinecode';
    document.head.appendChild(link);
    return () => link.remove();
  }, [cap.ready, cap.liteExperience]);

  // SSR + first client render (before the capability resolves): emit the exact same
  // spacer, so hydration matches and the page height is stable.
  if (!cap.ready) return <Spacer />;

  // Constrained / reduced-motion / metered / low-end → already-designed static hero,
  // and the heavy chunk is never requested.
  if (cap.liteExperience) return <RubiksHeroStatic />;

  // Capable devices → full 3D experience (deferred, non-blocking).
  return <RubiksCubeExperience />;
}
