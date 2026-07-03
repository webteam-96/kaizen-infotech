import { chromium } from 'playwright-core';

const browser = await chromium.launch({ channel: 'chrome', args: ['--use-angle=swiftshader', '--autoplay-policy=no-user-gesture-required'] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.addInitScript(() => sessionStorage.setItem('kaizen-intro-seen', '1'));
await page.goto('http://localhost:3000/', { waitUntil: 'load', timeout: 60000 });
await page.waitForTimeout(6000);

const readOpacity = () =>
  page.evaluate(() => {
    const v = [...document.querySelectorAll('video')].find((el) => el.currentSrc.includes('landing-background'));
    return v ? Number(getComputedStyle(v).opacity).toFixed(3) : 'n/a';
  });

console.log('at rest         opacity=', await readOpacity());
await page.screenshot({ path: 'audit-shots/landing-bg/fade-0-rest.png' });

// Press Enter → triggers the "play like a video" dive (zoom into the screen).
await page.keyboard.press('Enter');

for (const [ms, label] of [[700, 'a-early'], [1300, 'b-mid'], [2200, 'c-late'], [3400, 'd-done']]) {
  await page.waitForTimeout(label === 'a-early' ? ms : 600);
  console.log(`${label.padEnd(8)} opacity=`, await readOpacity());
  await page.screenshot({ path: `audit-shots/landing-bg/fade-${label}.png` });
}

await browser.close();
console.log('done');
