// Static, fully-visible hero — the lightweight fallback for the 3D Rubik's-cube
// opening act. Rendered (instead of the ~4.5MB three.js + Spline experience) for
// reduced-motion, Save-Data, slow-network and genuinely low-end devices, AND used
// as RubiksCubeExperience's own reduced-motion branch — one source of truth so the
// approved copy below can never drift between the two paths.
//
// No pinning, no fake scroll height, no 3D, no scroll-driven opacity. Each card
// rests at opacity:1 so nothing can ever be skipped or dimmed.

const BG_COLOR = '#f5f5f5';

// Approved client copy — DO NOT reword.
const LINES = [
  'A scrambled Rubik’s Cube looks impossible at first — and so does your business.',
  'Fixing everything at once only makes it worse. The right move, in the right sequence, changes everything.',
  'We don’t force technology onto your operations. We understand your structure — then solve it, step by step.',
  'No temporary fixes. What was complex becomes structured. What slowed you down begins to accelerate you.',
  'Anyone can twist the cube. It takes expertise to solve it.',
  'This is Kaizen. Built layer by layer — business-first thinking, scalable architecture, clean development, transparent execution.',
  'Let’s Solve It — The Right Way.',
];

export function RubiksHeroStatic() {
  return (
    <section className="relative px-6 py-24 md:py-32" style={{ background: BG_COLOR }}>
      <div className="mx-auto flex max-w-3xl flex-col gap-10">
        <header className="text-center">
          <p className="mb-4 font-[family-name:var(--font-body)] text-xs uppercase tracking-[0.3em] text-[var(--color-text-tertiary)]">
            Kaizen Infotech Solutions
          </p>
          <h1 className="font-[family-name:var(--font-display)] text-[clamp(2.25rem,6vw,4rem)] font-semibold leading-[1.06] tracking-tight text-[var(--color-text-primary)]">
            Your Vision, <span className="text-[var(--color-accent-warm)]">Our Code</span>
          </h1>
        </header>
        {LINES.map((line, i) => (
          <p
            key={i}
            className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-6 text-lg leading-relaxed text-[var(--color-text-primary)] md:text-xl"
          >
            {line}
          </p>
        ))}
      </div>
    </section>
  );
}
