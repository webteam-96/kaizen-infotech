import { chromium } from 'playwright-core';
import { mkdirSync } from 'fs';

const BASE = 'http://localhost:3000';
const OUT = 'audit-shots';
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ args: ['--use-angle=swiftshader'] });
const ctx = await browser.newContext({
  viewport: { width: 768, height: 1024 },
  hasTouch: true,
  isMobile: false,
});
const page = await ctx.newPage();
await page.addInitScript(() => sessionStorage.setItem('kaizen-intro-seen', '1'));

try {
  await page.goto(BASE + '/blog', { waitUntil: 'networkidle', timeout: 45000 });
} catch {}
await page.waitForTimeout(2500);
await page.evaluate(() => window.scrollTo(0, 870));
await page.waitForTimeout(1800);

const info = await page.evaluate(() => {
  const card = document.querySelector('a.group.mb-12.block');
  if (!card) return { err: 'featured card not found' };
  const coverDiv = card.querySelector('div.grid > div');
  const img = coverDiv ? coverDiv.querySelector('img, [class*="cover"], svg, canvas, div') : null;
  const r = (el) => {
    if (!el) return null;
    const b = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    return {
      tag: el.tagName,
      cls: (el.className && el.className.baseVal !== undefined ? el.className.baseVal : el.className) || '',
      rect: { w: Math.round(b.width), h: Math.round(b.height) },
      position: cs.position,
      objectFit: cs.objectFit,
      bg: cs.backgroundColor,
    };
  };
  return { coverDiv: r(coverDiv), img: r(img) };
});
console.log(JSON.stringify(info, null, 2));

await page.screenshot({ path: `${OUT}/verify-blog-featured-768.png` });
await browser.close();
console.log('done');
