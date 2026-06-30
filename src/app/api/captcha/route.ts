import { NextResponse } from 'next/server';
import sharp from 'sharp';
import { generateCode, makeToken } from '@/lib/captcha';

// Generates a fresh distorted captcha. Returns { token, image } where image is a
// rasterised PNG data-URL (the code lives only in pixels, never as text) and
// token is the opaque HMAC binding (no readable code). Node runtime for sharp.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const W = 200;
const H = 70;
// Greyscale glyphs — subtle shade variation, no bright/rainbow colours. Mid-grey
// so they stay readable on the light background after the blur.
const COLORS = ['#5e646e', '#6b7280', '#777e8a', '#646b76', '#70767f'];

const rnd = (min: number, max: number) => min + Math.random() * (max - min);
const pick = <T>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function buildSvg(code: string): string {
  const chars = code.split('');
  const slot = (W - 36) / chars.length;

  const glyphs = chars
    .map((ch, i) => {
      const x = 22 + i * slot + rnd(-3, 3);
      const y = 46 + rnd(-6, 6);
      const rot = rnd(-22, 22);
      const fs = rnd(31, 40);
      return `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" font-family="Arial, 'DejaVu Sans', 'Liberation Sans', sans-serif" font-size="${fs.toFixed(1)}" font-weight="700" fill="${pick(COLORS)}" transform="rotate(${rot.toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)})">${esc(ch)}</text>`;
    })
    .join('');

  let lines = '';
  for (let i = 0; i < 5; i++) {
    const x1 = rnd(0, W), y1 = rnd(0, H), x2 = rnd(0, W), y2 = rnd(0, H);
    lines += `<path d="M${x1.toFixed(0)} ${y1.toFixed(0)} Q ${rnd(0, W).toFixed(0)} ${rnd(0, H).toFixed(0)} ${x2.toFixed(0)} ${y2.toFixed(0)}" stroke="rgba(120,126,136,0.32)" stroke-width="1.3" fill="none"/>`;
  }
  let dots = '';
  for (let i = 0; i < 45; i++) {
    dots += `<circle cx="${rnd(0, W).toFixed(0)}" cy="${rnd(0, H).toFixed(0)}" r="${rnd(0.6, 1.4).toFixed(1)}" fill="rgba(110,116,126,0.22)"/>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`
    + `<rect width="100%" height="100%" rx="8" fill="#eef3f9"/>`
    + lines + dots + glyphs
    + `</svg>`;
}

export async function GET() {
  const code = generateCode(6);
  const token = makeToken(code);
  const svg = buildSvg(code);

  // Gentle blur — enough to hinder OCR bots while staying readable for people.
  const png = await sharp(Buffer.from(svg)).blur(0.8).png().toBuffer();
  const image = `data:image/png;base64,${png.toString('base64')}`;

  return NextResponse.json({ token, image }, { headers: { 'Cache-Control': 'no-store' } });
}
