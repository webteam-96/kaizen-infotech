import { PageHero } from '@/components/sections/PageHero';
import { HexGridBackground } from '@/components/shared/HexGridBackground';

// Shared presentation for the /privacy-policy and /terms pages. Server component: it
// renders the same animated PageHero the other sub-pages use (design parity) and
// wraps the legal body in the existing `.prose-custom` typography (globals.css)
// so it reads exactly like the blog — no new styles, no design drift.
interface LegalPageShellProps {
  kicker: string;
  title: string;
  accentWords?: string[];
  intro: string;
  /** Human-readable effective date, e.g. "16 July 2026". Hard-coded per page —
   *  a legal "last updated" must reflect a real revision, never render-time. */
  lastUpdated: string;
  children: React.ReactNode;
}

export function LegalPageShell({
  kicker,
  title,
  accentWords,
  intro,
  lastUpdated,
  children,
}: LegalPageShellProps) {
  return (
    <main className="relative isolate min-h-screen bg-[var(--color-bg-primary)]">
      <PageHero
        kicker={kicker}
        title={title}
        accentWords={accentWords}
        description={intro}
        backdrop={<HexGridBackground />}
      />

      <section className="px-6 pb-28 md:px-12 lg:px-24">
        <div className="mx-auto max-w-3xl">
          <p className="mb-10 font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-text-tertiary)]">
            Last updated: {lastUpdated}
          </p>
          {/* No scroll-reveal wrapper here on purpose: legal content must always be
              visible and never depend on an in-view trigger firing. The animated
              PageHero above keeps the page consistent with the rest of the site. */}
          <div className="prose-custom" style={{ fontFamily: 'var(--font-body)' }}>
            {children}
          </div>
        </div>
      </section>
    </main>
  );
}
