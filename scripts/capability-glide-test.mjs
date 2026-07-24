import { chromium } from 'playwright-core';
const browser = await chromium.launch({ channel: 'chrome', args: ['--use-angle=swiftshader'] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.addInitScript(() => sessionStorage.setItem('kaizen-intro-seen', '1'));
await page.goto('http://localhost:3000/services', { waitUntil: 'load', timeout: 45000 });
await page.waitForTimeout(1800);
// install a per-frame sampler
await page.evaluate(() => {
  window.__s = [];
  const el = document.querySelector('.oc-section');
  const rec = () => { window.__s.push({ t: Math.round(performance.now()), y: Math.round(window.scrollY), ov: document.documentElement.style.overflow || '', top: Math.round(el.getBoundingClientRect().top) }); requestAnimationFrame(rec); };
  requestAnimationFrame(rec);
});
await page.mouse.move(720, 450);
// approach the section slowly
let locked = false;
for (let i=0;i<50;i++){ await page.mouse.wheel(0, 260); await page.waitForTimeout(90); if (await page.evaluate(()=>document.documentElement.style.overflow==='hidden')){ locked=true; break; } }
await page.waitForTimeout(200);
const r = await page.evaluate(() => {
  const s = window.__s;
  const lockI = s.findIndex(x => x.ov === 'hidden');
  const win = lockI < 0 ? s.slice(-40) : s.slice(Math.max(0, lockI - 30), lockI + 3);
  return { lockI, lockedAt: lockI>=0 ? s[lockI].t : null, win, total: s.length };
});
if (r.lockI < 0) { console.log('never locked'); await browser.close(); process.exit(1); }
console.log('samples around engage→glide→lock (t / scrollY / overflow / rectTop):');
let firstGlide = null;
for (const x of r.win) {
  const mark = x.ov === 'hidden' ? '  <== LOCK' : (x.top <= 450 && firstGlide===null ? (firstGlide=x.t, '  <== engage (rectTop<=450)') : '');
  console.log(`  t=${x.t}  y=${x.y}  ov='${x.ov}'  top=${x.top}${mark}`);
}
const glideMs = firstGlide!=null ? r.lockedAt - firstGlide : null;
console.log(`glide duration (engage→lock): ${glideMs}ms  (expect ~620ms smooth ramp, NOT ~0/instant)`);
await browser.close();
