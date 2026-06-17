import { chromium } from 'playwright-core';
import { mkdirSync } from 'fs';

const BASE = 'http://localhost:3000';
const OUT = 'audit-shots/rc-stack';
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ channel: 'chrome', args: ['--use-angle=swiftshader'] });

// width: 390 (phone), 768 (iPad portrait) should stack; 1024 (iPad landscape) must NOT.
for (const w of [390, 768, 1024]) {
  const h = w === 1024 ? 768 : (w === 768 ? 1024 : 844);
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  const page = await ctx.newPage();
  await page.addInitScript(() => sessionStorage.setItem('kaizen-intro-seen', '1'));
  try { await page.goto(BASE + '/', { waitUntil: 'load', timeout: 45000 }); } catch {}
  await page.waitForTimeout(4000);

  const geom = await page.evaluate(() => {
    const sp = document.querySelector('[data-scroll-spacer]');
    const top = sp ? window.scrollY + sp.getBoundingClientRect().top : 0;
    const H = sp ? sp.offsetHeight : document.body.scrollHeight;
    return { top, H };
  });

  // Sample scroll fractions covering s1..s4 (the alternating sections).
  const fracs = [0.24, 0.32, 0.40, 0.48, 0.56, 0.64];
  for (const f of fracs) {
    await page.evaluate((y) => window.scrollTo(0, y), geom.top + f * geom.H);
    await page.waitForTimeout(1100); // let smoothCubeY + card easing settle
    const info = await page.evaluate(() => {
      const cards = [...document.querySelectorAll('[data-card]')];
      let best = null, bo = 0;
      for (const c of cards) {
        const o = parseFloat(getComputedStyle(c).opacity) || 0;
        if (o > bo) { bo = o; best = c; }
      }
      if (!best || bo < 0.4) return { card: null, op: +bo.toFixed(2) };
      const r = best.getBoundingClientRect();
      const midPct = Math.round(((r.top + r.height / 2) / window.innerHeight) * 100);
      return { card: best.getAttribute('data-card'), op: +bo.toFixed(2), midPct, half: midPct < 50 ? 'TOP' : 'BOTTOM' };
    });
    const tag = `${w}-${String(Math.round(f * 100)).padStart(2, '0')}`;
    await page.screenshot({ path: `${OUT}/${tag}.png` });
    console.log(`${w}px f=${f}  card=${info.card} op=${info.op} mid=${info.midPct ?? '-'}% ${info.half ?? ''}`);
  }
  await ctx.close();
}
await browser.close();
console.log('done');
