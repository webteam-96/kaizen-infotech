import { chromium } from 'playwright-core';
import { mkdirSync } from 'fs';
const OUT = 'audit-shots/crt';
mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', args: ['--use-angle=swiftshader'] });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const page = await ctx.newPage();
await page.addInitScript(() => sessionStorage.setItem('kaizen-intro-seen', '1'));
try { await page.goto('http://localhost:3000/', { waitUntil: 'load', timeout: 45000 }); } catch {}
await page.waitForTimeout(5000);
const info = await page.evaluate(() => {
  const el = document.querySelector('.rc-crt-screen');
  const line = document.querySelector('.rc-crt-line');
  const frame = document.querySelector('.rc-spline-float');
  const r = el ? el.getBoundingClientRect() : null;
  const fr = frame ? frame.getBoundingClientRect() : null;
  const cs = line ? getComputedStyle(line) : null;
  return {
    crt: r ? { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) } : null,
    frame: fr ? { x: Math.round(fr.x), y: Math.round(fr.y), w: Math.round(fr.width), h: Math.round(fr.height) } : null,
    line: cs ? { opacity: cs.opacity, color: cs.color, fontSize: cs.fontSize, visible: line.offsetParent !== null } : null,
    text: line ? line.textContent.trim().slice(0, 40) : null,
  };
});
console.log(JSON.stringify(info, null, 2));
// Close-up of the monitor frame area
if (info.frame) {
  const f = info.frame;
  await page.screenshot({ path: `${OUT}/monitor-closeup.png`, clip: { x: Math.max(0, f.x), y: Math.max(0, f.y), width: Math.min(1280 - Math.max(0, f.x), f.w), height: Math.min(800 - Math.max(0, f.y), f.h) } });
}
await browser.close();
console.log('done');
