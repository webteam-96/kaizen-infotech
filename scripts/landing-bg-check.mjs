import { chromium } from 'playwright-core';

const browser = await chromium.launch({ channel: 'chrome', args: ['--use-angle=swiftshader', '--autoplay-policy=no-user-gesture-required'] });

async function shot(vw, vh, name) {
  const ctx = await browser.newContext({ viewport: { width: vw, height: vh } });
  const page = await ctx.newPage();
  await page.addInitScript(() => sessionStorage.setItem('kaizen-intro-seen', '1'));
  await page.goto('http://localhost:3000/', { waitUntil: 'load', timeout: 60000 });
  // Give Spline + video time to load and the GSAP tick to set opacity.
  await page.waitForTimeout(6000);
  const info = await page.evaluate(() => {
    const v = document.querySelector('video[src="/videos/landing-background.mp4"]') ||
      [...document.querySelectorAll('video')].find((el) => el.currentSrc.includes('landing-background'));
    if (!v) return { found: false };
    const cs = getComputedStyle(v);
    return {
      found: true,
      opacity: cs.opacity,
      objectFit: cs.objectFit,
      readyState: v.readyState,
      videoW: v.videoWidth,
      videoH: v.videoHeight,
      paused: v.paused,
      rectW: Math.round(v.getBoundingClientRect().width),
      rectH: Math.round(v.getBoundingClientRect().height),
    };
  });
  console.log(name, JSON.stringify(info));
  await page.screenshot({ path: `audit-shots/landing-bg/${name}.png` });
  await ctx.close();
}

await shot(1440, 900, 'desktop');
await shot(390, 844, 'mobile');
await shot(820, 1180, 'ipad');
await browser.close();
console.log('done');
