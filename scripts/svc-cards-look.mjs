import { chromium } from 'playwright-core';
import { mkdirSync } from 'fs';
const OUT = 'audit-shots/svc-cards-look';
mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', args: ['--use-angle=swiftshader'] });
for (const [w, h, label] of [[1440, 900, 'desktop'], [390, 844, 'phone'], [820, 1180, 'ipadp']]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  const page = await ctx.newPage();
  await page.addInitScript(() => sessionStorage.setItem('kaizen-intro-seen', '1'));
  try { await page.goto('http://localhost:3000/', { waitUntil: 'load', timeout: 45000 }); } catch {}
  await page.waitForTimeout(2500);
  const geom = await page.evaluate(() => {
    const sec = document.querySelector('[data-section-index="2"] section');
    return { top: window.scrollY + sec.getBoundingClientRect().top, H: sec.offsetHeight };
  });
  // Two snapshots: spread (cards in a row) and mid-carousel (spotlight).
  for (const [p, tag] of [[0.18, 'spread'], [0.45, 'spotlight']]) {
    await page.evaluate((y) => window.scrollTo(0, y), geom.top + geom.H * p);
    await page.waitForTimeout(1300);
    await page.screenshot({ path: `${OUT}/${label}-${tag}.png` });
  }
  console.log(`done ${label}`);
  await ctx.close();
}
await browser.close();
console.log('all done');
