import { chromium } from 'playwright-core';

const BASE = 'http://localhost:3000';
const browser = await chromium.launch({ args: ['--use-angle=swiftshader'] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.addInitScript(() => sessionStorage.setItem('kaizen-intro-seen', '1'));

const hits = [];
page.on('response', async (res) => {
  const url = res.url();
  if (/physics|opentype|navmesh|boolean|howler|splinetool|spline\.design|rapier|three/i.test(url)) {
    let len = 0;
    try {
      const h = res.headers();
      len = Number(h['content-length'] || 0);
      if (!len) {
        const b = await res.body().catch(() => null);
        len = b ? b.length : 0;
      }
    } catch {}
    hits.push({ url: url.slice(0, 160), status: res.status(), len });
  }
});

try {
  await page.goto(BASE + '/', { waitUntil: 'networkidle', timeout: 60000 });
} catch {}
await page.waitForTimeout(12000);
// scroll a bit so hero narrative runs
await page.evaluate(() => window.scrollTo(0, 2000));
await page.waitForTimeout(6000);

console.log(JSON.stringify(hits, null, 1));
await browser.close();
