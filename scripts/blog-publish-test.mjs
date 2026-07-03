import { chromium } from 'playwright-core';
const browser = await chromium.launch({ channel: 'chrome', args: ['--use-angle=swiftshader'] });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await ctx.newPage();
const log = (...a) => console.log(...a);

const blogHasTesting = async () => {
  await page.goto(`http://localhost:3000/blog?x=${Date.now()}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(1500);
  return (await page.locator('h2:has-text("Testing"), h3:has-text("Testing")').count()) > 0;
};

try {
  await page.goto('http://localhost:3000/admin/blogs', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForSelector('input[type=password]', { timeout: 20000 });
  await page.fill('input[type=password]', 'kaizen-admin-2026');
  await page.click('button:has-text("Unlock")');
  await page.waitForSelector('text=Manage Blogs', { timeout: 20000 });
  await page.waitForTimeout(800);

  const before = await blogHasTesting();
  log('“Testing” on /blog BEFORE publish:', before, '(expected false — it is a draft)');

  // Click the new green Publish button on the Testing row.
  await page.goto('http://localhost:3000/admin/blogs', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('text=Manage Blogs', { timeout: 15000 });
  const row = page.locator('tr', { hasText: '/blog/testing' });
  await row.getByRole('button', { name: 'Publish' }).click();
  await page.waitForTimeout(900);

  const after = await blogHasTesting();
  log('“Testing” on /blog AFTER publish:', after, '(expected true)');

  log(!before && after ? 'RESULT: PASS ✓' : 'RESULT: FAIL ✗');
} catch (err) {
  log('ERROR:', err.message);
} finally {
  await browser.close();
  log('done');
}
