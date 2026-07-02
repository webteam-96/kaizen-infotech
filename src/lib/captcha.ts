import crypto from 'node:crypto';

// ---------------------------------------------------------------------------
// Stateless, server-verified alphanumeric CAPTCHA (Aadhaar-style).
//
// Security model:
//  • The code is generated server-side and only ever leaves as an image whose
//    glyphs are vector <path> outlines — never as text in the page/JSON — so it
//    can't be scraped.
//  • The client gets an opaque token = `exp.HMAC(secret, code:exp)`. The code
//    is NOT in the token; the HMAC is one-way, so it can't be reversed.
//  • On submit the server recomputes HMAC(secret, answer:exp) and compares
//    (constant-time). Only the exact (case-sensitive) code matches.
//  • Tokens are time-limited (TTL) and single-use (replay-protected) per server
//    process. NOTE: single-use state is in-memory — it holds on a persistent
//    Node server (dev / self-host); on serverless it resets per instance.
// ---------------------------------------------------------------------------

const SECRET = process.env.CAPTCHA_SECRET || 'kaizen-captcha-dev-secret-change-me';
const TTL_MS = 10 * 60 * 1000; // 10 minutes

// Ambiguous characters removed (0/O, 1/l/I) so humans aren't tripped up, while
// keeping digits + upper + lower so the code is case-sensitive and mixed.
const CHARS = 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function generateCode(length = 6): string {
  let out = '';
  for (let i = 0; i < length; i++) {
    out += CHARS[crypto.randomInt(CHARS.length)];
  }
  return out;
}

function sign(code: string, exp: number): string {
  return crypto.createHmac('sha256', SECRET).update(`${code}:${exp}`).digest('hex');
}

/** Opaque token bound to the code. Contains no readable copy of the code. */
export function makeToken(code: string): string {
  const exp = Date.now() + TTL_MS;
  return `${exp}.${sign(code, exp)}`;
}

// Single-use store: signature -> expiry. A signature is only recorded once a
// CORRECT answer is verified, so a solved captcha can't be replayed.
const usedSignatures = new Map<string, number>();
function sweep() {
  const now = Date.now();
  for (const [sig, exp] of usedSignatures) if (exp < now) usedSignatures.delete(sig);
}

/** Verify a user's answer against the token. Case-sensitive, timed, single-use. */
export function verifyCaptcha(token: string, answer: string): boolean {
  if (!token || !answer) return false;

  const dot = token.indexOf('.');
  if (dot < 0) return false;
  const exp = Number(token.slice(0, dot));
  const sig = token.slice(dot + 1);
  if (!Number.isFinite(exp) || !sig || Date.now() > exp) return false;

  const expected = sign(answer, exp);
  const a = Buffer.from(sig, 'utf8');
  const b = Buffer.from(expected, 'utf8');
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return false;

  // Correct answer — enforce single use.
  sweep();
  if (usedSignatures.has(sig)) return false;
  usedSignatures.set(sig, exp);
  return true;
}
