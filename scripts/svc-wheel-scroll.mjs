import { chromium } from 'playwright-core';
import { mkdirSync } from 'fs';
const OUT = 'audit-shots/svc-cards-look';
mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', args: ['--use-angle=swiftshader'] });
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
const page = await ctx.newPage();
await page.addInitScript(() => sessionStorage.setItem('kaizen-intro-seen', '1'));
try { await page.goto('http://localhost:3000/', { waitUntil: 'load', timeout: 45000 }); } catch {}
await page.waitForTimeout(2500);
// Real wheel scrolling so Lenis + ScrollTrigger update naturally.
await page.mouse.move(195, 400);
for (let i = 0; i < 60; i++) { await page.mouse.wheel(0, 500); await page.waitForTimeout(60); }
await page.waitForTimeout(1500);
const data = await page.evaluate(() => {
  const cards = Array.from(document.querySelectorAll('.deck-card'));
  const vx = window.innerWidth / 2;
  return cards.map((c) => {
    const r = c.getBoundingClientRect();
    const m = new DOMMatrix(getComputedStyle(c).transform);
    return { w: Math.round(r.width), cxOff: Math.round(r.left + r.width/2 - vx), scale: m.a.toFixed(2), op: getComputedStyle(c).opacity.slice(0,4) };
  });
});
console.log('after wheel scroll:', JSON.stringify(data));
await page.screenshot({ path: `${OUT}/phone-wheel.png` });
await browser.close();
