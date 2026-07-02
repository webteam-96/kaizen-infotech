// ─────────────────────────────────────────────────────────────────────────────
// CtaGlowBackdrop — the shared background for the site's five CTA bands
// (home "Ready to Digitise…", about "Let's Build Technology…", services "Let's
// Discuss Your Project", work "Let's Build the Next Success Story", blog "Stay
// in the Loop").
//
// The dark-blue base comes from the host section's `.section-ink` colour. This
// layer adds soft LIGHT-BLUE "lights" (blurred radial orbs) that sit still and
// dim at rest, then brighten and drift around while the section is hovered.
//
// Purely CSS-driven: the host section carries `.cta-glow-host`, and the drift +
// brighten fires on `.cta-glow-host:hover` (see globals.css). No JS, no state —
// so it stays consistent and cheap across every page. Reduced-motion users get
// the static dim lights (drift disabled via CSS).
//
// Host requirements (already true for all five CTA sections): `relative isolate`
// so this `-z-10` layer paints ABOVE the solid dark-blue base but BELOW content.
// ─────────────────────────────────────────────────────────────────────────────

export function CtaGlowBackdrop() {
  return (
    <div aria-hidden className="cta-glow pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <span className="cta-glow-orb cta-glow-orb--a" />
      <span className="cta-glow-orb cta-glow-orb--b" />
      <span className="cta-glow-orb cta-glow-orb--c" />
    </div>
  );
}
