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

// Force every logo to full colour + freeze the marquee so we can read them.
await page.addStyleTag({
  content: `
    [data-section-index="7"] img { opacity:1 !important; filter:none !important; }
    [data-section-index="7"] .group span { color:#111 !important; }
    [data-section-index="7"] * { animation: none !important; }
  `,
});

const sec = page.locator('[data-section-index="7"]');
await sec.scrollIntoViewIfNeeded();
await page.waitForTimeout(1200);
// Stop the framer marquee transform so chips are readable.
await page.evaluate(() => {
  document.querySelectorAll('[data-section-index="7"] .flex.w-max').forEach((el) => {
    el.style.transform = 'translateX(0px)';
  });
});
await page.waitForTimeout(400);
await page.screenshot({ path: 'audit-shots/fonts/techstack-audit.png', clip: await sec.boundingBox() });

// Also report each img's resolved src + natural size (0x0 = broken/blank).
const imgs = await page.evaluate(() => {
  return [...document.querySelectorAll('[data-section-index="7"] img')]
    .slice(0, 30)
    .map((im) => ({ src: im.getAttribute('src'), w: im.naturalWidth, h: im.naturalHeight }));
});
console.log(JSON.stringify(imgs, null, 1));
await browser.close();
console.log('done');
