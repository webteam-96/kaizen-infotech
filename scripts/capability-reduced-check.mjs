import { chromium } from 'playwright-core';
const browser = await chromium.launch({ channel: 'chrome', args: ['--use-angle=swiftshader'] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
const page = await ctx.newPage();
await page.addInitScript(() => sessionStorage.setItem('kaizen-intro-seen', '1'));
await page.goto('http://localhost:3000/services', { waitUntil: 'load', timeout: 45000 });
await page.waitForTimeout(1500);
const h = await page.evaluate(() => ({ inline: document.querySelector('.oc-section')?.style.height, sh: Math.round(document.querySelector('.oc-section')?.offsetHeight) }));
console.log('reduced section height:', JSON.stringify(h), '(expect ~260vh, no lock)');
const geom = await page.evaluate(() => { const s = document.querySelector('.oc-section'); return { top: Math.round(window.scrollY + s.getBoundingClientRect().top), h: s.offsetHeight, vh: window.innerHeight }; });
const travel = geom.h - geom.vh;
const seen = new Set();
for (const f of [0.05, 0.25, 0.45, 0.65, 0.9]) {
  await page.evaluate((y)=>window.scrollTo(0,y), geom.top + f*travel);
  await page.waitForTimeout(400);
  const s = await page.evaluate(()=>({ a: [...document.querySelectorAll('.oc-dot')].findIndex(d=>d.classList.contains('on')), ov: document.documentElement.style.overflow }));
  seen.add(s.a);
  console.log(`progress ${f} -> active ${s.a}, overflow='${s.ov}' (expect never 'hidden')`);
}
console.log('distinct cards reachable by scroll (reduced):', [...seen].sort().join(','));
await browser.close();
