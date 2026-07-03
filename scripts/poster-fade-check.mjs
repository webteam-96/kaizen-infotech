import { chromium } from 'playwright-core';
import { mkdirSync } from 'fs';
const OUT = 'audit-shots/poster';
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ channel: 'chrome', args: ['--use-angle=swiftshader'] });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const page = await ctx.newPage();
await page.addInitScript(() => sessionStorage.setItem('kaizen-intro-seen', '1'));
try { await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded', timeout: 45000 }); } catch {}

// Early: poster should be visible (opacity ~1) before the 3D scene loads.
await page.waitForTimeout(900);
const early = await page.evaluate(() => {
  const img = document.querySelector('img[src*="spline-monitor-poster"]');
  if (!img) return { found: false };
  const cs = getComputedStyle(img);
  return { found: true, opacity: cs.opacity, filter: cs.filter, w: Math.round(img.getBoundingClientRect().width) };
});
await page.screenshot({ path: `${OUT}/01-early.png` });

// Settled: after the scene loads, poster should have faded to ~0.
await page.waitForTimeout(8000);
const settled = await page.evaluate(() => {
  const img = document.querySelector('img[src*="spline-monitor-poster"]');
  const cs = img ? getComputedStyle(img) : null;
  return { opacity: cs?.opacity };
});
await page.screenshot({ path: `${OUT}/02-settled.png` });

console.log(JSON.stringify({ early, settled }, null, 2));
await browser.close();
console.log('done');
