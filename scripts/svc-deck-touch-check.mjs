import { chromium } from 'playwright-core';
const browser = await chromium.launch({ channel: 'chrome', args: ['--use-angle=swiftshader', '--autoplay-policy=no-user-gesture-required'] });

// reducedMotion:'reduce' disables Lenis (so scrollTo is honoured); ServiceDeckTouch
// has no RM branch, so its scrub timeline still runs on native scroll. We walk the
// pinned capabilities section and sample each deck card's translateY (vh%) + opacity.
async function run(label, viewport, mode) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: 2, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  await page.addInitScript(() => sessionStorage.setItem('kaizen-intro-seen', '1'));
  try { await page.goto('http://localhost:3000/services', { waitUntil: 'domcontentloaded', timeout: 30000 }); } catch {}
  try { await page.waitForSelector('.card-red-accent', { timeout: 20000 }); } catch {}
  await page.waitForTimeout(2500);

  const geo = await page.evaluate(() => {
    const deckCards = [...document.querySelectorAll('.card-red-accent')].filter((c) => getComputedStyle(c).position === 'absolute');
    if (!deckCards.length) return null;
    const sticky = deckCards[0].closest('.sticky');
    const container = sticky?.parentElement;
    const r = container.getBoundingClientRect();
    return { top: Math.round(r.top + window.scrollY), h: Math.round(r.height), vh: window.innerHeight, n: deckCards.length };
  });
  if (!geo) { console.log(`${label}: NO deck cards`); await ctx.close(); return; }
  const scrollLen = geo.h - geo.vh;
  console.log(`\n${label} [${mode}] cards=${geo.n} sectionH=${geo.h} vh=${geo.vh}`);

  const sample = () => page.evaluate(() => {
    const cards = [...document.querySelectorAll('.card-red-accent')].filter((c) => getComputedStyle(c).position === 'absolute');
    const vh = window.innerHeight;
    return cards.map((c) => {
      const m = new DOMMatrixReadOnly(getComputedStyle(c).transform);
      return { y: +((m.f / vh) * 100).toFixed(0), x: Math.round(m.e), op: +(+getComputedStyle(c).opacity).toFixed(2) };
    });
  });

  for (let k = 0; k <= 10; k++) {
    const p = k / 10;
    await page.evaluate((yy) => window.scrollTo(0, yy), Math.round(geo.top + p * scrollLen));
    await page.waitForTimeout(650);
    const d = await sample();
    // center = |y%|<22 and op>0.6
    const centered = d.map((c, i) => (Math.abs(c.y) < 22 && c.op > 0.6 ? i + 1 : null)).filter(Boolean);
    const ops = d.map((c) => c.op.toFixed(2)).join(' ');
    console.log(`p=${p.toFixed(1)} | centered cards: [${centered.join(',')}] | op: ${ops}`);
  }
  await ctx.close();
}

await run('PHONE-390', { width: 390, height: 844 }, 'solo');
await run('IPAD-820 ', { width: 820, height: 1180 }, 'row');
await browser.close();
console.log('\ndone');
