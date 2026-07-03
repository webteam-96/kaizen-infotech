import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';

const OUT = 'audit-shots/colors';
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({
  channel: 'chrome',
  args: ['--use-angle=swiftshader', '--autoplay-policy=no-user-gesture-required'],
});
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.addInitScript(() => sessionStorage.setItem('kaizen-intro-seen', '1'));
await page.goto('http://localhost:3000/', { waitUntil: 'load', timeout: 60000 });
await page.waitForTimeout(5000);

// Names by data-section-index (0 = Rubik hero handled separately)
const names = {
  1: 'brandpromise-TINT',
  2: 'services-AURA',
  3: 'stats-DARK',
  4: 'featuredwork-TINT',
  5: 'process-AURA',
  6: 'industries-DARK',
  7: 'tech-TINT',
  8: 'why-AURA',
  9: 'cta-DARK',
};

for (const [idx, name] of Object.entries(names)) {
  const el = page.locator(`[data-section-index="${idx}"]`).first();
  await el.scrollIntoViewIfNeeded().catch(() => {});
  await page.waitForTimeout(900);
  // Sample the top-edge seam + background colour at the section box.
  const info = await el.evaluate((node) => {
    const cs = getComputedStyle(node);
    const before = getComputedStyle(node, '::before');
    return {
      bgColor: cs.backgroundColor,
      hasBgImage: cs.backgroundImage !== 'none',
      seamImg: before.backgroundImage !== 'none' ? before.backgroundImage.slice(0, 60) : 'none',
    };
  });
  console.log(`#${idx} ${name}: bg=${info.bgColor} img=${info.hasBgImage} seam=${info.seamImg}`);
  await page.screenshot({ path: `${OUT}/${idx}-${name}.png` });
}

await browser.close();
console.log('\ndone');
