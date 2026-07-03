import { chromium } from 'playwright-core';
const browser = await chromium.launch({ channel: 'chrome', args: ['--use-angle=swiftshader', '--autoplay-policy=no-user-gesture-required'] });

async function run(label, viewport) {
  const ctx = await browser.newContext({ viewport, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  await page.addInitScript(() => {
    sessionStorage.setItem('kaizen-intro-seen', '1');
    // Force the desktop-capability media query FALSE so the touch path runs
    // (ServiceCardDeck → ServiceGrid, and the hook → touch scrub).
    const orig = window.matchMedia.bind(window);
    window.matchMedia = (q) =>
      q.includes('hover: hover')
        ? { matches: false, media: q, onchange: null, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, dispatchEvent() { return false; } }
        : orig(q);
  });
  try { await page.goto('http://localhost:3000/services', { waitUntil: 'networkidle', timeout: 60000 }); } catch {}
  await page.waitForTimeout(1500);

  const info = await page.evaluate(() => {
    const grid = [...document.querySelectorAll('div.grid')].find((g) => g.querySelector('a[href^="/services/"]'));
    if (!grid) return { error: 'no grid' };
    return {
      gridTop: Math.round(grid.getBoundingClientRect().top + window.scrollY),
      gridH: Math.round(grid.getBoundingClientRect().height),
      cards: grid.querySelectorAll('a[href^="/services/"]').length,
      vh: window.innerHeight,
    };
  });
  console.log(label, 'grid:', JSON.stringify(info));
  if (info.error) { await ctx.close(); return; }

  const read = () => page.evaluate(() => {
    const grid = [...document.querySelectorAll('div.grid')].find((g) => g.querySelector('a[href^="/services/"]'));
    const cards = [...grid.querySelectorAll('a[href^="/services/"]')];
    const vh = window.innerHeight;
    return {
      gridTopVH: +((grid.getBoundingClientRect().top / vh) * 100).toFixed(0),
      cards: cards.map((c) => {
        const r = c.getBoundingClientRect();
        const inView = r.bottom > 0 && r.top < vh;
        return { op: +(+getComputedStyle(c).opacity).toFixed(2), midVH: +((r.top + r.height / 2) / vh * 100).toFixed(0), inView };
      }),
    };
  });

  // Walk from just-before the grid through past it.
  for (let i = 0; i <= 8; i++) {
    const y = info.gridTop - info.vh + (info.gridH + info.vh) * (i / 8);
    await page.evaluate((yy) => window.scrollTo(0, yy), Math.max(0, Math.round(y)));
    await page.waitForTimeout(450);
    const d = await read();
    const ops = d.cards.map((c) => `${c.op}${c.inView ? '·v' : '·_'}`).join(' ');
    console.log(`${label} step${i} gridTop=${d.gridTopVH}vh | ${ops}`);
  }
  await ctx.close();
}

await run('phone', { width: 390, height: 844 });
await run('ipad', { width: 820, height: 1180 });
await browser.close();
console.log('done');
