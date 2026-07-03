import { chromium } from 'playwright-core';
const browser = await chromium.launch({ channel: 'chrome', args: ['--use-angle=swiftshader'] });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await ctx.newPage();
const log = (...a) => console.log(...a);

try {
  // 1. Admin gate
  await page.goto('http://localhost:3000/admin/blogs', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForSelector('input[type=password]', { timeout: 20000 });
  await page.fill('input[type=password]', 'kaizen-admin-2026');
  await page.click('button:has-text("Unlock")');

  await page.waitForSelector('text=Manage Blogs', { timeout: 20000 });
  await page.waitForTimeout(800);
  const rowsBefore = await page.locator('tbody tr').count();
  log('rows before:', rowsBefore);

  // 2. Create a new post
  await page.click('a:has-text("New Post")');
  await page.waitForSelector('text=New blog post', { timeout: 15000 });
  await page.fill('input[placeholder="The blog title"]', 'Playwright Test Post');
  const editor = page.locator('.rich-editor');
  await editor.click();
  await page.keyboard.type('This is a test paragraph created by the automated check.');
  await page.selectOption('select', 'published');
  await page.click('button:has-text("Save")');

  // 3. Back on the manage list
  await page.waitForURL('**/admin/blogs', { timeout: 20000 });
  await page.waitForTimeout(1000);
  const rowsAfter = await page.locator('tbody tr').count();
  const inList = await page.locator('td:has-text("Playwright Test Post")').count();
  log('rows after:', rowsAfter, '| in admin list:', inList > 0);

  // 4. Public blog list reflects it (reads public/data/blogs.json)
  await page.goto('http://localhost:3000/blog', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(1800);
  const onBlog = await page.locator('text=Playwright Test Post').count();
  log('appears on /blog:', onBlog > 0);

  // 5. Detail page renders the body
  await page.goto('http://localhost:3000/blog/playwright-test-post', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(1200);
  const bodyOk = await page.locator('text=test paragraph created by the automated check').count();
  log('detail body renders:', bodyOk > 0);

  const pass = rowsAfter === rowsBefore + 1 && inList > 0 && onBlog > 0 && bodyOk > 0;
  log(pass ? 'RESULT: PASS ✓' : 'RESULT: FAIL ✗');
} catch (err) {
  log('ERROR:', err.message);
} finally {
  await browser.close();
  log('done');
}
