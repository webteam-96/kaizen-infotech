import { chromium } from 'playwright-core';
const browser = await chromium.launch({ channel: 'chrome', args: ['--use-angle=swiftshader'] });
for (const [w, h] of [[390, 844], [820, 1180], [1024, 1366], [1280, 800], [1440, 900]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  const page = await ctx.newPage();
  await page.addInitScript(() => sessionStorage.setItem('kaizen-intro-seen', '1'));
  try { await page.goto('http://localhost:3000/', { waitUntil: 'load', timeout: 45000 }); } catch {}
  await page.waitForTimeout(2500);
  const geom = await page.evaluate(() => {
    const sec = document.querySelector('[data-section-index="2"] section');
    return { top: window.scrollY + sec.getBoundingClientRect().top, H: sec.offsetHeight };
  });
  const out = {};
  for (const [p, tag] of [[0.18, 'spread'], [0.45, 'spotlight']]) {
    await page.evaluate((y) => window.scrollTo(0, y), geom.top + geom.H * p);
    await page.waitForTimeout(1400);
    const m = await page.evaluate(() => {
      const deck = document.querySelector('[data-section-index="2"] section .relative[style*="width"]');
      const dr = deck ? deck.getBoundingClientRect() : null;
      const vx = window.innerWidth / 2, vy = window.innerHeight / 2;
      const cards = Array.from(document.querySelectorAll('.deck-card'));
      let best = null, bd = Infinity;
      for (const c of cards) { const r = c.getBoundingClientRect(); const d = Math.hypot(r.left+r.width/2-vx, r.top+r.height/2-vy); if (d<bd){bd=d;best=c;} }
      const r = best.getBoundingClientRect();
      return {
        deckW: dr && Math.round(dr.width), deckH: dr && Math.round(dr.height),
        activeCardW: Math.round(r.width), activeCardH: Math.round(r.height),
        cardVsViewport: Math.round(r.width / window.innerWidth * 100) + '%',
        transform: getComputedStyle(best).transform,
      };
    });
    out[tag] = m;
  }
  console.log(`${w}x${h} ->`, JSON.stringify(out));
  await ctx.close();
}
await browser.close();
console.log('done');
