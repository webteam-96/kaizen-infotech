import { NextRequest, NextResponse } from 'next/server';

// Contact form → email via Resend (https://resend.com) REST API. No SDK needed.
// Configure in .env.local: RESEND_API_KEY (required to actually send),
// CONTACT_TO, CONTACT_FROM. Needs a server runtime (works on `next dev` and any
// Node host). If no API key is set, the submission is logged and the form still
// reports success, so local development isn't blocked.

export const runtime = 'nodejs';

const TO = process.env.CONTACT_TO ?? 'connect@kaizeninfotech.com';
const FROM = process.env.CONTACT_FROM ?? 'Kaizen Website <onboarding@resend.dev>';

// Cloudflare Turnstile secret. Default = Cloudflare's TEST secret (always
// passes) so the flow works locally; set TURNSTILE_SECRET_KEY to your real
// secret for production. Set it to an empty string to disable the check.
const TURNSTILE_SECRET =
  process.env.TURNSTILE_SECRET_KEY ?? '1x0000000000000000000000000000000AA';

/** Verify the Turnstile token with Cloudflare. Returns true if the check passes
 *  or is disabled. This runs server-side, so a bot can't bypass it. */
async function verifyCaptcha(token: string, ip?: string): Promise<boolean> {
  if (!TURNSTILE_SECRET) return true; // explicitly disabled
  if (!token) return false;
  try {
    const form = new URLSearchParams();
    form.append('secret', TURNSTILE_SECRET);
    form.append('response', token);
    if (ip) form.append('remoteip', ip);
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: form,
    });
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}

function esc(v: unknown): string {
  return String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function row(label: string, value: unknown): string {
  if (!value) return '';
  return `<tr>
    <td style="padding:8px 14px;background:#f5f7fa;font-weight:600;white-space:nowrap;vertical-align:top">${esc(label)}</td>
    <td style="padding:8px 14px;border-bottom:1px solid #eee">${esc(value).replace(/\n/g, '<br/>')}</td>
  </tr>`;
}

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid request.' }, { status: 400 });
  }

  const name = String(body.name ?? '').trim();
  const email = String(body.email ?? '').trim();
  const message = String(body.message ?? '').trim();
  const { phone, company, budget, projectType } = body;

  if (!name || !email || !message) {
    return NextResponse.json(
      { success: false, error: 'Name, email and message are required.' },
      { status: 400 },
    );
  }

  // ── Spam protection: verify the CAPTCHA before doing anything else ──
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  const captchaOk = await verifyCaptcha(String(body.turnstileToken ?? ''), ip);
  if (!captchaOk) {
    return NextResponse.json(
      { success: false, error: 'Captcha verification failed. Please try again.' },
      { status: 400 },
    );
  }

  const subject = `New enquiry from ${name}${company ? ` — ${String(company)}` : ''}`;
  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;color:#111;max-width:640px">
      <h2 style="margin:0 0 4px">New contact enquiry</h2>
      <p style="margin:0 0 16px;color:#666">Submitted via the website contact form.</p>
      <table style="border-collapse:collapse;width:100%;font-size:14px">
        ${row('Name', name)}
        ${row('Email', email)}
        ${row('Phone', phone)}
        ${row('Company', company)}
        ${row('Project type', projectType)}
        ${row('Budget', budget)}
        ${row('Message', message)}
      </table>
      <p style="margin:16px 0 0;color:#999;font-size:12px">Reply directly to this email to respond to ${esc(name)}.</p>
    </div>`;

  const apiKey = process.env.RESEND_API_KEY;

  // No key configured → don't lose the message, but make it obvious in the logs.
  if (!apiKey) {
    console.warn(
      '[contact] RESEND_API_KEY is not set — email was NOT sent. ' +
        'Add it to .env.local to enable delivery. Submission:',
      { name, email, phone, company, budget, projectType, message },
    );
    return NextResponse.json({ success: true, emailed: false });
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM,
        to: [TO],
        reply_to: email, // replying goes straight to the person who wrote in
        subject,
        html,
      }),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      console.error('[contact] Resend API error', res.status, detail);
      return NextResponse.json(
        { success: false, error: 'Could not send your message. Please try again.' },
        { status: 502 },
      );
    }

    return NextResponse.json({ success: true, emailed: true });
  } catch (err) {
    console.error('[contact] send failed', err);
    return NextResponse.json(
      { success: false, error: 'Could not send your message. Please try again.' },
      { status: 502 },
    );
  }
}
