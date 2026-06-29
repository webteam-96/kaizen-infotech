'use client';

import { useEffect, useRef } from 'react';

// Cloudflare Turnstile CAPTCHA widget. Privacy-friendly, strong bot protection,
// and verified server-side (see /api/contact) so it can't be spoofed by a
// client. The default key below is Cloudflare's public TEST site key (always
// passes) so the form works out of the box; set NEXT_PUBLIC_TURNSTILE_SITE_KEY
// to your real key for production protection.

const SITE_KEY =
  process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '1x00000000000000000000AA';
const SCRIPT_SRC =
  'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

interface TurnstileApi {
  render: (el: HTMLElement, opts: Record<string, unknown>) => string;
  remove: (id: string) => void;
  reset: (id?: string) => void;
}
declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

let scriptPromise: Promise<void> | null = null;
function loadScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (window.turnstile) return Promise.resolve();
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = SCRIPT_SRC;
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('Turnstile failed to load'));
    document.head.appendChild(s);
  });
  return scriptPromise;
}

interface TurnstileProps {
  onVerify: (token: string) => void;
  onExpire?: () => void;
}

export function Turnstile({ onVerify, onExpire }: TurnstileProps) {
  const ref = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  // Keep latest callbacks in refs so the widget renders once (no re-render loop).
  const cbVerify = useRef(onVerify);
  cbVerify.current = onVerify;
  const cbExpire = useRef(onExpire);
  cbExpire.current = onExpire;

  useEffect(() => {
    let cancelled = false;
    loadScript()
      .then(() => {
        if (cancelled || !ref.current || !window.turnstile) return;
        widgetId.current = window.turnstile.render(ref.current, {
          sitekey: SITE_KEY,
          theme: 'light',
          callback: (token: string) => cbVerify.current(token),
          'expired-callback': () => {
            cbExpire.current?.();
            cbVerify.current('');
          },
          'error-callback': () => cbVerify.current(''),
        });
      })
      .catch(() => {
        /* network/script error — submit will be blocked by the empty token */
      });

    return () => {
      cancelled = true;
      if (widgetId.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetId.current);
        } catch {
          /* already gone */
        }
      }
    };
  }, []);

  return <div ref={ref} />;
}
