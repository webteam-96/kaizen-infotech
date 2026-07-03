import { chromium } from 'playwright-core';
const browser = await chromium.launch({ channel: 'chrome', args: ['--use-angle=swiftshader', '--autoplay-policy=no-user-gesture-required'] });

// Pick the Why-Choose grid (gap-8) which uses the hook on BOTH desktop & touch.
async function run(label, viewport, forceTouch) {
  const ctx = await browser.newContext({ viewport, isMobile: !!forceTouch, hasTouch: !!forceTouch, deviceScaleFactor: forceTouch ? 2 : 1 });
  const page = await ctx.newPage();
  await page.addInitScript(() => sessionStorage.setItem('kaizen-intro-seen', '1'));
  if (forceTouch) {
    await page.addInitScript(() => {
      const orig = window.matchMedia.bind(window);
      window.matchMedia = (q) => q.includes('hover: hover')
        ? { matches: false, media: q, onchange: null, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, dispatchEvent() { return false; } }
        : orig(q);
    });
  }
  try { await page.goto('http://localhost:3000/services', { waitUntil: 'networkidle', timeout: 60000 }); } catch {}
  await page.waitForTimeout(1500);

  const info = await page.evaluate(() => {
    const grid = [...document.querySelectorAll('div.grid')].find((g) => /Why|Experience|Approach|Support/.test(g.textContent) && g.children.length === 3);
    if (!grid) return { error: 'no whychoose grid' };
    const r = grid.getBoundingClientRect();
    return { top: Math.round(r.top + window.scrollY), h: Math.round(r.height), vh: window.innerHeight };
  });
  if (info.error) { console.log(label, info.error); await ctx.close(); return; }

  const read = () => page.evaluate(() => {
    const grid = [...document.querySelectorAll('div.grid')].find((g) => /Why|Experience|Approach|Support/.test(g.textContent) && g.children.length === 3);
    const vh = window.innerHeight;
    return [...grid.children].map((c) => {
      const r = c.getBoundingClientRect();
      return { op: +(+getComputedStyle(c).opacity).toFixed(2), inView: r.bottom > 0 && r.top < vh };
    });
  });

  let sawAnimating = false, allRevealedInView = true;
  for (let i = 0; i <= 6; i++) {
    const y = info.top - info.vh + (info.h + info.vh) * (i / 6);
    await page.evaluate((yy) => window.scrollTo(0, Math.max(0, yy)), Math.round(y));
    await page.waitForTimeout(400);
    const d = await read();
    if (d.some((c) => c.op > 0.05 && c.op < 0.95 && c.inView)) sawAnimating = true;
    console.log(`${label} step${i}:`, d.map((c) => `${c.op}${c.inView ? 'v' : '_'}`).join(' '));
  }
  console.log(`${label} → sawMidAnimationInView=${sawAnimating}`);
  await ctx.close();
}

await run('DESKTOP', { width: 1440, height: 900 }, false);
await run('PHONE', { width: 390, height: 844 }, true);
await browser.close();
console.log('done');
