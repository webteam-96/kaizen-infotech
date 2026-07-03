import { chromium } from 'playwright-core';
const browser = await chromium.launch({ channel: 'chrome', args: ['--use-angle=swiftshader', '--autoplay-policy=no-user-gesture-required'] });

// reducedMotion disables Lenis (scrollTo honoured); ServiceDeckTouch has no RM
// branch so its scrub render still runs. We walk the pinned section and, at each
// progress, find which card is centred in the viewport + its opacity. Expect the
// centred index to advance 0→4 (cards pan horizontally) and the centred card to
// be fully opaque/readable.
async function run(label, viewport) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: 2, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  await page.addInitScript(() => sessionStorage.setItem('kaizen-intro-seen', '1'));
  try { await page.goto('http://localhost:3000/services', { waitUntil: 'domcontentloaded', timeout: 30000 }); } catch {}
  try { await page.waitForSelector('.card-red-accent', { timeout: 20000 }); } catch {}
  await page.waitForTimeout(2500);

  const geo = await page.evaluate(() => {
    const cards = [...document.querySelectorAll('.card-red-accent')].filter((c) => c.closest('.sticky'));
    if (!cards.length) return null;
    const container = cards[0].closest('.sticky').parentElement;
    const r = container.getBoundingClientRect();
    return { top: Math.round(r.top + window.scrollY), h: Math.round(r.height), vh: window.innerHeight, vw: window.innerWidth, n: cards.length, cardW: Math.round(cards[0].getBoundingClientRect().width) };
  });
  if (!geo) { console.log(`${label}: NO track cards`); await ctx.close(); return; }
  const scrollLen = geo.h - geo.vh;
  console.log(`\n${label} vw=${geo.vw} cardW=${geo.cardW} (${(geo.cardW / geo.vw * 100).toFixed(0)}% of width) cards=${geo.n}`);

  const sample = () => page.evaluate(() => {
    const cards = [...document.querySelectorAll('.card-red-accent')].filter((c) => c.closest('.sticky'));
    const cx = window.innerWidth / 2;
    return cards.map((c) => {
      const r = c.getBoundingClientRect();
      return { off: Math.round(r.left + r.width / 2 - cx), op: +(+getComputedStyle(c).opacity).toFixed(2) };
    });
  });

  for (let k = 0; k <= 10; k++) {
    const p = k / 10;
    await page.evaluate((yy) => window.scrollTo(0, yy), Math.round(geo.top + p * scrollLen));
    await page.waitForTimeout(550);
    const d = await sample();
    // focused = card whose centre is nearest the viewport centre
    let fi = 0, best = Infinity;
    d.forEach((c, i) => { if (Math.abs(c.off) < best) { best = Math.abs(c.off); fi = i; } });
    console.log(`p=${p.toFixed(1)} | focused card ${fi + 1} (offset ${d[fi].off}px, op ${d[fi].op}) | offsets: ${d.map((c) => c.off).join(', ')}`);
  }
  await ctx.close();
}

await run('PHONE-390', { width: 390, height: 844 });
await run('IPAD-820 ', { width: 820, height: 1180 });
await browser.close();
console.log('\ndone');
