'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[var(--color-bg-primary)] px-6">
      <p
        className="text-[length:var(--text-4xl)] font-bold text-[var(--color-accent-warm)]"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        Something went wrong
      </p>
      <p className="mt-4 max-w-md text-center text-[length:var(--text-base)] text-[var(--color-text-secondary)]">
        {error.message || 'An unexpected error occurred. Please try again.'}
      </p>
      <button
        onClick={() => reset()}
        className="mt-8 rounded-full bg-[var(--color-accent-primary)] px-8 py-3 text-sm font-medium text-[var(--color-text-inverse)] transition-all duration-300 hover:scale-105"
      >
        Try Again
      </button>
    </main>
  );
}
