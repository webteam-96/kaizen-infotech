export default function Loading() {
  return (
    <div className="fixed inset-0 z-[var(--z-overlay)] flex items-center justify-center bg-[var(--color-bg-primary)]">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-accent-primary)]" />
        <p
          className="text-sm tracking-widest uppercase text-[var(--color-text-tertiary)]"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          Loading
        </p>
      </div>
    </div>
  );
}
