import { chromium } from 'playwright-core';
const browser = await chromium.launch({ channel: 'chrome', args: ['--use-angle=swiftshader'] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.addInitScript(() => sessionStorage.setItem('kaizen-intro-seen', '1'));
await page.goto('http://localhost:3000/services', { waitUntil: 'load', timeout: 45000 });
await page.waitForTimeout(1800);
await page.mouse.move(720, 450);
// engage
let engaged = false;
for (let i=0;i<40;i++){ await page.mouse.wheel(0,400); await page.waitForTimeout(150); if (await page.evaluate(()=>document.documentElement.style.overflow==='hidden')){engaged=true;break;} }
console.log('engaged:', engaged);

const r = await page.evaluate(async () => {
  const sleep = (ms) => new Promise(res => setTimeout(res, ms));
  const dot = () => [...document.querySelectorAll('.oc-dot')].findIndex(d => d.classList.contains('on'));
  const wheel = (dy) => window.dispatchEvent(new WheelEvent('wheel', { deltaY: dy, cancelable: true, bubbles: true }));
  const tE = performance.now();
  const a0 = dot();
  // FAST FLICK immediately (within card 0's hold): 12 rapid wheels, no wait
  for (let k=0;k<12;k++) wheel(320);
  const aFlick = dot();
  const tFlick = Math.round(performance.now() - tE);
  // continuous forward scroll, sample active changes for 11s
  const changes = [{ a: dot(), t: Math.round(performance.now()-tE) }];
  let last = dot();
  const startY = window.scrollY;
  let maxYDrift = 0;
  while (performance.now() - tE < 11000) {
    wheel(200);
    maxYDrift = Math.max(maxYDrift, Math.abs(window.scrollY - startY));
    const a = dot();
    if (a !== last) { changes.push({ a, t: Math.round(performance.now()-tE) }); last = a; }
    await sleep(50);
  }
  return { a0, aFlick, tFlick, changes, engagedEnd: document.documentElement.style.overflow==='hidden', maxYDrift };
});
console.log('a0 (expect 0):', r.a0);
console.log(`aFlick after 12 rapid wheels at t=${r.tFlick}ms (expect still 0 — inside 2s hold):`, r.aFlick);
console.log('pin drift during sequence (px, expect 0):', r.maxYDrift);
console.log('card-change timeline:');
let prev = 0;
for (const c of r.changes) { console.log(`  card ${c.a} @ ${c.t}ms  (prev held ${c.t - prev}ms)`); prev = c.t; }
console.log('still engaged at end:', r.engagedEnd);
await browser.close();
