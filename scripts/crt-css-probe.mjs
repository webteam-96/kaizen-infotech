import { chromium } from 'playwright-core';
const browser = await chromium.launch({ channel: 'chrome', args: ['--use-angle=swiftshader'] });
const page = await (await browser.newContext()).newPage();
await page.addInitScript(() => sessionStorage.setItem('kaizen-intro-seen','1'));
try { await page.goto('http://localhost:3000/', { waitUntil:'load', timeout:45000 }); } catch {}
await page.waitForTimeout(3000);
const r = await page.evaluate(() => {
  let line=false, blink=false, total=0;
  for (const ss of document.styleSheets) {
    try { for (const rule of ss.cssRules) { total++;
      if (rule.selectorText === '.rc-crt-line') line = true;
      if (rule.type === CSSRule.KEYFRAMES_RULE && rule.name === 'rc-crt-blink') blink = true;
      // also detect spline-float as a sanity check that rc- rules load
    } } catch {}
  }
  // sanity: is .rc-spline-float present?
  let sf=false;
  for (const ss of document.styleSheets){ try { for (const rule of ss.cssRules){ if(rule.selectorText==='.rc-spline-float') sf=true; } } catch {} }
  return { lineRulePresent: line, blinkKeyframesPresent: blink, splineFloatPresent: sf, totalRules: total };
});
console.log(JSON.stringify(r));
await browser.close();
