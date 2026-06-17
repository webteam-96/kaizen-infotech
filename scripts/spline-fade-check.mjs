import { chromium } from 'playwright-core';
const browser = await chromium.launch({ channel: 'chrome', args: ['--use-angle=swiftshader'] });
async function run(w, h, label) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  const page = await ctx.newPage();
  await page.addInitScript(() => sessionStorage.setItem('kaizen-intro-seen', '1'));
  try { await page.goto('http://localhost:3000/', { waitUntil: 'load', timeout: 45000 }); } catch {}
  await page.waitForTimeout(4500);
  const total = await page.evaluate(() => document.body.scrollHeight - window.innerHeight);
  const reads = [];
  for (const frac of [0.0, 0.06, 0.12, 0.18, 0.26]) {
    await page.evaluate((y) => window.scrollTo(0, y), Math.round(total * frac));
    await page.waitForTimeout(900);
    const op = await page.evaluate(() => {
      const el = document.querySelector('.fixed.inset-y-0.right-0.z-0');
      return el ? getComputedStyle(el).opacity : 'n/a';
    });
    reads.push(`${frac}:${op}`);
  }
  console.log(`${label} (${w}x${h}) spline opacity ->`, reads.join('  '));
  await ctx.close();
}
await run(390, 844, 'phone');
await run(820, 1180, 'iPad-portrait');
await run(1024, 768, 'iPad-landscape');
await run(1280, 800, 'desktop');
await browser.close();
console.log('done');
