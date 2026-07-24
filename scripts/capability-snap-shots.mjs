import { chromium } from 'playwright-core';
const OUT = 'audit-shots/capability-bg';
const browser = await chromium.launch({ channel: 'chrome', args: ['--use-angle=swiftshader'] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.addInitScript(() => sessionStorage.setItem('kaizen-intro-seen', '1'));
try { await page.goto('http://localhost:3000/services', { waitUntil: 'load', timeout: 45000 }); } catch {}
await page.waitForTimeout(2000);
const geom = await page.evaluate(() => { const s = document.querySelector('.oc-section'); const top = window.scrollY + s.getBoundingClientRect().top; return { top, h: s.offsetHeight, vh: window.innerHeight }; });
const travel = geom.h - geom.vh;
const shots = [['hold-card0', 0.09], ['transition-0to1', 0.188], ['hold-card2', 0.5]];
for (const [name, p] of shots) {
  await page.evaluate((y) => window.scrollTo(0, y), geom.top + p * travel);
  await page.waitForTimeout(900);
  await page.screenshot({ path: `${OUT}/snap-${name}.png` });
}
await browser.close(); console.log('snap shots done');
