import { chromium } from 'playwright-core';
import { mkdirSync } from 'fs';
const OUT = 'audit-shots/service-rise';
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({
  channel: 'chrome',
  args: ['--use-angle=swiftshader', '--autoplay-policy=no-user-gesture-required'],
});

async function run(label, viewport) {
  const ctx = await browser.newContext({
    viewport,
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 2,
  });
  const page = await ctx.newPage();
  await page.addInitScript(() => sessionStorage.setItem('kaizen-intro-seen', '1'));
  try { await page.goto('http://localhost:3000/', { waitUntil: 'networkidle', timeout: 60000 }); } catch {}
  // Let GSAP/ScrollTrigger init, then nudge a resize so the deck re-measures
  // its compact height (covers the URL-bar-collapse resize real phones get).
  await page.waitForTimeout(2000);
  await page.evaluate(() => window.dispatchEvent(new Event('resize')));
  await page.waitForTimeout(800);

  const geom = await page.evaluate(() => {
    const deck = document.querySelector('.deck-card')?.parentElement;
    const r = deck?.getBoundingClientRect();
    return { deckW: r ? Math.round(r.width) : null, deckH: r ? Math.round(r.height) : null, vh: window.innerHeight };
  });
  console.log(label, 'deck', JSON.stringify(geom));

  const top = await page.evaluate(() => {
    const el = document.querySelector('[data-section-index="2"] section');
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return Math.round(r.top + window.scrollY);
  });
  if (top == null) { console.log(label, 'NO SECTION'); await ctx.close(); return; }

  const vh = viewport.height;
  const frac = [0.01, 0.03, 0.05, 0.08, 0.10, 0.45];
  for (let i = 0; i < frac.length; i++) {
    const y = top + frac[i] * (vh * 4);
    try {
      await page.evaluate((yy) => window.scrollTo(0, yy), y);
      await page.waitForTimeout(450);
      const card = await page.evaluate(() => {
        const c = document.querySelector('.deck-card');
        if (!c) return null;
        const r = c.getBoundingClientRect();
        return { top: Math.round(r.top), bottom: Math.round(r.bottom), op: getComputedStyle(c).opacity };
      });
      console.log(label, `p=${frac[i]}`, JSON.stringify(card));
      await page.screenshot({ path: `${OUT}/${label}-${String(i).padStart(2,'0')}-p${frac[i]}.png` });
    } catch (e) {
      console.log(label, `p=${frac[i]}`, 'ERR', e.message.split('\n')[0]);
    }
  }
  await ctx.close();
}

await run('phone', { width: 390, height: 844 });
await run('ipad', { width: 820, height: 1180 });

await browser.close();
console.log('done');
