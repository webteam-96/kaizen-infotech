// Verify the About > Our Values card deck: no content cropping at any viewport,
// and cards keep a uniform size. Measures the active card's scrollHeight vs
// clientHeight (card has overflow-hidden, so overflow => crop) for all 5 values.
import { chromium } from 'playwright-core';
import { mkdirSync } from 'fs';

const OUT = 'audit-shots/values';
mkdirSync(OUT, { recursive: true });

const VIEWPORTS = [
  { name: 'phone-360x640', w: 360, h: 640 },
  { name: 'phone-390x844', w: 390, h: 844 },
  { name: 'phone-landscape-844x390', w: 844, h: 390 },
  { name: 'ipad-768x1024', w: 768, h: 1024 },
  { name: 'landscape-1024x600', w: 1024, h: 600 },
  { name: 'laptop-short-1280x720', w: 1280, h: 720 },
  { name: 'laptop-1440x900', w: 1440, h: 900 },
  { name: 'big-1920x1080', w: 1920, h: 1080 },
];

const browser = await chromium.launch({ args: ['--use-angle=swiftshader'] });

for (const vp of VIEWPORTS) {
  const ctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h } });
  const page = await ctx.newPage();
  await page.addInitScript(() => sessionStorage.setItem('kaizen-intro-seen', '1'));
  await page.goto('http://localhost:3000/about', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(2500);

  // Scroll into the pinned values section so the sticky card is on-screen.
  for (let i = 0; i < 22; i++) {
    const done = await page.evaluate(() => {
      const el = document.querySelector('.card-red-accent');
      if (!el) return false;
      const r = el.getBoundingClientRect();
      return r.top > 40 && r.bottom < window.innerHeight - 20 && r.height > 0;
    });
    if (done) break;
    await page.mouse.wheel(0, 500);
    await page.waitForTimeout(220);
  }
  await page.waitForTimeout(500);

  const results = [];
  for (let i = 0; i < 5; i++) {
    await page.evaluate((idx) => {
      const dots = document.querySelectorAll('[aria-label^="Go to value"]');
      dots[idx] && dots[idx].click();
    }, i);
    await page.waitForTimeout(650);
    const m = await page.evaluate(() => {
      const el = document.querySelector('.card-red-accent');
      if (!el) return null;
      const title = el.querySelector('h3')?.innerText || '';
      return {
        title,
        clientH: el.clientHeight,
        scrollH: el.scrollHeight,
        clientW: el.clientWidth,
        cropped: el.scrollHeight - el.clientHeight > 1,
        overflowPx: el.scrollHeight - el.clientHeight,
      };
    });
    results.push({ i, ...m });
  }

  // Screenshot the current (last) card for a visual record.
  const card = page.locator('.card-red-accent').first();
  await card.screenshot({ path: `${OUT}/${vp.name}.png` }).catch(() => {});

  const widths = new Set(results.map((r) => r.clientW));
  const heights = new Set(results.map((r) => r.clientH));
  const anyCrop = results.some((r) => r.cropped);
  console.log(`\n=== ${vp.name} (${vp.w}x${vp.h}) ===`);
  console.log(`  card width(s): ${[...widths].join(', ')}  height(s): ${[...heights].join(', ')}`);
  console.log(`  uniform size: ${widths.size === 1 && heights.size === 1 ? 'YES' : 'NO'}`);
  console.log(`  any cropped: ${anyCrop ? 'YES ***' : 'no'}`);
  for (const r of results) {
    console.log(
      `    [${r.i}] ${r.cropped ? 'CROP +' + r.overflowPx + 'px' : 'ok'}  (client ${r.clientH} / content ${r.scrollH})  "${r.title}"`
    );
  }
  await ctx.close();
}

await browser.close();
console.log('\ndone');
