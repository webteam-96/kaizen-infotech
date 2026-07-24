import { chromium } from 'playwright-core';
import { mkdirSync } from 'fs';
const OUT = 'audit-shots/capability-bg';
mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', args: ['--use-angle=swiftshader'] });
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
const page = await ctx.newPage();
await page.addInitScript(() => sessionStorage.setItem('kaizen-intro-seen', '1'));
try { await page.goto('http://localhost:3000/services', { waitUntil: 'load', timeout: 45000 }); } catch {}
await page.waitForTimeout(2000);
const geom = await page.evaluate(() => { const s = document.querySelector('.oc-section'); if (!s) return null; const top = window.scrollY + s.getBoundingClientRect().top; return { top, h: s.offsetHeight, vh: window.innerHeight }; });
if (!geom) { console.log('no section'); await browser.close(); process.exit(1); }
await page.evaluate((y) => window.scrollTo(0, y), geom.top + 0.25 * (geom.h - geom.vh));
await page.waitForTimeout(1200);
for (const [i, name] of [[0,'m-01-software'],[1,'m-02-mobile']]) {
  await page.locator('.oc-dot').nth(i).click({ force: true });
  await page.waitForTimeout(1300);
  await page.screenshot({ path: `${OUT}/${name}.png` });
}
await browser.close(); console.log('mobile done');
