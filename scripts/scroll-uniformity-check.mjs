import { chromium } from 'playwright-core';

const CARDS = ['card-s1', 'card-s2', 'card-s3', 'card-s4', 'card-s6', 'card-s7', 'card-s8'];

const browser = await chromium.launch({ channel: 'chrome', args: ['--use-angle=swiftshader', '--autoplay-policy=no-user-gesture-required'] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.addInitScript(() => sessionStorage.setItem('kaizen-intro-seen', '1'));
await page.goto('http://localhost:3000/', { waitUntil: 'load', timeout: 60000 });
await page.waitForTimeout(6000);
await page.mouse.move(720, 450);
await page.keyboard.press('Enter');
await page.waitForTimeout(4000);

// Slow, controlled scroll: small steps with a pause so the eased narrative fully
// settles at each point. Record, for every card, the scrollY band where it is
// "held" (opacity >= 0.9) — that band's width is the card's on-screen scroll
// distance. Also detect any frame-to-frame opacity jump > 0.5 at settle (jitter).
const maxScroll = await page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight);
const band = {}; CARDS.forEach((c) => (band[c] = { min: Infinity, max: -Infinity }));

const STEP = 120;
for (let y = 0; y <= maxScroll; y += STEP) {
  await page.mouse.wheel(0, STEP);
  await page.waitForTimeout(70); // let it settle
  const sample = await page.evaluate((cards) => {
    const sy = window.scrollY; const out = {};
    cards.forEach((c) => {
      const el = document.querySelector(`[data-card="${c}"]`);
      out[c] = el ? (parseFloat(getComputedStyle(el).opacity) || 0) : 0;
    });
    return { sy, out };
  }, CARDS);
  for (const c of CARDS) {
    if (sample.out[c] >= 0.9) {
      if (sample.sy < band[c].min) band[c].min = sample.sy;
      if (sample.sy > band[c].max) band[c].max = sample.sy;
    }
  }
}

console.log(`maxScroll=${Math.round(maxScroll)}px  (section spans this many px)\n`);
console.log('Per-card HELD scroll distance (opacity >= 0.9 band):');
const widths = [];
for (const c of CARDS) {
  const b = band[c];
  if (b.max < 0) { console.log(`  ${c}: never held >=0.9 (!?)`); continue; }
  const w = b.max - b.min;
  widths.push(w);
  console.log(`  ${c}: ${Math.round(b.min)}→${Math.round(b.max)}px   held ${Math.round(w)}px`);
}
const avg = widths.reduce((a, b) => a + b, 0) / widths.length;
const min = Math.min(...widths), max = Math.max(...widths);
console.log(`\n  avg held ${Math.round(avg)}px   range ${Math.round(min)}–${Math.round(max)}px   spread ${Math.round((max - min) / avg * 100)}% of avg`);

await browser.close();
console.log('\ndone');
