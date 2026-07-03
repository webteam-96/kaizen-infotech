import { chromium } from 'playwright-core';
import { mkdirSync } from 'fs';
const OUT = 'audit-shots/svc-uniform';
mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', args: ['--use-angle=swiftshader', '--autoplay-policy=no-user-gesture-required'] });

async function run(label, viewport, forceTouch) {
  const ctx = await browser.newContext({ viewport, isMobile: !!forceTouch, hasTouch: !!forceTouch, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  await page.addInitScript(() => sessionStorage.setItem('kaizen-intro-seen', '1'));
  if (forceTouch) {
    // Headless Chrome reports hover/fine even when isMobile — force the desktop
    // capability query to fail so the compact (touch) path runs.
    await page.addInitScript(() => {
      const orig = window.matchMedia.bind(window);
      window.matchMedia = (q) => (q.includes('hover: hover') ? { matches: false, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, onchange: null, dispatchEvent() { return false; } } : orig(q));
    });
  }
  try { await page.goto('http://localhost:3000/', { waitUntil: 'networkidle', timeout: 60000 }); } catch {}
  await page.waitForTimeout(1500);

  const info = await page.evaluate(() => {
    const sec = document.querySelector('[data-section-index="2"] section');
    return { top: Math.round(sec.getBoundingClientRect().top + window.scrollY), h: sec.offsetHeight };
  });

  // Walk the carousel; capture box vs content gap symmetry per visible card.
  const read = () => page.evaluate(() => {
    const cards = [...document.querySelectorAll('.deck-card')];
    const out = [];
    for (const card of cards) {
      const cardEl = card.querySelector('.card-services');
      if (!cardEl) continue;
      const inner = cardEl.lastElementChild?.firstElementChild; // flex justify-center group
      const cr = cardEl.getBoundingClientRect();
      const ir = inner?.getBoundingClientRect();
      const m = new DOMMatrixReadOnly(getComputedStyle(card).transform);
      const sx = m.a || 1;
      if (!ir || +getComputedStyle(card).opacity < 0.6) continue;
      out.push({
        op: +(+getComputedStyle(card).opacity).toFixed(2),
        boxH: Math.round(cr.height / sx),
        contentH: Math.round(ir.height / sx),
        topGap: Math.round((ir.top - cr.top) / sx),
        botGap: Math.round((cr.bottom - ir.bottom) / sx),
      });
    }
    return out;
  });

  let shot = 0;
  for (const frac of [0.18, 0.5, 0.82]) {
    await page.evaluate((a) => window.scrollTo(0, a.info.top + (a.info.h - window.innerHeight) * a.frac), { info, frac });
    await page.waitForTimeout(700);
    const d = await read();
    console.log(`${label} frac ${frac}:`, JSON.stringify(d));
    await page.screenshot({ path: `${OUT}/${label}-${shot++}.png` });
  }
  await ctx.close();
}

await run('desktop', { width: 1900, height: 1000 }, false);
await run('ipad', { width: 820, height: 1180 }, true);
await run('phone', { width: 390, height: 844 }, true);
await browser.close();
console.log('done');
