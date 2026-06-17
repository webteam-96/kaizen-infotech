import { chromium } from 'playwright-core';

const BASE = 'http://localhost:3000';
const browser = await chromium.launch({ channel: 'chrome', args: ['--use-angle=swiftshader'] });

for (const w of [390, 1440]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 800 } });
  const page = await ctx.newPage();
  await page.addInitScript(() => sessionStorage.setItem('kaizen-intro-seen', '1'));
  try { await page.goto(BASE + '/', { waitUntil: 'load', timeout: 45000 }); } catch {}
  await page.waitForTimeout(2500);

  // Computed overflow on html/body (the sticky-breaking concern).
  const ov = await page.evaluate(() => ({
    htmlX: getComputedStyle(document.documentElement).overflowX,
    htmlY: getComputedStyle(document.documentElement).overflowY,
    bodyX: getComputedStyle(document.body).overflowX,
    bodyY: getComputedStyle(document.body).overflowY,
  }));

  // Find FeaturedWork, scroll to ~40% through its scroll height, check a card revealed
  // and the sticky wrapper is pinned to the top of the viewport.
  const res = await page.evaluate(async () => {
    const sec = document.querySelector('[data-section-index="4"]');
    if (!sec) return { err: 'no section' };
    const scrollArea = sec.querySelector('div[style*="vh"]') || sec.firstElementChild;
    const top = window.scrollY + sec.getBoundingClientRect().top;
    const h = scrollArea ? scrollArea.offsetHeight : sec.offsetHeight;
    window.scrollTo(0, top + h * 0.4);
    await new Promise(r => setTimeout(r, 1200));
    const sticky = sec.querySelector('.sticky');
    const sr = sticky ? sticky.getBoundingClientRect() : null;
    const cards = [...sec.querySelectorAll('.absolute.inset-0')];
    const maxOpacity = cards.reduce((m, c) => Math.max(m, parseFloat(getComputedStyle(c).opacity) || 0), 0);
    return {
      stickyTop: sr ? Math.round(sr.top) : null,   // ~0 means pinned to viewport top
      stickyPos: sticky ? getComputedStyle(sticky).position : null,
      maxCardOpacity: +maxOpacity.toFixed(2),
    };
  });

  await page.screenshot({ path: `audit-shots/rc-responsive/pin-${w}.png` });
  console.log(`${w}px overflow=${JSON.stringify(ov)}`);
  console.log(`${w}px pin=${JSON.stringify(res)}`);
  await ctx.close();
}
await browser.close();
console.log('done');
