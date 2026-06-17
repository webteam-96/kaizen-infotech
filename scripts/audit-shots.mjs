import { chromium } from 'playwright-core';
import { mkdirSync } from 'fs';

const BASE = 'http://localhost:3000';
const OUT = 'audit-shots';
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ args: ['--use-angle=swiftshader'] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.addInitScript(() => sessionStorage.setItem('kaizen-intro-seen', '1'));

async function shot(path, name, scrolls = [0]) {
  try {
    await page.goto(BASE + path, { waitUntil: 'networkidle', timeout: 45000 });
  } catch { /* networkidle may never settle with RAF loops; continue */ }
  await page.waitForTimeout(2500);
  for (const y of scrolls) {
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
    await page.waitForTimeout(1800);
    try {
      await page.screenshot({ path: `${OUT}/${name}-${y}.png`, timeout: 90000 });
    } catch (e) { console.log(`shot failed ${name}-${y}: ${e.message.split('\n')[0]}`); }
  }
}

await shot('/', 'home', [0, 1200, 4000, 7000, 9500, 12000, 14000, 16000]);
await shot('/about', 'about', [0, 1500, 3500, 5500]);
await shot('/services', 'services', [0, 1500, 3500]);
await shot('/work', 'work', [0, 1200, 3000]);
await shot('/blog', 'blog', [0, 1200]);
await shot('/contact', 'contact', [0, 900]);
await shot('/careers', 'careers', [0, 900]);

await browser.close();
console.log('done');
