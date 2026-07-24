import { chromium } from 'playwright-core';
import { mkdirSync } from 'fs';
const OUT = 'audit-shots/capability-bg';
mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', args: ['--use-angle=swiftshader'] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.addInitScript(() => sessionStorage.setItem('kaizen-intro-seen', '1'));
await page.goto('http://localhost:3000/services', { waitUntil: 'load', timeout: 45000 });
await page.waitForTimeout(1800);
await page.mouse.move(720, 450);
let engaged = false;
for (let i=0;i<40;i++){ await page.mouse.wheel(0,400); await page.waitForTimeout(150); if (await page.evaluate(()=>document.documentElement.style.overflow==='hidden')){engaged=true;break;} }
console.log('engaged:', engaged, 'scrollY:', await page.evaluate(()=>Math.round(window.scrollY)));
const active = () => page.evaluate(()=>[...document.querySelectorAll('.oc-dot')].findIndex(d=>d.classList.contains('on')));
const names = ['software','mobile','events','portals','marketing'];
const y0 = await page.evaluate(()=>Math.round(window.scrollY));
for (let i=0;i<5;i++){
  // ensure we're on card i
  let a = await active();
  await page.waitForTimeout(1300); // let scene animate a beat
  await page.screenshot({ path: `${OUT}/min-0${i+1}-${names[i]}.png` });
  const drift = Math.abs((await page.evaluate(()=>Math.round(window.scrollY))) - y0);
  console.log(`card ${i} (${names[i]}) active=${a} pinDrift=${drift}px`);
  if (i<4){
    await page.waitForTimeout(2100); // clear the 2s hold
    await page.evaluate(()=>window.dispatchEvent(new WheelEvent('wheel',{deltaY:320,cancelable:true})));
    // wait until advanced
    for (let k=0;k<20;k++){ if ((await active())===i+1) break; await page.waitForTimeout(80); }
  }
}
await browser.close();
console.log('done');
