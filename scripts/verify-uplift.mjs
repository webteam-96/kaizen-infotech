/**
 * Final verification sweep for the premium-uplift work.
 * - Desktop (1440x900) + mobile (390x844) screenshots of every route
 * - One detail page each for services / work / blog
 * - Reduced-motion pass on / and /about
 * Screenshots land in audit-shots/final/.
 *
 * Requires the dev server (or `next start`) on http://localhost:3000.
 */
import { chromium } from 'playwright';
import { mkdirSync } from 'fs';

const BASE = 'http://localhost:3000';
const OUT = 'audit-shots/final';
mkdirSync(OUT, { recursive: true });

const ROUTES = [
  ['home', '/'],
  ['about', '/about'],
  ['services', '/services'],
  ['service-detail', '/services/custom-software-development'],
  ['work', '/work'],
  ['work-detail', '/work/rotary-zones'],
  ['blog', '/blog'],
  ['blog-post', '/blog/india-largest-rotary-club-website-network'],
  ['contact', '/contact'],
  ['careers', '/careers'],
];

const browser = await chromium.launch({ args: ['--use-angle=swiftshader'] });

async function sweep(label, contextOpts, viewport) {
  const ctx = await browser.newContext({ viewport, ...contextOpts });
  const page = await ctx.newPage();
  await page.addInitScript(() => sessionStorage.setItem('kaizen-intro-seen', '1'));
  for (const [name, route] of ROUTES) {
    try {
      await page.goto(`${BASE}${route}`, { waitUntil: 'networkidle', timeout: 120000 });
      await page.waitForTimeout(2500);
      await page.screenshot({ path: `${OUT}/${label}-${name}.png`, timeout: 90000 });
      if (name === 'home') {
        // deep homepage scrolls: hero mid, post-hero sections, footer
        for (const [tag, frac] of [['mid', 0.25], ['sections', 0.6], ['footer', 1]]) {
          await page.evaluate((f) => {
            window.scrollTo(0, (document.body.scrollHeight - innerHeight) * f);
          }, frac);
          await page.waitForTimeout(2200);
          await page.screenshot({ path: `${OUT}/${label}-home-${tag}.png`, timeout: 90000 });
        }
      }
      console.log(`${label} ${name} ok`);
    } catch (err) {
      console.log(`${label} ${name} FAILED: ${err.message.split('\n')[0]}`);
    }
  }
  await ctx.close();
}

await sweep('desktop', {}, { width: 1440, height: 900 });
await sweep('mobile', {}, { width: 390, height: 844 });
await sweep('rm', { reducedMotion: 'reduce' }, { width: 1440, height: 900 });

await browser.close();
console.log('sweep complete');
