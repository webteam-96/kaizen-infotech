import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';
mkdirSync('audit-shots/featwork', { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', args: ['--use-angle=swiftshader', '--autoplay-policy=no-user-gesture-required'] });

// reducedMotion:'reduce' disables Lenis (SmoothScroll skips it under RM) so
// window.scrollTo is honoured directly; FeaturedWork has no RM branch, so its
// layout + scroll-scrubbed card animation are unchanged — only the scroll driver
// differs. We scroll to card-0's opacity peak (progress ≈ 0.1) and shoot.
async function shot(label, viewport) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: 2, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  await page.addInitScript(() => sessionStorage.setItem('kaizen-intro-seen', '1'));
  try { await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded', timeout: 30000 }); } catch {}
  await page.waitForTimeout(2500);

  // Locate the FeaturedWork scroll area (the 350vh div that contains the sticky stack).
  const geo = await page.evaluate(() => {
    const span = [...document.querySelectorAll('span')].find((s) => s.textContent.trim() === 'Selected Work');
    if (!span) return null;
    const section = span.closest('section');
    const scrollArea = section.querySelector('.sticky')?.parentElement; // the height:350vh div
    const r = scrollArea.getBoundingClientRect();
    return { top: Math.round(r.top + window.scrollY), h: Math.round(r.height), vh: window.innerHeight };
  });
  if (!geo) { console.log(label, 'NOT FOUND'); await ctx.close(); return; }

  const scrollLen = geo.h - geo.vh;
  // card 0 peaks at progress 0.1 (peak = (0+0.5)/5).
  const y = Math.round(geo.top + 0.1 * scrollLen);
  await page.evaluate((yy) => window.scrollTo(0, yy), y);
  await page.waitForTimeout(900);

  // Report the actual rendered layout of card-0: flex-direction + image box size.
  const info = await page.evaluate(() => {
    const card = document.querySelector('.card-work');
    if (!card) return null;
    const cr = card.getBoundingClientRect();
    const dir = getComputedStyle(card).flexDirection;
    const imgBox = card.firstElementChild.getBoundingClientRect();
    const content = card.children[1];
    const just = getComputedStyle(content).justifyContent;
    const desc = content.querySelector('p');
    return {
      dir,
      cardH: Math.round(cr.height),
      imgH: Math.round(imgBox.height),
      imgPctOfCard: +((imgBox.height / cr.height) * 100).toFixed(0),
      contentJustify: just,
      descLineHeight: getComputedStyle(desc).lineHeight,
    };
  });
  console.log(`${label} (${viewport.width}x${viewport.height}):`, JSON.stringify(info));
  await page.screenshot({ path: `audit-shots/featwork/${label}.png` });
  await ctx.close();
}

await shot('phone-390', { width: 390, height: 844 });
await shot('phone-se-375x667', { width: 375, height: 667 });
await shot('ipad-820', { width: 820, height: 1180 });
await shot('desktop-1440', { width: 1440, height: 900 });
await browser.close();
console.log('done');
