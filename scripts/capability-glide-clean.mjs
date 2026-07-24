import { chromium } from 'playwright-core';
const browser = await chromium.launch({ channel: 'chrome', args: ['--use-angle=swiftshader'] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.addInitScript(() => sessionStorage.setItem('kaizen-intro-seen', '1'));
await page.goto('http://localhost:3000/services', { waitUntil: 'load', timeout: 45000 });
await page.waitForTimeout(1800);
await page.evaluate(() => {
  window.__s = [];
  const el = document.querySelector('.oc-section');
  const rec = () => { window.__s.push({ t: Math.round(performance.now()), y: Math.round(window.scrollY), ov: document.documentElement.style.overflow || '', top: Math.round(el.getBoundingClientRect().top) }); requestAnimationFrame(rec); };
  requestAnimationFrame(rec);
});
await page.mouse.move(720, 450);
// approach until section top is just above the engage line (~450), WITHOUT engaging
for (let i=0;i<50;i++){
  const top = await page.evaluate(()=>Math.round(document.querySelector('.oc-section').getBoundingClientRect().top));
  if (top <= 560) break;
  await page.mouse.wheel(0, 180); await page.waitForTimeout(110);
}
// one decisive nudge to cross the engage line, then STOP and let it settle
await page.evaluate(()=>{ window.__nudge = performance.now(); });
await page.mouse.wheel(0, 320);
await page.waitForTimeout(2200); // no more input — glide should settle on its own
const r = await page.evaluate(() => {
  const s = window.__s, nudge = window.__nudge;
  const lockI = s.findIndex(x => x.ov === 'hidden');
  const engageI = s.findIndex(x => x.top <= 450);
  return {
    engageT: engageI>=0 ? s[engageI].t : null,
    lockT: lockI>=0 ? s[lockI].t : null,
    finalTop: lockI>=0 ? s[lockI].top : null,
    win: (lockI>=0 ? s.slice(Math.max(0,engageI), lockI+2) : s.slice(-20)),
  };
});
console.log('engage→lock samples (t / y / ov / rectTop):');
for (const x of r.win) console.log(`  t=${x.t} y=${x.y} ov='${x.ov}' top=${x.top}`);
console.log(`\nglide duration engage→lock: ${r.lockT!=null && r.engageT!=null ? r.lockT - r.engageT : '??'}ms (target ~620ms)`);
console.log(`locked at rectTop=${r.finalTop} (expect 0 → perfectly aligned)`);
await browser.close();
