'use client';

import { useEffect, useState } from 'react';
import { Lock } from 'lucide-react';
import { ADMIN_PASSWORD, ADMIN_SESSION_KEY } from '@/lib/blog/config';

// Client-side password gate. NOTE: this only hides the UI — it is not real
// security (the data lives in the visitor's own browser, and client code is
// inspectable). For a production admin, replace with server-side auth.

export function AdminGate({ children }: { children: React.ReactNode }) {
  const [authed, setAuthed] = useState(false);
  const [ready, setReady] = useState(false);
  const [pw, setPw] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    setAuthed(sessionStorage.getItem(ADMIN_SESSION_KEY) === '1');
    setReady(true);
  }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pw === ADMIN_PASSWORD) {
      sessionStorage.setItem(ADMIN_SESSION_KEY, '1');
      setAuthed(true);
      setError(false);
    } else {
      setError(true);
    }
  };

  if (!ready) return null;

  if (!authed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg-secondary)] px-6">
        <form
          onSubmit={submit}
          className="w-full max-w-sm rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-primary)] p-8 shadow-lg"
        >
          <div className="mb-5 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(192,0,0,0.08)] text-[var(--red-brand)]">
              <Lock size={18} />
            </span>
            <div>
              <h1 className="text-[length:var(--text-lg)] font-bold text-[var(--color-text-primary)]">
                Blog Admin
              </h1>
              <p className="text-[length:var(--text-xs)] text-[var(--color-text-tertiary)]">
                Enter the admin password
              </p>
            </div>
          </div>
          <input
            type="password"
            value={pw}
            autoFocus
            onChange={(e) => { setPw(e.target.value); setError(false); }}
            placeholder="Password"
            className="mb-3 block w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-primary)] px-3 py-2.5 text-[var(--color-text-primary)] focus:border-[var(--color-accent-primary)] focus:outline-none"
          />
          {error && (
            <p className="mb-3 text-[length:var(--text-sm)] text-[var(--red-brand)]">Incorrect password.</p>
          )}
          <button
            type="submit"
            className="w-full rounded-[var(--radius-md)] bg-[var(--color-accent-primary)] px-4 py-2.5 font-semibold text-white transition-opacity hover:opacity-90"
          >
            Unlock
          </button>
        </form>
      </div>
    );
  }

  return <>{children}</>;
}
