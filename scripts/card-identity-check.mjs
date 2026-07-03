import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';

const OUT = 'audit-shots/cards';
mkdirSync(OUT, { recursive: true });

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

// Capture a viewport screenshot after scrolling to an absolute Y (with settle).
async function shotAt(yFrac, name) {
  const y = Math.round(maxScroll * yFrac);
  await page.evaluate((yy) => window.scrollTo({ top: yy, behavior: 'instant' }), y);
  await page.waitForTimeout(1100);
  await page.screenshot({ path: `${OUT}/${name}.png` });
  console.log(`shot ${name} @ y=${y} (${(yFrac * 100).toFixed(0)}%)`);
}

// Find each section's mid-point fraction so we land inside its sticky phase.
const fracs = await page.evaluate(() => {
  const total = document.documentElement.scrollHeight - window.innerHeight;
  const out = {};
  for (const idx of [1, 2, 3, 4, 5, 6, 7, 8, 9]) {
    const el = document.querySelector(`[data-section-index="${idx}"]`);
    if (!el) continue;
    const r = el.getBoundingClientRect();
    const top = r.top + window.scrollY;
    out[idx] = { top, h: r.height, total };
  }
  return out;
});

// Land partway into each section so sticky/pinned card phases are on-screen.
const plan = [
  [1, 0.55, 'brandpromise-redtint'],
  [2, 0.45, 'services-cards-blue'],
  [3, 0.50, 'stats-accentbars'],
  [4, 0.55, 'featuredwork-cards-red'],
  [5, 0.50, 'process-redaura'],
  [6, 0.45, 'industries'],
  [7, 0.50, 'tech-redtint'],
  [8, 0.55, 'whychoose-redicons'],
];
for (const [idx, within, name] of plan) {
  const f = fracs[idx];
  if (!f) continue;
  const yFrac = (f.top + f.h * within) / f.total;
  await shotAt(Math.min(0.99, Math.max(0, yFrac)), name);
}

await browser.close();
console.log('\ndone');
