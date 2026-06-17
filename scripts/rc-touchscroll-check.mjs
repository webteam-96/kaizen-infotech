import { chromium } from 'playwright-core';

const BASE = 'http://localhost:3000';
const browser = await chromium.launch({ channel: 'chrome', args: ['--use-angle=swiftshader'] });

for (const w of [390, 768]) {
  const ctx = await browser.newContext({
    viewport: { width: w, height: 800 },
    hasTouch: true,
    isMobile: true,
  });
  const page = await ctx.newPage();
  await page.addInitScript(() => sessionStorage.setItem('kaizen-intro-seen', '1'));
  try { await page.goto(BASE + '/', { waitUntil: 'load', timeout: 45000 }); } catch {}
  await page.waitForTimeout(4000); // let Spline + scene init

  const pe = await page.evaluate(() => {
    const el = document.querySelector('.fixed.inset-y-0.right-0.z-0');
    return el ? getComputedStyle(el).pointerEvents : 'no-el';
  });

  const before = await page.evaluate(() => window.scrollY);

  // Real touch swipes (swipe UP over the Spline/monitor area => page scrolls DOWN).
  const client = await page.context().newCDPSession(page);
  const cx = Math.round(w / 2);
  for (let s = 0; s < 4; s++) {
    await client.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: cx, y: 620 }] });
    for (let y = 620; y >= 180; y -= 80) {
      await client.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: cx, y }] });
      await page.waitForTimeout(16);
    }
    await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await page.waitForTimeout(250);
  }
  await page.waitForTimeout(800);
  const after = await page.evaluate(() => window.scrollY);

  console.log(`${w}px splinePointerEvents=${pe}  scrollY ${before} -> ${Math.round(after)}  scrolled=${after - before > 50 ? 'YES ✅' : 'NO ⚠'}`);
  await ctx.close();
}
await browser.close();
console.log('done');
