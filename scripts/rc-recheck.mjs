import { chromium } from 'playwright-core';

const BASE = 'http://localhost:3000';
const OUT = 'audit-shots/rc-responsive';
const browser = await chromium.launch({ channel: 'chrome', args: ['--use-angle=swiftshader'] });

for (const w of [768, 1024]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 800 } });
  const page = await ctx.newPage();
  await page.addInitScript(() => sessionStorage.setItem('kaizen-intro-seen', '1'));
  try { await page.goto(BASE + '/', { waitUntil: 'load', timeout: 45000 }); } catch {}
  await page.waitForTimeout(2000);
  // Nudge the scroll-driven intro timeline so the hook card reveals.
  await page.evaluate(() => window.scrollTo(0, 40));
  await page.waitForTimeout(800);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(2500);
  await page.screenshot({ path: `${OUT}/hero-${w}-retry.png` });
  // Report the hook card's box so we can see if it's centered/visible.
  const box = await page.evaluate(() => {
    const c = document.querySelector('.rc-hook-card');
    if (!c) return 'no card';
    const r = c.getBoundingClientRect();
    return { left: Math.round(r.left), right: Math.round(r.right), width: Math.round(r.width), top: Math.round(r.top), opacity: getComputedStyle(c).opacity };
  });
  console.log(`${w}px hook-card:`, JSON.stringify(box));
  await ctx.close();
}
await browser.close();
console.log('done');
