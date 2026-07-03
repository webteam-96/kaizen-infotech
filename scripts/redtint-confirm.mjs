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

const found = await page.evaluate(() => {
  const out = [];
  for (const sel of ['.section-tint-red', '.section-aura-red']) {
    document.querySelectorAll(sel).forEach((el) => {
      const cs = getComputedStyle(el);
      out.push({ sel, bg: cs.backgroundColor, hasImg: cs.backgroundImage !== 'none' });
    });
  }
  return out;
});
console.log(JSON.stringify(found, null, 2));

// Scroll BrandPromise into view by element and shoot.
const bp = page.locator('.section-tint-red').first();
await bp.scrollIntoViewIfNeeded().catch(() => {});
await page.waitForTimeout(900);
await page.screenshot({ path: 'audit-shots/cards/brandpromise-CONFIRM.png' });

await browser.close();
console.log('done');
