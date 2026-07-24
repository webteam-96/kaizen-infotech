// Fresh first-visit load (loader runs — no kaizen-intro-seen). At several time
// points, attempt a wheel scroll and report whether the page moved and whether
// the freeze/loader flags are set. Then press Enter and confirm the dive plays.
import { chromium } from 'playwright-core';

const browser = await chromium.launch({ headless: false });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
const errs = [];
page.on('pageerror', (e) => errs.push(e.message.slice(0, 100)));

await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded', timeout: 60000 }).catch(() => {});

const state = async () => page.evaluate(() => ({
  y: Math.round(window.scrollY),
  loaderActive: document.body.classList.contains('loader-active'),
  overlayShown: (() => { const o = document.querySelector('.fixed.inset-0.z-\\[9999\\]'); return o ? getComputedStyle(o).display !== 'none' : 'no-overlay'; })(),
}));

const tryScroll = async () => {
  await page.mouse.move(720, 450);
  await page.mouse.wheel(0, 1200);
  await page.waitForTimeout(400);
};

for (const t of [3000, 6000, 8500, 10500, 12500]) {
  await page.waitForTimeout(t - (await page.evaluate(() => performance.now())));
  const before = await state();
  await tryScroll();
  const after = await state();
  console.log(`@~${t}ms  loaderActive=${before.loaderActive} overlay=${before.overlayShown}  scrollY ${before.y}->${after.y}  ${after.y > before.y + 5 ? 'PAGE MOVED (scroll worked)' : 'frozen'}`);
  // reset to top so each probe is independent
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(200);
}

// Now press Enter — the dive should play.
const yBeforeEnter = (await state()).y;
await page.keyboard.press('Enter');
await page.waitForTimeout(4000);
const yAfterEnter = (await state()).y;
console.log(`\nEnter: scrollY ${yBeforeEnter} -> ${yAfterEnter}  ${yAfterEnter > yBeforeEnter + 100 ? 'DIVE PLAYED' : 'no movement'}`);
console.log('pageerrors:', errs.length ? errs : 'none');
await browser.close();
