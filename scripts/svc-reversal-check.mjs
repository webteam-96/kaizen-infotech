import { chromium } from 'playwright-core';
const browser = await chromium.launch({
  channel: 'chrome',
  args: ['--use-angle=swiftshader', '--autoplay-policy=no-user-gesture-required'],
});

// Parse translateX (matrix e) of the first deck-card.
const READ = `(() => {
  const c = document.querySelector('.deck-card');
  if (!c) return null;
  const m = new DOMMatrixReadOnly(getComputedStyle(c).transform);
  return Math.round(m.m41);
})()`;

async function run(label, viewport) {
  const ctx = await browser.newContext({ viewport, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  await page.addInitScript(() => sessionStorage.setItem('kaizen-intro-seen', '1'));
  try { await page.goto('http://localhost:3000/', { waitUntil: 'networkidle', timeout: 60000 }); } catch {}
  await page.waitForTimeout(2000);
  await page.evaluate(() => window.dispatchEvent(new Event('resize')));
  await page.waitForTimeout(700);

  const top = await page.evaluate(() => {
    const el = document.querySelector('[data-section-index="2"] section');
    if (!el) return null;
    return Math.round(el.getBoundingClientRect().top + window.scrollY);
  });
  if (top == null) { console.log(label, 'NO SECTION'); await ctx.close(); return; }
  const vh = viewport.height;
  const yFor = (p) => top + p * (vh * 3);

  // Settle at p=0.55 (mid carousel), record start X.
  await page.evaluate((y) => window.scrollTo(0, y), yFor(0.55));
  await page.waitForTimeout(800);
  const x0 = await page.evaluate(READ);

  // Reverse step to p=0.45, then sample translateX over time → convergence curve.
  await page.evaluate((y) => window.scrollTo(0, y), yFor(0.45));
  const times = [50, 100, 150, 250, 400, 700];
  const samples = [];
  let prev = 0;
  for (const tms of times) {
    await page.waitForTimeout(tms - prev); prev = tms;
    samples.push({ t: tms, x: await page.evaluate(READ) });
  }
  const xEnd = samples[samples.length - 1].x;
  const total = xEnd - x0 || 1;
  // % of the move completed at each time point.
  const pct = samples.map((s) => ({ t: s.t, pctDone: Math.round(((s.x - x0) / total) * 100) }));
  console.log(label, `x0=${x0} xEnd=${xEnd} moveΔ=${xEnd - x0}`);
  console.log(label, 'reverse convergence', JSON.stringify(pct));
  await ctx.close();
}

await run('phone', { width: 390, height: 844 });
await run('ipad', { width: 820, height: 1180 });
await browser.close();
console.log('done');
