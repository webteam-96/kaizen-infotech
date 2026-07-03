import { chromium } from 'playwright-core';
const browser = await chromium.launch({ channel: 'chrome', args: ['--use-angle=swiftshader', '--autoplay-policy=no-user-gesture-required'] });

// Scroll-FREE check. At scrollY=0 the carousel's render(0) puts deck card-0 into
// Phase 1 at t=0: translateY = POPUP_RISE, scale = (compact ? 0.85 : forced 0.5).
// So we can read the card transform straight after load and confirm the new
// compact entrance values are LIVE — no Lenis scroll needed.
//   compact (phone/iPad, width<1024 → DESKTOP_MEDIA false): expect y≈0.16×vh, scale≈0.85
//   desktop (1440):                                          expect y≈80,      scale≈0.50
async function check(label, viewport, expectCompact) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  await page.addInitScript(() => sessionStorage.setItem('kaizen-intro-seen', '1'));
  try { await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded', timeout: 30000 }); } catch {}
  try { await page.waitForSelector('.deck-card', { timeout: 20000 }); } catch {}
  await page.waitForTimeout(1800);

  const d = await page.evaluate(() => {
    const card = document.querySelector('.deck-card');
    if (!card) return null;
    const m = new DOMMatrixReadOnly(getComputedStyle(card).transform);
    return {
      count: document.querySelectorAll('.deck-card').length,
      y: Math.round(m.f),
      scale: +m.a.toFixed(3),
      vh: window.innerHeight,
    };
  });
  if (!d) { console.log(`${label}: NO deck-card`); await ctx.close(); return; }

  const expRise = expectCompact ? Math.round(d.vh * 0.16) : 80;
  const expScale = expectCompact ? 0.85 : 0.5;
  const yOK = Math.abs(d.y - expRise) <= Math.max(8, expRise * 0.12);
  const sOK = Math.abs(d.scale - expScale) <= 0.04;
  console.log(`${label} (${viewport.width}x${viewport.height}): y=${d.y} (exp~${expRise}) scale=${d.scale} (exp~${expScale}) cards=${d.count} → ${yOK && sOK ? 'OK ✓' : 'MISMATCH ✗'}`);
  await ctx.close();
}

await check('phone-390 ', { width: 390, height: 844 }, true);
await check('phone-se  ', { width: 375, height: 667 }, true);
await check('ipad-820  ', { width: 820, height: 1180 }, true);
await check('desktop   ', { width: 1440, height: 900 }, false);
await browser.close();
console.log('done');
