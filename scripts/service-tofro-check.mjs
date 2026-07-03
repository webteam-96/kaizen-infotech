import { chromium } from 'playwright-core';
import { mkdirSync } from 'fs';
const OUT = 'audit-shots/service-tofro';
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({
  channel: 'chrome',
  args: ['--use-angle=swiftshader', '--autoplay-policy=no-user-gesture-required'],
});

async function run(label, viewport) {
  const ctx = await browser.newContext({ viewport, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  await page.addInitScript(() => sessionStorage.setItem('kaizen-intro-seen', '1'));
  try { await page.goto('http://localhost:3000/', { waitUntil: 'networkidle', timeout: 60000 }); } catch {}
  await page.waitForTimeout(2000);
  await page.evaluate(() => window.dispatchEvent(new Event('resize')));
  await page.waitForTimeout(800);

  const geom = await page.evaluate(() => {
    const deck = document.querySelector('.deck-card')?.parentElement;
    const r = deck?.getBoundingClientRect();
    const card = document.querySelector('.card-services');
    const cs = card ? getComputedStyle(card) : null;
    const desc = card?.querySelector('p');
    const ds = desc ? getComputedStyle(desc) : null;
    return {
      deckW: r ? Math.round(r.width) : null,
      deckH: r ? Math.round(r.height) : null,
      cardPad: cs?.padding, descFont: ds?.fontSize, vh: window.innerHeight,
    };
  });
  console.log(label, 'geom', JSON.stringify(geom));

  const top = await page.evaluate(() => {
    const el = document.querySelector('[data-section-index="2"] section');
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return Math.round(r.top + window.scrollY);
  });
  if (top == null) { console.log(label, 'NO SECTION'); await ctx.close(); return; }

  const vh = viewport.height;
  // A 400vh section with a 100vh sticky pane scrolls only 300vh to span
  // progress 0→1, so map progress→scrollY with vh*3 (NOT vh*4).
  const sample = async (p, dir) => {
    await page.evaluate((yy) => window.scrollTo(0, yy), top + p * (vh * 3));
    await page.waitForTimeout(650);
    const cards = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('.deck-card')).map((c) => {
        const cs = getComputedStyle(c);
        return { op: +(+cs.opacity).toFixed(2), vis: cs.visibility };
      });
    });
    // Report the most-visible card's opacity + whether any card is hidden.
    const maxOp = Math.max(...cards.map((c) => c.op));
    const anyHidden = cards.some((c) => c.vis === 'hidden');
    return { p, dir, maxOp, anyHidden };
  };

  // Phase map: P1=0.10 popup · P2=0.25 spread · P3=0.80 carousel · P4=0.95 fade.
  // 0.83 & 0.90 land squarely inside the phase-4 fade-out (the reversibility fix).
  const fwd = [0.05, 0.15, 0.50, 0.83, 0.90, 0.98];
  const fwdRes = [];
  for (const p of fwd) fwdRes.push(await sample(p, 'fwd'));
  // Reverse pass: come back up through phase 4 → phase 3 → phase 1.
  const bwd = [0.90, 0.83, 0.50, 0.15];
  const bwdRes = [];
  for (const p of bwd) bwdRes.push(await sample(p, 'bwd'));

  console.log(label, 'FWD', JSON.stringify(fwdRes));
  console.log(label, 'BWD', JSON.stringify(bwdRes));

  // Compare fwd vs bwd at matching progress (should be ~identical now).
  const fp = Object.fromEntries(fwdRes.map((r) => [r.p, r]));
  for (const r of bwdRes) {
    const f = fp[r.p];
    if (f) {
      const dOp = Math.abs(f.maxOp - r.maxOp).toFixed(2);
      const visMatch = f.anyHidden === r.anyHidden;
      console.log(label, `p=${r.p} fwd.op=${f.maxOp} bwd.op=${r.maxOp} dOp=${dOp} visSym=${visMatch} bwdHidden=${r.anyHidden}`);
    }
  }
  await ctx.close();
}

await run('phone', { width: 390, height: 844 });
await run('ipad', { width: 820, height: 1180 });
await browser.close();
console.log('done');
