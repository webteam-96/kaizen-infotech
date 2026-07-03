import { chromium } from 'playwright-core';

const browser = await chromium.launch({ channel: 'chrome', args: ['--use-angle=swiftshader'] });
const page = await (await browser.newContext({ viewport: { width: 1280, height: 900 } })).newPage();
await page.addInitScript(() => sessionStorage.setItem('kaizen-intro-seen', '1'));

async function probe(url) {
  await page.goto('http://localhost:3000' + url, { waitUntil: 'load', timeout: 45000 });
  await page.waitForTimeout(2200);
  return page.evaluate(() => {
    const round = (n) => Math.round(n * 10) / 10;
    // Eyebrows: uppercase spans/p using the --h-eyebrow token-ish (small uppercase)
    const eyebrows = [];
    document.querySelectorAll('span,p,div').forEach((el) => {
      const cs = getComputedStyle(el);
      if (cs.textTransform === 'uppercase' && el.children.length === 0) {
        const t = (el.textContent || '').trim();
        if (t && t.length < 40 && parseFloat(cs.letterSpacing) > 1) {
          eyebrows.push({ t: t.slice(0, 26), fs: round(parseFloat(cs.fontSize)) });
        }
      }
    });
    const h2s = [];
    document.querySelectorAll('h2').forEach((h) => {
      const cs = getComputedStyle(h);
      const t = (h.textContent || '').trim().replace(/\s+/g, ' ');
      if (t) h2s.push({ t: t.slice(0, 38), fs: round(parseFloat(cs.fontSize)), w: cs.fontWeight });
    });
    return { eyebrows: eyebrows.slice(0, 6), h2s };
  });
}

for (const url of ['/services', '/about', '/careers', '/blog', '/work', '/']) {
  const r = await probe(url);
  console.log('\n===== ' + url + ' =====');
  console.log(' EYEBROWS (red):');
  r.eyebrows.forEach((e) => console.log(`   ${String(e.fs).padStart(5)}px  ${e.t}`));
  console.log(' H2 TITLES (blue/green):');
  r.h2s.forEach((h) => console.log(`   ${String(h.fs).padStart(5)}px  w=${h.w}  ${h.t}`));
}
await browser.close();
console.log('\ndone');
