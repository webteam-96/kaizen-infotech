import { chromium } from 'playwright-core';
const browser = await chromium.launch({ channel: 'chrome', args: ['--use-angle=swiftshader'] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.addInitScript(() => sessionStorage.setItem('kaizen-intro-seen', '1'));
try { await page.goto('http://localhost:3000/about', { waitUntil: 'networkidle', timeout: 60000 }); } catch {}
await page.waitForTimeout(1200);

const res = await page.evaluate(() => {
  const out = { redAccentRules: [], servicesRules: [], afterStyle: null };
  for (const sheet of document.styleSheets) {
    let rules;
    try { rules = sheet.cssRules; } catch { continue; }
    for (const r of rules) {
      const t = r.cssText || '';
      if (t.includes('card-red-accent')) out.redAccentRules.push(t.slice(0, 120));
      if (t.includes('card-services::after')) out.servicesRules.push(t.slice(0, 120));
    }
  }
  const el = document.querySelector('.card-red-accent');
  if (el) {
    const cs = getComputedStyle(el, '::after');
    out.afterStyle = { content: cs.content, height: cs.height, bg: cs.backgroundImage.slice(0, 50), position: cs.position };
    out.hostPosition = getComputedStyle(el).position;
    out.hostOverflow = getComputedStyle(el).overflow;
  }
  return out;
});
console.log(JSON.stringify(res, null, 2));
await browser.close();
