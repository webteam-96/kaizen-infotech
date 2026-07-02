import { Reveal } from '@/components/animation/Reveal';
import { PageHero } from '@/components/sections/PageHero';
import { HexGridBackground } from '@/components/shared/HexGridBackground';
import { SolutionsInAction } from '@/components/sections/SolutionsInAction';import { CtaGlowBackdrop } from '@/components/shared/CtaGlowBackdrop';
import { Button } from '@/components/ui/Button';

export default function WorkPage() {
  return (
    <main className="relative isolate min-h-screen bg-[var(--color-bg-primary)]">      {/* ── Hero ── */}
      <PageHero
        align="center"
        backdrop={<HexGridBackground />}
        kicker="Our Work"
        title="Real-World Digital Solutions Built for Impact"
        accentWords={['Impact']}
        description="Explore our portfolio of digital platforms delivered for government organisations, enterprises, healthcare providers, and global communities. Every project here represents a real problem, a thoughtful solution, and a measurable outcome."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Work' }]}
      />

      {/* ── Solutions in Action — alternating feature cards ── */}
      <SolutionsInAction />

      {/* ── CTA Section ── */}
      <section className="section-ink cta-glow-host seam-red relative isolate overflow-hidden px-6 py-24 md:px-12 lg:px-24">
        <CtaGlowBackdrop />
        <div className="mx-auto max-w-7xl text-center">
          <Reveal variant="up">
            <h2
              className="mb-6 text-[length:var(--h-section)] font-extrabold text-[var(--text-on-ink)]"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              Let&apos;s Build the Next{' '}
              <span className="text-[var(--accent-on-ink)]">Success</span> Story
            </h2>
            <p
              className="mx-auto mb-10 max-w-xl text-[length:var(--text-lg)] text-[var(--text-on-ink-muted)]"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              Looking to build a similar digital solution for your organisation?
              Our team is ready to help.
            </p>
            <Button href="/contact" size="lg">
              Talk to Our Experts
            </Button>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
