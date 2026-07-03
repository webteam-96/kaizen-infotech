import { chromium } from 'playwright-core';

const browser = await chromium.launch({
  channel: 'chrome',
  args: ['--use-angle=swiftshader', '--autoplay-policy=no-user-gesture-required'],
});
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.addInitScript(() => sessionStorage.setItem('kaizen-intro-seen', '1'));
await page.goto('http://localhost:3000/', { waitUntil: 'load', timeout: 60000 });
await page.waitForTimeout(5000);
await page.mouse.move(720, 450);
await page.keyboard.press('Enter');
await page.waitForTimeout(3500);

const max = await page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight);
// BrandPromise sits just after the hero; walk down until its verbs reveal.
for (const f of [0.30, 0.33, 0.36, 0.39]) {
  await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), Math.round(max * f));
  await page.waitForTimeout(900);
  await page.screenshot({ path: `audit-shots/cards/brandpromise-${Math.round(f * 100)}.png` });
}
console.log('done');
await browser.close();
