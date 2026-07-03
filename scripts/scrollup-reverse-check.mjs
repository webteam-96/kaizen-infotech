import { chromium } from 'playwright-core';
const browser = await chromium.launch({
  channel: 'chrome',
  args: ['--use-angle=swiftshader', '--autoplay-policy=no-user-gesture-required'],
});
const SEL = '[data-section-index="3"] .mb-16.text-center'; // StatsGrid "By the Numbers"

async function run(label, viewport, opts, forceTouch) {
  const ctx = await browser.newContext({ viewport, ...opts });
  const page = await ctx.newPage();
  await page.addInitScript((force) => {
    sessionStorage.setItem('kaizen-intro-seen', '1');
    if (force) {
      const orig = window.matchMedia.bind(window);
      window.matchMedia = (q) => {
        if (q.includes('hover: hover') && q.includes('pointer: fine')) {
          return { matches: false, media: q, onchange: null,
            addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, dispatchEvent() { return false; } };
        }
        return orig(q);
      };
    }
  }, forceTouch);
  try { await page.goto('http://localhost:3000/', { waitUntil: 'networkidle', timeout: 60000 }); } catch {}
  await page.waitForTimeout(1800);

  const headTop = await page.evaluate((sel) => {
    const el = document.querySelector(sel);
    return el ? Math.round(el.getBoundingClientRect().top + window.scrollY) : null;
  }, SEL);
  const vh = viewport.height;
  const readOp = () => page.evaluate((sel) => {
    const el = document.querySelector(sel);
    return el ? +(+getComputedStyle(el).opacity).toFixed(2) : null;
  }, SEL);

  const at = async (frac) => {
    await page.evaluate((y) => window.scrollTo(0, y), headTop - vh * frac);
    await page.waitForTimeout(450);
    return await readOp();
  };
  // element-top fraction in viewport: band is start 'top 85%' → end 'top 55%'
  const down = [];
  for (const f of [0.95, 0.85, 0.70, 0.55, 0.45]) down.push({ topFrac: f, op: await at(f) });
  const up = [];
  for (const f of [0.55, 0.70, 0.85, 0.95]) up.push({ topFrac: f, op: await at(f) });
  console.log(label, 'DOWN', JSON.stringify(down));
  console.log(label, 'UP  ', JSON.stringify(up));
  await ctx.close();
}

await run('forced-touch', { width: 390, height: 844 }, { isMobile: true, hasTouch: true, deviceScaleFactor: 2 }, true);
await run('desktop',      { width: 1440, height: 900 }, {}, false);
await browser.close();
console.log('done');
