import { chromium } from 'playwright-core';

const browser = await chromium.launch({
  channel: 'chrome',
  args: ['--use-angle=swiftshader', '--autoplay-policy=no-user-gesture-required'],
});
const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
const page = await ctx.newPage();
await page.addInitScript(() => sessionStorage.setItem('kaizen-intro-seen', '1'));
await page.goto('http://localhost:3000/', { waitUntil: 'load', timeout: 60000 });
// Let the heavy Spline scene load + paint (do NOT press Enter — stay at hero top).
await page.waitForTimeout(11000);
await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
await page.waitForTimeout(800);

await page.screenshot({ path: 'audit-shots/landing-bg/watermark-full-1920.png' });
// Crop to the bottom-right corner where the watermark/mask sits (1920 view).
await page.screenshot({
  path: 'audit-shots/landing-bg/watermark-corner-1920.png',
  clip: { x: 1480, y: 760, width: 440, height: 320 },
});
console.log('done');
await browser.close();
