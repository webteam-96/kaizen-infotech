import { chromium } from 'playwright-core';
const browser = await chromium.launch({ channel: 'chrome', args: ['--use-angle=swiftshader'] });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const page = await ctx.newPage();
await page.addInitScript(() => sessionStorage.setItem('kaizen-intro-seen', '1'));
try { await page.goto('http://localhost:3000/', { waitUntil: 'load', timeout: 45000 }); } catch {}
await page.waitForTimeout(2500);
// Scroll into the services pinned section (~40% through its 600vh range).
const geom = await page.evaluate(() => {
  const sec = document.querySelector('[data-section-index="2"] section');
  const top = sec ? window.scrollY + sec.getBoundingClientRect().top : 0;
  const H = sec ? sec.offsetHeight : 0;
  return { top, H };
});
await page.evaluate((y) => window.scrollTo(0, y), geom.top + geom.H * 0.42);
await page.waitForTimeout(1500);
await page.screenshot({ path: 'audit-shots/service-cards/desktop-1280-carousel.png' });
console.log('captured');
await browser.close();
