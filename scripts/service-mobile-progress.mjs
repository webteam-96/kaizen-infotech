import { chromium } from 'playwright-core';
import { mkdirSync } from 'fs';
const OUT = 'audit-shots/service-mobile';
mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', args: ['--use-angle=swiftshader'] });
const W = 390;
const ctx = await browser.newContext({ viewport: { width: W, height: 844 } });
const page = await ctx.newPage();
await page.addInitScript(() => sessionStorage.setItem('kaizen-intro-seen', '1'));
try { await page.goto('http://localhost:3000/', { waitUntil: 'load', timeout: 45000 }); } catch {}
await page.waitForTimeout(2500);
const geom = await page.evaluate(() => {
  const sec = document.querySelector('[data-section-index="2"] section');
  return { top: window.scrollY + sec.getBoundingClientRect().top, H: sec.offsetHeight };
});
// popup, spread, spotlight-mid, spotlight-late, fade
for (const p of [0.05, 0.20, 0.45, 0.68, 0.88]) {
  await page.evaluate((y) => window.scrollTo(0, y), geom.top + geom.H * p);
  await page.waitForTimeout(1300);
  const active = await page.evaluate(() => {
    const c = document.querySelector('[data-section-index="2"] section span[style*="mono"]');
    const counter = document.querySelectorAll('[data-section-index="2"] section span');
    return document.querySelector('.deck-card') ? 'ok' : 'no';
  });
  await page.screenshot({ path: `${OUT}/prog-${W}-${Math.round(p * 100)}.png` });
  console.log(`p=${p} -> ${active}`);
}
await browser.close();
console.log('done');
