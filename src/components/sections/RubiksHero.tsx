'use client';

import dynamic from 'next/dynamic';
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

const Spacer = () => <div style={{ height: `${SPACER_VH}vh`, background: BG_COLOR }} />;

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
