import { NextResponse } from 'next/server';
import svgCaptcha from 'svg-captcha';
import { makeToken } from '@/lib/captcha';

// Generates a fresh distorted captcha. Returns { token, image }:
//  • image — a path-based SVG data-URL. Every character is drawn as vector
//    <path> outlines (never as <text>), so the code can't be scraped from the
//    markup — the same guarantee the old rasterised PNG gave.
//  • token — the opaque HMAC binding (no readable code); verified server-side on
//    submit (see src/lib/captcha.ts + /api/contact).
//
// Pure JS: svg-captcha bundles its own font, so there is NO native image
// dependency and this runs on any serverless runtime, Vercel included. The
// previous version rasterised the SVG with `sharp` (a libvips native module);
// that binary loads on a local Node install but fails on Vercel's serverless
// runtime, which is why the captcha image came back blank/"Unavailable" in
// production. Rendering the SVG directly removes that failure point entirely.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Greyscale palette: dark-grey glyphs on a light-grey field, with muted-grey
// noise lines — high enough contrast to stay readable for people, while a gentle
// baked-in blur softens the edges to trip up OCR bots.
const GLYPH = '#3a3a3a'; // dark-grey characters
const NOISE = '#9a9a9a'; // muted-grey distraction lines
const BG = '#e6e6e6'; // light-grey background
const BLUR = 0.6; // Gaussian blur radius — hazy for bots, legible for humans

// svg-captcha paints glyphs and noise in random colours. Recolour them to the
// greyscale palette and wrap the glyph/noise layer (not the flat background) in
// a Gaussian-blur filter, so the delivered image itself is blurred.
function styleCaptcha(svg: string): string {
  let out = svg
    // glyph <path>s carry a solid colour fill → dark grey. (noise <path>s use
    // fill="none", so they're skipped; the <rect> background is untouched.)
    .replace(/(<path\b[^>]*?)fill="#[0-9a-fA-F]{3,8}"/g, `$1fill="${GLYPH}"`)
    // noise line colours → muted grey.
    .replace(/stroke="#[0-9a-fA-F]{3,8}"/g, `stroke="${NOISE}"`);

  const defs = `<defs><filter id="cap-blur" x="-6%" y="-6%" width="112%" height="112%"><feGaussianBlur stdDeviation="${BLUR}"/></filter></defs>`;
  const rect = out.match(/<rect\b[^>]*\/>/);
  if (rect) {
    out = out
      .replace(/(<svg\b[^>]*?>)/, `$1${defs}`)
      .replace(rect[0], `${rect[0]}<g filter="url(#cap-blur)">`)
      .replace('</svg>', '</g></svg>');
  }
  return out;
}

export async function GET() {
  try {
    const captcha = svgCaptcha.create({
      size: 6,
      // Drop ambiguous glyphs (0/O, 1/l/I) so humans aren't tripped up.
      ignoreChars: '0oO1lI',
      noise: 3,
      color: false,
      background: BG,
      width: 200,
      height: 70,
      fontSize: 54,
    });

    const token = makeToken(captcha.text);
    const svg = styleCaptcha(captcha.data);
    const image = `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;

    return NextResponse.json({ token, image }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (err) {
    // Surface the real cause in the server logs (e.g. a missing bundled font)
    // instead of an opaque 500, and hand the widget a clean JSON error so it can
    // show "Unavailable" rather than choke on an HTML error page.
    console.error('[captcha] generation failed', err);
    return NextResponse.json(
      { token: '', image: '', error: 'captcha_unavailable' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } },
    );
  }
}
