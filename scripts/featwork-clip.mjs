import { chromium } from 'playwright-core';
const browser = await chromium.launch({ channel: 'chrome', args: ['--use-angle=swiftshader'] });

// Clip check. With justify-end, if the content block is TALLER than its flex
// area the overflow is pushed past the TOP (under the image) and clipped. That
// is a pure layout question — independent of the GSAP wrapper transform — so we
// just read scrollHeight vs clientHeight of the content column, plus the spare
// space. spare >= 0 and no overflow = safe, text fully visible.
async function check(label, viewport) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  await page.addInitScript(() => sessionStorage.setItem('kaizen-intro-seen', '1'));
  try { await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded', timeout: 30000 }); } catch {}
  try { await page.waitForSelector('.card-work', { timeout: 20000 }); } catch {}
  await page.waitForTimeout(1500);

  const data = await page.evaluate(() => {
    const cards = [...document.querySelectorAll('.card-work')];
    return cards.map((card) => {
      const content = card.children[1];
      const cs = getComputedStyle(content);
      const padTop = parseFloat(cs.paddingTop), padBot = parseFloat(cs.paddingBottom);
      const innerAvail = content.clientHeight - padTop - padBot; // flex area for the text
      const contentNeeded = content.scrollHeight - padTop - padBot;
      return {
        cardH: Math.round(card.getBoundingClientRect().height),
        flexDir: getComputedStyle(card).flexDirection,
        innerAvail: Math.round(innerAvail),
        contentNeeded: Math.round(contentNeeded),
        spare: Math.round(innerAvail - contentNeeded),
        overflow: content.scrollHeight > content.clientHeight + 1,
      };
    });
  });
  if (!data.length) { console.log(`${label}: NO card-work found`); await ctx.close(); return; }
  const worst = data.reduce((a, b) => (b.spare < a.spare ? b : a), data[0]);
  const anyOverflow = data.some((d) => d.overflow);
  console.log(`${label}: ${data.length} cards, dir=${data[0].flexDir}, worst spare=${worst.spare}px, anyOverflow=${anyOverflow} → ${!anyOverflow && worst.spare >= 0 ? 'NO CLIP ✓' : 'CLIP RISK ✗'}`);
  await ctx.close();
}

await check('phone-390     ', { width: 390, height: 844 });
await check('phone-SE-667  ', { width: 375, height: 667 });
await check('phone-tiny-640', { width: 360, height: 640 });
await check('ipad-820      ', { width: 820, height: 1180 });
await check('desktop-1440  ', { width: 1440, height: 900 });
await browser.close();
console.log('done');
