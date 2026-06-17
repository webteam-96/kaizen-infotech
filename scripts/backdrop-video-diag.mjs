import { chromium } from 'playwright-core';
import { mkdirSync } from 'fs';
const OUT = 'audit-shots/backdrop';
mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', args: ['--use-angle=swiftshader', '--autoplay-policy=no-user-gesture-required'] });
for (const [w, h, label] of [[390, 844, 'phone'], [768, 1024, 'ipad-mini'], [820, 1180, 'ipad-portrait'], [1280, 800, 'desktop']]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  const page = await ctx.newPage();
  await page.addInitScript(() => sessionStorage.setItem('kaizen-intro-seen', '1'));
  try { await page.goto('http://localhost:3000/', { waitUntil: 'load', timeout: 45000 }); } catch {}
  await page.waitForTimeout(4500);
  // Scroll into the cube narrative so the backdrop video is at ~0.3 opacity.
  const total = await page.evaluate(() => document.body.scrollHeight - window.innerHeight);
  await page.evaluate((y) => window.scrollTo(0, y), Math.round(total * 0.35));
  await page.waitForTimeout(1500);
  // Force full opacity just for measuring/screenshot clarity.
  await page.evaluate(() => {
    const v = document.querySelector('video[aria-hidden]');
    if (v) v.style.opacity = '1';
  });
  await page.waitForTimeout(400);
  const info = await page.evaluate(() => {
    const v = document.querySelector('video[aria-hidden]');
    if (!v) return { err: 'no video' };
    const r = v.getBoundingClientRect();
    const cs = getComputedStyle(v);
    const vAR = v.videoWidth && v.videoHeight ? (v.videoWidth / v.videoHeight) : null;
    const boxAR = r.width / r.height;
    // How much of the video is cropped horizontally with object-cover:
    // scale = max(box/vid). visible fraction along the over-scaled axis.
    let croppedAxis = 'none', visibleFrac = 1;
    if (vAR && boxAR) {
      if (vAR > boxAR) { // video wider than box -> sides cropped
        const scale = r.height / v.videoHeight;
        visibleFrac = r.width / (v.videoWidth * scale);
        croppedAxis = 'left/right';
      } else if (vAR < boxAR) {
        const scale = r.width / v.videoWidth;
        visibleFrac = r.height / (v.videoHeight * scale);
        croppedAxis = 'top/bottom';
      }
    }
    return {
      videoW: v.videoWidth, videoH: v.videoHeight, videoAR: vAR && vAR.toFixed(3),
      boxW: Math.round(r.width), boxH: Math.round(r.height), boxAR: boxAR.toFixed(3),
      objectFit: cs.objectFit, objectPosition: cs.objectPosition,
      croppedAxis, visiblePct: Math.round(visibleFrac * 100) + '%',
      readyState: v.readyState,
    };
  });
  console.log(`${label} ${w}x${h} ->`, JSON.stringify(info));
  await page.screenshot({ path: `${OUT}/bg-${label}-${w}x${h}.png` });
  await ctx.close();
}
await browser.close();
console.log('done');
