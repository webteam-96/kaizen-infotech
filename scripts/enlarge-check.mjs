import { chromium } from 'playwright-core';
import { mkdirSync } from 'fs';
const OUT = 'audit-shots/enlarge';
mkdirSync(OUT, { recursive: true });

async function shot(label, viewport, touch) {
  const browser = await chromium.launch({ channel: 'chrome', args: ['--use-angle=swiftshader'] });
  const ctx = await browser.newContext({ viewport, hasTouch: !!touch, isMobile: !!touch });
  const page = await ctx.newPage();
  await page.addInitScript(() => sessionStorage.setItem('kaizen-intro-seen', '1'));
  try { await page.goto('http://localhost:3000/', { waitUntil: 'load', timeout: 45000 }); } catch {}
  await page.waitForTimeout(6500);
  const boxes = await page.evaluate(() => {
    const frame = document.querySelector('.rc-spline-float');
    const card = document.querySelector('.rc-hook-card');
    const r = (el) => { if (!el) return null; const b = el.getBoundingClientRect(); return { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height), right: Math.round(b.right), bottom: Math.round(b.bottom) }; };
    return { frame: r(frame), card: r(card), vw: window.innerWidth, vh: window.innerHeight };
  });
  await page.screenshot({ path: `${OUT}/${label}.png` });
  console.log(label, JSON.stringify(boxes));
  await browser.close();
}

await shot('desktop', { width: 1440, height: 900 }, false);
await shot('laptop', { width: 1280, height: 800 }, false);
await shot('mobile', { width: 390, height: 844 }, true);
console.log('done');
