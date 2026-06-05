import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[var(--color-bg-primary)] px-6">
      <p
        className="text-[length:var(--text-mega)] font-bold leading-none text-[var(--color-accent-primary)]"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        404
      </p>
      <h1
        className="mt-4 text-[length:var(--h-page)] text-[var(--color-text-primary)]"
        style={{ fontFamily: 'var(--font-heading)' }}
      >
        Page Not Found
      </h1>
      <p className="mt-2 max-w-md text-center text-[length:var(--h-sub)] text-[var(--color-text-secondary)]">
        The page you are looking for does not exist or has been moved. Let us get you back on track.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex min-h-[44px] items-center justify-center rounded-full bg-[var(--color-accent-primary)] px-8 py-3 text-sm font-medium text-[var(--color-text-inverse)] transition-all duration-300 hover:scale-105 hover:shadow-[var(--shadow-glow)]"
      >
        Back to Home
      </Link>
      <nav className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
        <Link
          href="/services"
          className="text-[length:var(--text-sm)] text-[var(--color-text-secondary)] underline underline-offset-4 hover:text-[var(--color-accent-primary)] transition-colors"
        >
          Our Services
        </Link>
        <Link
          href="/work"
          className="text-[length:var(--text-sm)] text-[var(--color-text-secondary)] underline underline-offset-4 hover:text-[var(--color-accent-primary)] transition-colors"
        >
          Our Work
        </Link>
        <Link
          href="/contact"
          className="text-[length:var(--text-sm)] text-[var(--color-text-secondary)] underline underline-offset-4 hover:text-[var(--color-accent-primary)] transition-colors"
        >
          Contact Us
        </Link>
      </nav>
    </main>
  );
}
