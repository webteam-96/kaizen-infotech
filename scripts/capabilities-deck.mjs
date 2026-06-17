import { chromium } from 'playwright-core';
import { mkdirSync } from 'fs';
const OUT = 'audit-shots/capabilities';
mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', args: ['--use-angle=swiftshader'] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.addInitScript(() => sessionStorage.setItem('kaizen-intro-seen', '1'));
try { await page.goto('http://localhost:3000/services', { waitUntil: 'load', timeout: 45000 }); } catch {}
await page.waitForTimeout(2500);
const geom = await page.evaluate(() => {
  const d = document.querySelector('div[style*="600vh"]');
  if (!d) return null;
  const top = window.scrollY + d.getBoundingClientRect().top;
  return { top, h: d.offsetHeight, vh: window.innerHeight };
});
if (!geom) { console.log('deck container not found'); await browser.close(); process.exit(1); }
const labels = [['stack', 0.12], ['row1', 0.66], ['transition', 0.84], ['row2', 0.99]];
for (const [name, frac] of labels) {
  const y = geom.top + frac * (geom.h - geom.vh);
  await page.evaluate((yy) => window.scrollTo(0, yy), y);
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${OUT}/${name}.png` });
  const info = await page.evaluate(() => {
    const c = document.querySelector('div[style*="600vh"] .flex.flex-col.rounded-\\[var\\(--radius-xl\\)\\]');
    if (!c) return null;
    const r = c.getBoundingClientRect();
    const t = c.querySelector('h3');
    const p = c.querySelector('p');
    return { cardW: Math.round(r.width), cardH: Math.round(r.height),
      title: t && getComputedStyle(t).fontSize, desc: p && getComputedStyle(p).fontSize };
  });
  console.log(`${name} ->`, JSON.stringify(info));
}
await browser.close();
console.log('done');
