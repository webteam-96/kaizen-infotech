import { chromium } from 'playwright-core';
import { mkdirSync } from 'fs';
const OUT = 'audit-shots/service-mobile';
mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', args: ['--use-angle=swiftshader'] });

// <820 => responsive carousel (NEW); >=820 => desktop carousel (must be unchanged)
for (const w of [360, 390, 414, 768, 819, 820, 1024, 1280]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 820 } });
  const page = await ctx.newPage();
  await page.addInitScript(() => sessionStorage.setItem('kaizen-intro-seen', '1'));
  try { await page.goto('http://localhost:3000/', { waitUntil: 'load', timeout: 45000 }); } catch {}
  await page.waitForTimeout(2500);

  // Locate the services pinned section and advance to ~16% (spread done, card 0
  // centered in the spotlight) so the deck is visible.
  const geom = await page.evaluate(() => {
    const wrap = document.querySelector('[data-section-index="2"]');
    const sec = wrap ? wrap.querySelector('section') : null;
    const top = sec ? window.scrollY + sec.getBoundingClientRect().top : 0;
    const H = sec ? sec.offsetHeight : 0;
    return { top, H };
  });
  await page.evaluate((y) => window.scrollTo(0, y), geom.top + geom.H * 0.16);
  await page.waitForTimeout(1400);

  const info = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('.deck-card'));
    if (!cards.length) return { err: 'no deck-card' };
    // Pick the card whose center is nearest viewport center (the spotlight one).
    const vx = window.innerWidth / 2, vy = window.innerHeight / 2;
    let best = null, bestD = Infinity;
    for (const c of cards) {
      const r = c.getBoundingClientRect();
      const d = Math.hypot(r.left + r.width / 2 - vx, r.top + r.height / 2 - vy);
      if (d < bestD) { bestD = d; best = c; }
    }
    const r = best.getBoundingClientRect();
    const art = best.querySelector('article');
    const h3 = best.querySelector('h3');
    const p = best.querySelector('p');
    const icon = best.querySelector('div[class*="rounded-"]');
    const cs = (el) => el ? getComputedStyle(el) : null;
    const ar = art ? art.getBoundingClientRect() : null;
    const deck = document.querySelector('[data-section-index="2"] section .relative[style*="width"]');
    const dr = deck ? deck.getBoundingClientRect() : null;
    return {
      visibleCardW: Math.round(r.width), visibleCardH: Math.round(r.height),
      opacity: cs(best).opacity,
      articleW: ar && Math.round(ar.width), articleH: ar && Math.round(ar.height),
      deckW: dr && Math.round(dr.width), deckH: dr && Math.round(dr.height),
      pad: art && cs(art).padding,
      title: h3 && cs(h3).fontSize, body: p && cs(p).fontSize,
      iconW: icon && cs(icon).width,
      overflowRight: Math.round(r.right - window.innerWidth),
    };
  });
  console.log(`${w}px ->`, JSON.stringify(info));
  await page.screenshot({ path: `${OUT}/svc-${w}.png` });
  await ctx.close();
}
await browser.close();
console.log('done');
