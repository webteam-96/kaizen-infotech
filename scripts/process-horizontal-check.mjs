import { chromium } from 'playwright-core';
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

  const info = await page.evaluate(() => {
    const sec = document.querySelector('[data-section-index="5"]');
    if (!sec) return null;
    const track = sec.querySelector('div.flex.h-full');
    const cont = track?.parentElement;
    return {
      secTop: Math.round(sec.getBoundingClientRect().top + window.scrollY),
      overflowX: cont ? getComputedStyle(cont).overflowX : null,
      scrollWidth: track ? track.scrollWidth : null,
      iw: window.innerWidth,
    };
  });
  if (!info) { console.log(label, 'NO SECTION'); await ctx.close(); return; }
  const travel = Math.max(1, info.scrollWidth - info.iw);
  console.log(label, 'overflowX=', info.overflowX, 'travel=', travel);

  const read = () => page.evaluate(() => {
    const sec = document.querySelector('[data-section-index="5"]');
    const track = sec.querySelector('div.flex.h-full');
    const fill = sec.querySelector('.origin-left');
    const tx = track ? new DOMMatrixReadOnly(getComputedStyle(track).transform).m41 : null;
    const sx = fill ? new DOMMatrixReadOnly(getComputedStyle(fill).transform).m11 : null;
    return { trackX: tx == null ? null : Math.round(tx), railScaleX: sx == null ? null : +sx.toFixed(2) };
  });

  const samples = [];
  for (const frac of [0, 0.25, 0.5, 0.75, 1.0]) {
    await page.evaluate((y) => window.scrollTo(0, y), info.secTop + frac * travel);
    await page.waitForTimeout(500);
    samples.push({ frac, ...(await read()) });
  }
  console.log(label, JSON.stringify(samples));
  await ctx.close();
}

await run('phone', { width: 390, height: 844 });
await browser.close();
console.log('done');
