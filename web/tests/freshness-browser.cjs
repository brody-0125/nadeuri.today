// Run after npm run build, serving out/ at FRESHNESS_TEST_URL (default port 8765).
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', headless: true, args: ['--no-sandbox'] });
  try {
    const page = await browser.newPage();
    const now = new Date('2026-11-09T06:00:00Z');
    await page.clock.install({ time: now });
    const original = JSON.parse(fs.readFileSync(path.join(__dirname, '../public/data/latest.json')));
    let snapshot = {
      ...original, summary: {}, updated_at: new Date(+now - 179 * 60_000).toISOString(),
      is_stale: false, data_age_minutes: 179,
      collected_at_by_type: { elevator: new Date(+now - 179 * 60_000).toISOString() },
    };
    await page.route('**/data/latest.json', route => route.fulfill({ json: snapshot }));
    const base = process.env.FRESHNESS_TEST_URL || 'http://127.0.0.1:8765';
    await page.goto(`${base}/ko/`);
    await page.getByRole('status').filter({ hasText: '최근 수집' }).waitFor();
    await page.clock.fastForward(2 * 60_000);
    await page.getByRole('status').filter({ hasText: '현장 확인 권장' }).waitFor();
    assert.equal(await page.locator('.animate-ping').count(), 0);
    snapshot = { ...snapshot, updated_at: now.toISOString(), collected_at_by_type: {
      elevator: now.toISOString(), escalator: new Date(+now - 4 * 60 * 60_000).toISOString(),
    }};
    await page.goto(`${base}/ko/faults/`);
    await page.getByRole('status').filter({ hasText: '4시간 전 데이터' }).waitFor();
    await page.goto(`${base}/ko/station/0150/`);
    await page.getByRole('status').filter({ hasText: '현장 확인 권장' }).waitFor();
    snapshot = { ...snapshot, collected_at_by_type: { elevator: null } };
    await page.goto(`${base}/en/`);
    await page.getByRole('status').filter({ hasText: 'Collection time unknown' }).waitFor();
    assert.equal(await page.locator('.animate-ping').count(), 0);
    console.log('PASS: Chromium timer transition, mixed-source age, three page banners, localized unknown timestamp.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
