// Visual probe for the per-card Capabilities motion backdrops.
// Requires a running dev server (npm run dev). Launches software-GL chromium,
// skips the intro, scrolls the orbit deck into view, then clicks each dot to
// drive `active` and screenshots the resulting scene.
import { chromium } from 'playwright-core';
import { mkdirSync } from 'fs';

const OUT = 'audit-shots/capability-bg';
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ channel: 'chrome', args: ['--use-angle=swiftshader'] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.addInitScript(() => sessionStorage.setItem('kaizen-intro-seen', '1'));
try {
  await page.goto('http://localhost:3000/services', { waitUntil: 'load', timeout: 45000 });
} catch {}
await page.waitForTimeout(2000);

// Scroll the sticky orbit stage into view (section top + 25% of its travel).
const geom = await page.evaluate(() => {
  const s = document.querySelector('.oc-section');
  if (!s) return null;
  const top = window.scrollY + s.getBoundingClientRect().top;
  return { top, h: s.offsetHeight, vh: window.innerHeight };
});
if (!geom) {
  console.log('.oc-section not found');
  await browser.close();
  process.exit(1);
}
await page.evaluate((y) => window.scrollTo(0, y), geom.top + 0.25 * (geom.h - geom.vh));
await page.waitForTimeout(1200);

const names = ['01-software', '02-mobile', '03-events', '04-portals', '05-marketing'];
for (let i = 0; i < names.length; i++) {
  await page.locator('.oc-dot').nth(i).click({ force: true });
  await page.waitForTimeout(1400); // crossfade + let the scene animate a beat
  await page.screenshot({ path: `${OUT}/${names[i]}.png` });
  const active = await page.evaluate(() => {
    const dots = [...document.querySelectorAll('.oc-dot')];
    return dots.findIndex((d) => d.classList.contains('on'));
  });
  console.log(`${names[i]} -> active dot = ${active}`);
}

// Confirm the "Read more" CTA is gone from the cards.
const ctaGone = await page.evaluate(() => !document.querySelector('.oc-card-cta'));
console.log('read-more CTA removed:', ctaGone);

await browser.close();
console.log('done ->', OUT);
