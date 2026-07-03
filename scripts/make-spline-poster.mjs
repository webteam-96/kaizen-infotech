import { chromium } from 'playwright-core';
import { mkdirSync } from 'fs';
mkdirSync('public/images/hero', { recursive: true });

const browser = await chromium.launch({ channel: 'chrome', args: ['--use-angle=swiftshader'] });
// Large viewport + DPR 2 so the captured frame is high-res; it's blurred in use
// anyway, but a crisp source keeps the monitor edges clean when scaled.
const ctx = await browser.newContext({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 2 });
const page = await ctx.newPage();
await page.addInitScript(() => sessionStorage.setItem('kaizen-intro-seen', '1'));
try { await page.goto('http://localhost:3000/', { waitUntil: 'load', timeout: 45000 }); } catch {}
// Let the heavy 3D scene fully paint at rest before grabbing the poster.
await page.waitForTimeout(9000);
// Freeze the gentle float so the element is stable for screenshotting.
await page.addStyleTag({ content: '.rc-spline-float{animation:none !important;transform:none !important;}' });
await page.waitForTimeout(400);

const frame = await page.$('.rc-spline-float');
if (!frame) { console.log('NO FRAME'); await browser.close(); process.exit(1); }
// JPEG: the frame background is opaque (#f5f5f5), no transparency needed, and
// JPEG keeps the poster small. Blur in CSS hides any compression softness.
await frame.screenshot({ path: 'public/images/hero/spline-monitor-poster.jpg', type: 'jpeg', quality: 78, animations: 'disabled' });
const box = await frame.boundingBox();
console.log('captured', JSON.stringify(box));
await browser.close();
console.log('done');
