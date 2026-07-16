// Generate the social-share (Open Graph / Twitter) card + PWA icons from the
// brand logo. Run once, commit the PNGs:  node scripts/make-og-image.mjs
//
// Outputs:
//   public/images/og/og-default.png       1200x630  (og:image / twitter:image)
//   public/images/icons/icon-192.png       192x192  (manifest)
//   public/images/icons/icon-512.png       512x512  (manifest)
//   public/images/icons/icon-maskable-512.png  512x512 padded (manifest maskable)
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const logoPath = path.join(root, 'public/images/logos/kaizen-logo.png');
const ogDir = path.join(root, 'public/images/og');
const iconDir = path.join(root, 'public/images/icons');

const BLUE = '#1B96D4';
const DARK = '#0f2233';
const GREY = '#5b6b7a';

// --- 1. Open Graph card (1200x630) -----------------------------------------
async function buildOg() {
  await mkdir(ogDir, { recursive: true });

  const W = 1200;
  const H = 630;
  const logoW = 560;
  const meta = await sharp(logoPath).metadata();
  const logoH = Math.round(logoW * (meta.height / meta.width));
  const logoLeft = Math.round((W - logoW) / 2);
  const logoTop = 118;

  const bg = Buffer.from(`
    <svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
      <defs>
        <linearGradient id="wash" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#ffffff"/>
          <stop offset="1" stop-color="#eef7fc"/>
        </linearGradient>
        <radialGradient id="glow" cx="0.85" cy="0.12" r="0.5">
          <stop offset="0" stop-color="${BLUE}" stop-opacity="0.16"/>
          <stop offset="1" stop-color="${BLUE}" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="${W}" height="${H}" fill="url(#wash)"/>
      <rect width="${W}" height="${H}" fill="url(#glow)"/>
      <!-- faint hex motif nod to the site's HexGridBackground -->
      <g fill="none" stroke="${BLUE}" stroke-opacity="0.10" stroke-width="2">
        <polygon points="120,470 156,491 156,533 120,554 84,533 84,491"/>
        <polygon points="188,510 224,531 224,573 188,594 152,573 152,531"/>
        <polygon points="1080,86 1116,107 1116,149 1080,170 1044,149 1044,107"/>
      </g>
      <!-- accent underline -->
      <rect x="${W / 2 - 70}" y="498" width="140" height="6" rx="3" fill="${BLUE}"/>
      <text x="${W / 2}" y="548" text-anchor="middle"
            font-family="Arial, Helvetica, sans-serif" font-size="34" font-weight="600" fill="${DARK}">
        Custom Software · Mobile Apps · Digital Solutions
      </text>
      <text x="${W / 2}" y="592" text-anchor="middle"
            font-family="Arial, Helvetica, sans-serif" font-size="24" letter-spacing="1" fill="${GREY}">
        kaizeninfotech.com
      </text>
    </svg>`);

  const logo = await sharp(logoPath).resize({ width: logoW }).png().toBuffer();

  await sharp(bg)
    .composite([{ input: logo, top: logoTop, left: logoLeft }])
    .png()
    .toFile(path.join(ogDir, 'og-default.png'));
  console.log('  og-default.png (1200x630)');
}

// --- 2. Square PWA icons ----------------------------------------------------
async function buildIcon(size, pad) {
  const inner = size - pad * 2;
  const logo = await sharp(logoPath)
    .resize({ width: inner, height: inner, fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .toBuffer();
  return sharp({
    create: { width: size, height: size, channels: 4, background: { r: 255, g: 255, b: 255, alpha: 1 } },
  })
    .composite([{ input: logo, gravity: 'center' }])
    .png()
    .toBuffer();
}

async function buildIcons() {
  await mkdir(iconDir, { recursive: true });
  await sharp(await buildIcon(192, 16)).toFile(path.join(iconDir, 'icon-192.png'));
  await sharp(await buildIcon(512, 40)).toFile(path.join(iconDir, 'icon-512.png'));
  // Maskable needs the logo inside the ~80% safe zone (extra padding).
  await sharp(await buildIcon(512, 96)).toFile(path.join(iconDir, 'icon-maskable-512.png'));
  console.log('  icon-192.png, icon-512.png, icon-maskable-512.png');
}

console.log('Generating brand social + PWA assets…');
await buildOg();
await buildIcons();
console.log('Done.');
