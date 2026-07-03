import { chromium } from 'playwright-core';
const browser = await chromium.launch({ channel: 'chrome', args: ['--use-angle=swiftshader'] });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 1000 } });
const page = await ctx.newPage();
const log = (...a) => console.log(...a);

try {
  // 1. Blog list shows all 10
  await page.goto(`http://localhost:3000/blog?x=${Date.now()}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(2000);
  const cards = await page.locator('a[href^="/blog/"]').count();
  const hasQA = await page.locator('text=Best Practices for QA Testing').count();
  const hasZ = await page.locator('text=Z Funds').count();
  log('blog list — post links:', cards, '| QA post:', hasQA > 0, '| Z Funds post:', hasZ > 0);

  // 2. Category filter "Mobile Development" → 4 posts
  await page.getByRole('button', { name: 'Mobile Development' }).click();
  await page.waitForTimeout(800);
  const mobileCards = await page.locator('a[href^="/blog/"]').count();
  log('Mobile Development filter — posts shown:', mobileCards, '(expected 4)');

  // 3. Detail page renders content + table + image
  await page.goto('http://localhost:3000/blog/best-practices-for-qa-testing-delivering-high-quality-software-with-confidence', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(1800);
  const heading = await page.locator('text=Top 10 Best Practices for QA Testing').count();
  const tables = await page.locator('article.prose-custom table').count();
  const bodyImgs = await page.locator('article.prose-custom img').count();
  const heroLoaded = await page.evaluate(() => {
    const img = document.querySelector('main img');
    return img ? img.naturalWidth > 0 : false;
  });
  const date = await page.locator('text=April 23, 2025').count();
  log('detail — heading:', heading > 0, '| tables:', tables, '| body imgs:', bodyImgs, '| hero loaded:', heroLoaded, '| date shown:', date > 0);

  const pass = cards >= 10 && hasQA && hasZ && mobileCards === 4 && heading > 0 && tables >= 1 && date > 0;
  log(pass ? 'RESULT: PASS ✓' : 'RESULT: CHECK ✗');
} catch (err) {
  log('ERROR:', err.message);
} finally {
  await browser.close();
  log('done');
}
