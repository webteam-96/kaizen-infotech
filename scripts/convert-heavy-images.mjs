// One-off: shrink the last heavy raster images that escaped earlier passes.
//  - zfunds / agni-foundation PNGs (blog + projects copies) → WebP q80 siblings
//    (refs repointed in src/content + public/data/blogs.json; old PNGs deleted).
//  - the one remaining 209KB blog-upload JPEG → recompressed IN PLACE (same
//    filename: its ref flows through localizeInlineImages' wp-URL tail mapping,
//    so the extension must not change; identical pixels, ~half the bytes).
// Run: node scripts/convert-heavy-images.mjs
import sharp from 'sharp';
import { rename, stat } from 'node:fs/promises';

const PNGS = [
  'public/images/blog/zfunds.png',
  'public/images/blog/agni-foundation.png',
  'public/images/projects/zfunds.png',
  'public/images/projects/agni-foundation.png',
];
const JPG =
  'public/images/blog/uploads/2025/04/Audit-and-Optimize-Top-10-Best-Practices-for-QA-Testing-That-Deliver-ResultsTools-1024x576.jpg';

const kb = async (p) => Math.round((await stat(p)).size / 1024);

for (const src of PNGS) {
  const dest = src.replace(/\.png$/, '.webp');
  await sharp(src).webp({ quality: 80 }).toFile(dest);
  console.log(`${src} ${await kb(src)}KB -> ${dest} ${await kb(dest)}KB`);
}

const tmp = JPG + '.tmp.jpg';
await sharp(JPG).jpeg({ quality: 72, mozjpeg: true }).toFile(tmp);
const before = await kb(JPG);
await rename(tmp, JPG);
console.log(`${JPG} ${before}KB -> ${await kb(JPG)}KB (in place)`);
