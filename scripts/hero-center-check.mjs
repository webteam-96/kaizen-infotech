import { chromium } from 'playwright-core';
const browser = await chromium.launch({ channel: 'chrome', args: ['--use-angle=swiftshader'] });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await ctx.newPage();
await page.addInitScript(() => sessionStorage.setItem('kaizen-intro-seen', '1'));
const log = (...a) => console.log(...a);

const pages = ['/about', '/services', '/work', '/blog', '/careers', '/contact'];
let allOk = true;

for (const p of pages) {
  try {
    await page.goto(`http://localhost:3000${p}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(1600);
    const m = await page.evaluate(() => {
      const h1 = document.querySelector('main h1') || document.querySelector('h1');
      if (!h1) return null;
      const r = h1.getBoundingClientRect();
      const vw = window.innerWidth;
      const container = h1.parentElement;
      return {
        h1Center: Math.round(r.left + r.width / 2),
        vwCenter: Math.round(vw / 2),
        textAlign: getComputedStyle(container).textAlign,
        title: h1.textContent.trim().slice(0, 30),
      };
    });
    if (!m) { log(`${p.padEnd(10)} — no h1`); allOk = false; continue; }
    const off = Math.abs(m.h1Center - m.vwCenter);
    const centered = off < 40 && m.textAlign === 'center';
    if (!centered) allOk = false;
    log(`${p.padEnd(10)} h1Center=${m.h1Center} vwCenter=${m.vwCenter} off=${off}px textAlign=${m.textAlign} → ${centered ? 'CENTERED ✓' : 'LEFT ✗'}`);
  } catch (err) {
    log(`${p.padEnd(10)} ERROR: ${err.message}`);
    allOk = false;
  }
}
log(allOk ? 'RESULT: ALL CENTERED ✓' : 'RESULT: CHECK ✗');
await browser.close();
log('done');
