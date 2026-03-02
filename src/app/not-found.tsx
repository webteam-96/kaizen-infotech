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
        className="mt-4 text-[length:var(--text-2xl)] text-[var(--color-text-primary)]"
        style={{ fontFamily: 'var(--font-heading)' }}
      >
        Page Not Found
      </h1>
      <p className="mt-2 max-w-md text-center text-[length:var(--text-base)] text-[var(--color-text-secondary)]">
        The page you&apos;re looking for doesn&apos;t exist or has been moved. Let&apos;s get you
        back on track.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex min-h-[44px] items-center justify-center rounded-full bg-[var(--color-accent-primary)] px-8 py-3 text-sm font-medium text-[var(--color-text-inverse)] transition-all duration-300 hover:scale-105 hover:shadow-[var(--shadow-glow)]"
      >
        Back to Home
      </Link>
    </main>
  );
}
