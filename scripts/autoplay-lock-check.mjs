import { chromium } from 'playwright-core';

async function run(label, viewport, useTouch) {
  const browser = await chromium.launch({ channel: 'chrome', args: ['--use-angle=swiftshader'] });
  const ctx = await browser.newContext({ viewport, hasTouch: !!useTouch, isMobile: !!useTouch });
  const page = await ctx.newPage();
  await page.addInitScript(() => sessionStorage.setItem('kaizen-intro-seen', '1'));
  try { await page.goto('http://localhost:3000/', { waitUntil: 'load', timeout: 45000 }); } catch {}
  await page.waitForTimeout(6000);

  // 1) Try to scroll BEFORE any key/tap — should stay locked at 0.
  if (useTouch) {
    // simulate a swipe up (drag) to attempt scrolling
    await page.mouse.move(viewport.width / 2, viewport.height * 0.7);
    await page.touchscreen.tap(viewport.width / 2, viewport.height * 0.1); // tap top-ish won't count if treated as tap...
  }
  await page.mouse.wheel(0, 1200);
  await page.waitForTimeout(600);
  const lockedY = await page.evaluate(() => Math.round(window.scrollY));

  // 2) Trigger.
  if (useTouch) {
    await page.touchscreen.tap(viewport.width / 2, viewport.height / 2);
  } else {
    await page.keyboard.press('Enter');
  }
  await page.waitForTimeout(3600);
  const afterPlayY = await page.evaluate(() => Math.round(window.scrollY));

  // 3) Now manual wheel should work (unlocked).
  await page.mouse.wheel(0, 1500);
  await page.waitForTimeout(900);
  const afterWheelY = await page.evaluate(() => Math.round(window.scrollY));

  console.log(JSON.stringify({
    label,
    lockedY,                 // expect ~0  (scroll blocked before trigger)
    afterPlayY,              // expect ~1000 (dive played)
    afterWheelY,             // expect > afterPlayY (manual scroll now works)
    unlockedWorks: afterWheelY > afterPlayY + 50,
    stayedLocked: lockedY < 20,
  }, null, 2));
  await browser.close();
}

await run('desktop', { width: 1280, height: 800 }, false);
console.log('done');
