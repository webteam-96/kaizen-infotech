import { chromium } from 'playwright-core';
import { mkdirSync } from 'fs';
const OUT = 'audit-shots/process-horizontal';
mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', args: ['--use-angle=swiftshader', '--autoplay-policy=no-user-gesture-required'] });
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
const page = await ctx.newPage();
await page.addInitScript(() => sessionStorage.setItem('kaizen-intro-seen', '1'));
try { await page.goto('http://localhost:3000/', { waitUntil: 'networkidle', timeout: 60000 }); } catch {}
await page.waitForTimeout(2000);

const info = await page.evaluate(() => {
  const sec = document.querySelector('[data-section-index="5"]');
  const track = sec.querySelector('div.flex.h-full');
  return { secTop: Math.round(sec.getBoundingClientRect().top + window.scrollY), travel: Math.max(1, track.scrollWidth - window.innerWidth) };
});

// Smooth incremental scroll using small wheel steps (Lenis-friendly), sampling trackX.
await page.evaluate((y) => window.scrollTo(0, y), info.secTop);
await page.waitForTimeout(400);
const readX = () => page.evaluate(() => {
  const t = document.querySelector('[data-section-index="5"] div.flex.h-full');
  return Math.round(new DOMMatrixReadOnly(getComputedStyle(t).transform).m41);
});

const curve = [];
let shot = 0;
for (let i = 0; i <= 12; i++) {
  const y = info.secTop + (info.travel * i) / 12;
  await page.evaluate((yy) => window.scrollTo(0, yy), y);
  await page.waitForTimeout(300);
  const x = await readX();
  curve.push({ step: i, x });
  if (i === 2 || i === 6 || i === 10) {
    await page.screenshot({ path: `${OUT}/step-${String(shot++)}-i${i}.png` });
  }
}
console.log('travel', info.travel);
console.log(JSON.stringify(curve));
await browser.close();
console.log('done');
