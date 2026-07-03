import { chromium } from 'playwright-core';

const browser = await chromium.launch({ channel: 'chrome', args: ['--use-angle=swiftshader'] });
const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
await page.addInitScript(() => sessionStorage.setItem('kaizen-intro-seen', '1'));

for (const url of ['/services', '/about', '/careers']) {
  await page.goto('http://localhost:3000' + url, { waitUntil: 'load', timeout: 45000 });
  await page.waitForTimeout(1500);
  const r = await page.evaluate(() => {
    const root = getComputedStyle(document.documentElement);
    const px = (v) => {
      const probe = document.createElement('div');
      probe.style.fontSize = v;
      document.body.appendChild(probe);
      const out = Math.round(parseFloat(getComputedStyle(probe).fontSize) * 10) / 10;
      probe.remove();
      return out;
    };
    return {
      eyebrowToken: root.getPropertyValue('--h-eyebrow').trim(),
      sectionToken: root.getPropertyValue('--h-section').trim(),
      eyebrowPx: px('var(--h-eyebrow)'),
      sectionPx: px('var(--h-section)'),
    };
  });
  console.log(url, '→ eyebrow', r.eyebrowPx + 'px', '| section', r.sectionPx + 'px');
  console.log('   tokens:', r.eyebrowToken, '||', r.sectionToken);
}
await browser.close();
console.log('done');
