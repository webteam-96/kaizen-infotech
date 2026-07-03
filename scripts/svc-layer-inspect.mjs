import { chromium } from 'playwright-core';
const browser = await chromium.launch({ channel: 'chrome', args: ['--use-angle=swiftshader', '--autoplay-policy=no-user-gesture-required'] });
const ctx = await browser.newContext({ viewport: { width: 1900, height: 1000 }, deviceScaleFactor: 1 });
const page = await ctx.newPage();
await page.addInitScript(() => sessionStorage.setItem('kaizen-intro-seen', '1'));
try { await page.goto('http://localhost:3000/', { waitUntil: 'networkidle', timeout: 60000 }); } catch {}
await page.waitForTimeout(1500);

// Scroll into the services section spread/carousel phase so a card is spotlit.
const info = await page.evaluate(() => {
  const sec = document.querySelector('[data-section-index="2"] section');
  return { top: Math.round(sec.getBoundingClientRect().top + window.scrollY), h: sec.offsetHeight };
});
const read = () => page.evaluate(() => {
  const cards = [...document.querySelectorAll('.deck-card')];
  const out = [];
  for (const card of cards) {
    const cardEl = card.querySelector('.card-services');
    if (!cardEl) continue;
    const content = cardEl.lastElementChild; // relative z-10 wrapper
    const inner = content?.firstElementChild; // flex flex-1 flex-col
    const cr = cardEl.getBoundingClientRect();
    const ir = inner?.getBoundingClientRect();
    // unscale: divide measured by the live transform scale so we get CSS px box
    const m = new DOMMatrixReadOnly(getComputedStyle(card).transform);
    const sx = m.a || 1;
    out.push({
      op: +getComputedStyle(card).opacity.slice(0, 4),
      scale: +sx.toFixed(2),
      cardH_css: cr.height ? Math.round(cr.height / sx) : null,
      contentH_css: ir ? Math.round(ir.height / sx) : null,
      gapBelow_css: ir ? Math.round((cr.bottom - ir.bottom) / sx) : null,
    });
  }
  return out;
});

for (const frac of [0.12, 0.3, 0.5, 0.7]) {
  await page.evaluate((arg) => window.scrollTo(0, arg.sec.top + (arg.sec.h - window.innerHeight) * arg.frac), { sec: info, frac });
  await page.waitForTimeout(700);
  const d = await read();
  const vis = d.filter((c) => c.op > 0.5);
  console.log(`frac ${frac}:`, JSON.stringify(vis));
}
await browser.close();
