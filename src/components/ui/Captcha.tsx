'use client';

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { RefreshCw } from 'lucide-react';

// Aadhaar-style alphanumeric captcha. The image (a distorted, path-based SVG)
// and an opaque token come from /api/captcha; the user types what they see. The
// answer + token are reported to the parent and verified server-side on submit
// (see /api/contact + src/lib/captcha.ts) — the code is never exposed to the page.

export interface CaptchaHandle {
  /** Fetch a fresh captcha and clear the input. */
  reset: () => void;
}

interface CaptchaProps {
  /** Called whenever the token or typed answer changes. */
  onChange: (token: string, answer: string) => void;
  error?: boolean;
}

export const Captcha = forwardRef<CaptchaHandle, CaptchaProps>(function Captcha(
  { onChange, error },
  ref,
) {
  const [image, setImage] = useState('');
  const [token, setToken] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(true);
  // Keep latest onChange in a ref so `load` stays stable (no refetch loops).
  const cb = useRef(onChange);
  cb.current = onChange;

  const tokenRef = useRef('');

  const load = async () => {
    setLoading(true);
    setAnswer('');
    try {
      const res = await fetch('/api/captcha', { cache: 'no-store' });
      const data = await res.json();
      setImage(data.image || '');
      setToken(data.token || '');
      tokenRef.current = data.token || '';
      cb.current(data.token || '', '');
    } catch {
      setImage('');
      setToken('');
      tokenRef.current = '';
      cb.current('', '');
    } finally {
      setLoading(false);
    }
  };

  // Load once on mount.
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useImperativeHandle(ref, () => ({ reset: load }), []);

  const onInput = (v: string) => {
    setAnswer(v);
    cb.current(tokenRef.current, v);
  };

  return (
    <div>
      <label className="mb-2 block text-[length:var(--text-sm)] font-medium text-[var(--color-text-primary)]">
        Security check <span className="text-[var(--red-brand)]">*</span>
      </label>
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex h-[70px] w-[200px] items-center justify-center overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[#e6e6e6]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {image ? (
            <img src={image} alt="Captcha — characters to type" width={200} height={70} className="select-none" draggable={false} />
          ) : (
            <span className="text-[length:var(--text-xs)] text-[var(--color-text-tertiary)]">{loading ? 'Loading…' : 'Unavailable'}</span>
          )}
        </div>
        <button
          type="button"
          onClick={load}
          title="Get a new code"
          aria-label="Refresh captcha"
          className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-border)] text-[var(--color-text-secondary)] transition-colors hover:border-[var(--color-accent-primary)] hover:text-[var(--color-text-primary)]"
        >
          <RefreshCw size={17} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>
      <input
        type="text"
        value={answer}
        onChange={(e) => onInput(e.target.value)}
        placeholder="Enter the characters shown above"
        autoComplete="off"
        autoCapitalize="off"
        spellCheck={false}
        className={`mt-3 block w-full max-w-[280px] rounded-[var(--radius-md)] border bg-[var(--color-bg-primary)] px-3 py-2.5 text-[length:var(--text-sm)] tracking-wider text-[var(--color-text-primary)] focus:outline-none ${
          error ? 'border-[var(--red-brand)]' : 'border-[var(--color-border)] focus:border-[var(--color-accent-primary)]'
        }`}
      />
      {error && (
        <p className="mt-1.5 text-[length:var(--text-sm)] text-[var(--red-brand)]" style={{ fontFamily: 'var(--font-body)' }}>
          The code is incorrect — please type the characters exactly (it is case-sensitive).
        </p>
      )}
    </div>
  );
});
