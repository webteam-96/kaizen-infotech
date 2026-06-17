import { chromium } from 'playwright-core';
import { mkdirSync } from 'fs';
const OUT = 'audit-shots/hero-intro';
mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', args: ['--use-angle=swiftshader'] });
const W = 390, H = 844;
const ctx = await browser.newContext({ viewport: { width: W, height: H } });
const page = await ctx.newPage();
await page.addInitScript(() => sessionStorage.setItem('kaizen-intro-seen', '1'));
try { await page.goto('http://localhost:3000/', { waitUntil: 'load', timeout: 45000 }); } catch {}
await page.waitForTimeout(5000);
// The intro spacer drives the dive. Scroll through it in steps to watch the
// cube emerge from the (now larger / higher) CRT screen.
const total = await page.evaluate(() => document.body.scrollHeight - window.innerHeight);
for (const frac of [0.0, 0.05, 0.10, 0.16, 0.24]) {
  await page.evaluate((y) => window.scrollTo(0, y), Math.round(total * frac));
  await page.waitForTimeout(1400);
  await page.screenshot({ path: `${OUT}/dive-${Math.round(frac * 100)}.png` });
  console.log(`dive ${frac}`);
}
await browser.close();
console.log('done');
