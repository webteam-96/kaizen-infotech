import { chromium } from 'playwright-core';
import { mkdirSync } from 'fs';
const OUT = 'audit-shots/rc-current';
mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', args: ['--use-angle=swiftshader'] });
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
const page = await ctx.newPage();
await page.addInitScript(() => sessionStorage.setItem('kaizen-intro-seen', '1'));
try { await page.goto('http://localhost:3000/', { waitUntil: 'load', timeout: 45000 }); } catch {}
await page.waitForTimeout(6000);
await page.screenshot({ path: `${OUT}/intro-390.png` });
// report computed styles for spline wrapper, its fit div, and the cube canvas
const info = await page.evaluate(() => {
  const sp = document.querySelector('.fixed.inset-y-0.right-0.z-0');
  const fit = sp ? sp.firstElementChild : null;
  const cube = document.querySelector('.fixed.inset-0.z-\\[1\\]');
  const cs = (el) => el ? getComputedStyle(el) : null;
  const s = cs(sp), f = cs(fit), c = cs(cube);
  return {
    spline: s && { opacity: s.opacity, transform: s.transform, width: s.width, padL: s.paddingLeft, pe: s.pointerEvents },
    fit: f && { transform: f.transform, origin: f.transformOrigin },
    cubeCanvas: c && { opacity: c.opacity, transform: c.transform },
  };
});
console.log(JSON.stringify(info, null, 2));
await browser.close();
console.log('done');
