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

const maxScroll = await page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight);
const f = await page.evaluate(() => {
  const el = document.querySelector('[data-section-index="4"]');
  const r = el.getBoundingClientRect();
  return { top: r.top + window.scrollY, h: r.height };
});
const y = Math.round(f.top + f.h * 0.55);
await page.evaluate((yy) => window.scrollTo({ top: yy, behavior: 'instant' }), y);
await page.waitForTimeout(1200);
await page.screenshot({ path: 'audit-shots/cards/featuredwork-UNIFIED.png' });
console.log(`shot @ y=${y} / max=${maxScroll}`);
await browser.close();
console.log('done');
