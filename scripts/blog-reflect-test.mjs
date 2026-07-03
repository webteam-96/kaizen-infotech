import { chromium } from 'playwright-core';
const browser = await chromium.launch({ channel: 'chrome', args: ['--use-angle=swiftshader'] });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await ctx.newPage();
page.on('dialog', (d) => d.accept()); // auto-accept delete confirm
const log = (...a) => console.log(...a);

const blogHas = async (text) => {
  await page.goto(`http://localhost:3000/blog?x=${Date.now()}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(1500);
  return (await page.locator(`text=${text}`).count()) > 0;
};

try {
  await page.goto('http://localhost:3000/admin/blogs', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForSelector('input[type=password]', { timeout: 20000 });
  await page.fill('input[type=password]', 'kaizen-admin-2026');
  await page.click('button:has-text("Unlock")');
  await page.waitForSelector('text=Manage Blogs', { timeout: 20000 });
  await page.waitForTimeout(800);

  // ── EDIT ──────────────────────────────────────────────────────────────
  const editRow = page.locator('tr', { hasText: 'why-indian-enterprises-choose-aspnet-2026' });
  await editRow.getByTitle('Edit').click();
  await page.waitForSelector('text=Edit blog post', { timeout: 15000 });
  await page.fill('input[placeholder="The blog title"]', 'Reflect Edit Check');
  await page.click('button:has-text("Save")');
  await page.waitForURL('**/admin/blogs', { timeout: 20000 });
  const editReflects = await blogHas('Reflect Edit Check');
  log('EDIT reflects on /blog:', editReflects);

  // ── HIDE ──────────────────────────────────────────────────────────────
  await page.goto('http://localhost:3000/admin/blogs', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('text=Manage Blogs', { timeout: 15000 });
  const hideRow = page.locator('tr', { hasText: 'event-registration-systems-under-pressure' });
  await hideRow.getByTitle('Hide').click();
  await page.waitForTimeout(800);
  const hideReflects = !(await blogHas('Building Event Registration Systems'));
  log('HIDE removes from /blog:', hideReflects);

  // ── DELETE ────────────────────────────────────────────────────────────
  await page.goto('http://localhost:3000/admin/blogs', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('text=Manage Blogs', { timeout: 15000 });
  const delRow = page.locator('tr', { hasText: 'digitising-government-port-pension-system' });
  await delRow.getByTitle('Delete').click();
  await page.waitForTimeout(800);
  const deleteReflects = !(await blogHas('Digitising a Government Port'));
  log('DELETE removes from /blog:', deleteReflects);

  log(editReflects && hideReflects && deleteReflects ? 'RESULT: PASS ✓' : 'RESULT: FAIL ✗');
} catch (err) {
  log('ERROR:', err.message);
} finally {
  await browser.close();
  log('done');
}
