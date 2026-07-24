// Probe: verify the HexDomeBackground motion background on the home page.
// The intro freeze swallows scroll until Enter (autoplay doesn't fire headless),
// so we wait for the section's 9s safety unlock, then drive Lenis with wheel
// events — the input it actually listens to.
import { chromium } from 'playwright-core';
import { mkdirSync } from 'fs';

const BASE = 'http://localhost:3000';
const OUT = 'audit-shots/hexdome';
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ args: ['--use-angle=swiftshader'] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.addInitScript(() => sessionStorage.setItem('kaizen-intro-seen', '1'));

try {
  await page.goto(BASE + '/', { waitUntil: 'networkidle', timeout: 45000 });
} catch {}
await page.waitForTimeout(4500);

await page.screenshot({ path: `${OUT}/home-intro-t0.png` });

// Numeric motion check on the background canvas while we wait out the unlock.
const sample = () =>
  page.evaluate(() => {
    const c = document.querySelector('div[class*="z-\\[-1\\]"] canvas');
    if (!c) return null;
    const g = c.getContext('2d');
    return Array.from(g.getImageData(0, Math.round(c.height * 0.55), 300, 150).data.filter((_, i) => i % 16 === 0));
  });
const a = await sample();
await page.waitForTimeout(3000);
const b = await sample();
if (a && b) {
  let diff = 0;
  let maxd = 0;
  for (let i = 0; i < a.length; i++) {
    const d = Math.abs(a[i] - b[i]);
    if (d > 2) diff++;
    if (d > maxd) maxd = d;
  }
  console.log(`motion: sampled ${a.length} px, changed(>2): ${diff}, max delta: ${maxd}`);
} else console.log('motion: canvas not found!');

await page.screenshot({ path: `${OUT}/home-intro-t4.png` });

// ≥9s elapsed → safety unlock has released the freeze. Wheel-scroll.
await page.mouse.move(720, 450);
async function wheelTo(target, label) {
  for (let i = 0; i < 120; i++) {
    const y = await page.evaluate(() => window.scrollY);
    if (y >= target) break;
    await page.mouse.wheel(0, 600);
    await page.waitForTimeout(90);
  }
  await page.waitForTimeout(1500);
  console.log(`${label}: scrollY =`, await page.evaluate(() => Math.round(window.scrollY)));
}

await wheelTo(1400, 'post-dive');
await page.screenshot({ path: `${OUT}/home-after-dive.png` });
await wheelTo(3200, 'narrative A');
await page.screenshot({ path: `${OUT}/home-narrative-a.png` });
await wheelTo(5200, 'narrative B');
await page.screenshot({ path: `${OUT}/home-narrative-b.png` });

// Past the 720vh spacer (6480px): bg wrapper must be display:none (rAF idled).
await wheelTo(8200, 'past section');
const pastInfo = await page.evaluate(() => {
  const wraps = [...document.querySelectorAll('div[aria-hidden]')].filter(
    (d) => d.querySelector('canvas') && getComputedStyle(d).position === 'fixed'
  );
  return wraps.map((d) => ({ display: d.style.display || '(unset)' }));
});
console.log('past-section wrappers:', JSON.stringify(pastInfo));

// Back up into the section: must restore to block.
for (let i = 0; i < 60; i++) {
  const y = await page.evaluate(() => window.scrollY);
  if (y <= 4000) break;
  await page.mouse.wheel(0, -700);
  await page.waitForTimeout(90);
}
await page.waitForTimeout(1500);
const backInfo = await page.evaluate(() => {
  const wraps = [...document.querySelectorAll('div[aria-hidden]')].filter(
    (d) => d.querySelector('canvas') && getComputedStyle(d).position === 'fixed'
  );
  return { scrollY: Math.round(window.scrollY), display: wraps.map((d) => d.style.display || '(unset)') };
});
console.log('back-in-section:', JSON.stringify(backInfo));

await browser.close();
console.log('done');
