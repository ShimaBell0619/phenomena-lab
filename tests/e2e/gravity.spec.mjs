import { test, expect } from '@playwright/test';
import { writeFileSync } from 'node:fs';

let errors = [];
test.beforeEach(async ({ page }) => {
  errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('dialog', dialog => dialog.accept());
  const initial = new Date('2026-10-10T00:00:00Z');
  await page.clock.install({ time: initial });
  await page.clock.pauseAt(new Date(initial.getTime() + 1000));
});
test.afterEach(() => { expect(errors, 'ブラウザエラーがない').toEqual([]); });

test('GRAVITYの主要操作・停止区間・3画面幅・keyboard', async ({ page }, info) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const response = await page.goto('/');
  expect(response.status()).toBe(200);
  await expect(page.getByRole('heading', { name: '物体を調べる' })).toBeVisible();
  await expect(page.locator('canvas')).toBeVisible();
  const bodies = page.locator('.body-row');
  const clock = page.locator('.scene-status strong').nth(1);
  const time = async () => Number(await clock.textContent());
  await expect(bodies).toHaveCount(2);
  await page.clock.runFor(1000);
  await expect.poll(time).toBeGreaterThan(0);
  await page.getByRole('button', { name: /一時停止/ }).click();
  await expect(page.getByRole('button', { name: /再生/ })).toBeVisible();
  // アプリの160ms表示周期を仮想時計で進め、停止後の表示を更新する。
  await page.clock.runFor(200);
  const paused = await time();
  await page.clock.runFor(1000);
  await expect(clock).toHaveText(paused.toFixed(2));
  await page.getByRole('button', { name: '1ステップ' }).click();
  // 表示は小数2桁。正確なdtの契約はphysics単体testで検査する。
  await expect.poll(time).toBeGreaterThan(paused);
  await page.getByRole('button', { name: '全体表示' }).click();
  for (const [name, count] of [['Binary Dance', 2], ['Three-Body', 3], ['Single Orbit', 2]]) {
    await page.getByLabel('実験プリセット').selectOption(name);
    await expect(bodies).toHaveCount(count);
  }
  await page.getByRole('button', { name: /一時停止/ }).click();
  await expect(page.getByRole('button', { name: '1ステップ' })).toBeEnabled();
  const rect = await page.locator('canvas').boundingBox();
  expect(rect.width).toBeGreaterThan(100); expect(rect.height).toBeGreaterThan(100);
  const x = rect.x + rect.width * .76, y = rect.y + rect.height * .74;
  await page.mouse.move(x, y); await page.mouse.down();
  await page.mouse.move(x + 38, y - 35, { steps: 8 }); await page.mouse.up();
  await expect(bodies).toHaveCount(3);
  await page.getByRole('button', { name: /新しい物体を追加/ }).click();
  await page.locator('.disclosure + form').getByRole('button', { name: /物体を追加/ }).click();
  await expect(bodies).toHaveCount(4);
  const editor = page.locator('section.inspector-section form.form-grid').first();
  await editor.getByLabel('質量 [単位]').fill('12');
  await editor.getByRole('button', { name: '数値を適用' }).click();
  await expect(page.locator('.selected-summary')).toContainText('12.00');
  await page.getByRole('button', { name: '保存', exact: true }).click();
  await expect(page.locator('.feedback')).toContainText('保存');
  await page.reload();
  await expect(page.getByRole('heading', { name: '物体を調べる' })).toBeVisible();
  await page.getByRole('button', { name: '保存した実験を開く' }).click();
  await expect(bodies).toHaveCount(4);
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: width === 1440 ? 900 : 844 });
    // resize後のCanvas camera更新も、wall-clock sleepでなくRAFを進める。
    await page.clock.runFor(200);
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
    await expect(page.getByRole('button', { name: '全体表示' })).toBeVisible();
    await expect(page.getByRole('button', { name: '保存', exact: true })).toBeVisible();
    await page.screenshot({ path: info.outputPath(`viewport-${width}.png`), fullPage: true });
  }
  await page.getByRole('button', { name: '初期状態に戻す' }).click();
  await expect(bodies).toHaveCount(2);
  await page.getByRole('button', { name: 'モデルについて' }).focus();
  await page.keyboard.press('Tab');
  const pause = page.getByRole('button', { name: /一時停止/ });
  await expect(pause).toBeFocused();
  await expect(pause).toHaveCSS('outline-width', '3px');
  await page.keyboard.press('Space');
  await expect(page.getByRole('button', { name: /再生/ })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(pause).toBeVisible();
  writeFileSync(info.outputPath('evidence.json'), JSON.stringify({
    url: page.url(), checkoutSha: process.env.GITHUB_SHA || null,
    deploymentId: process.env.DEPLOYMENT_ID || null, sourceSha: process.env.SOURCE_SHA || null,
    runId: process.env.GITHUB_RUN_ID || null, viewports: [320, 390, 1440],
  }, null, 2));
});

test('停止した軌道の小数座標を維持したまま質量を適用できる', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: '物体を調べる' })).toBeVisible();
  await page.clock.runFor(1000);
  await page.getByRole('button', { name: /一時停止/ }).click();
  const editor = page.locator('section.inspector-section form.form-grid').first();
  const x = editor.getByLabel('X [単位]', { exact: true });
  await expect(x).toBeVisible();
  expect(await x.evaluate(input => input.validity.stepMismatch)).toBe(false);
  const coordinate = await x.inputValue();
  await editor.getByLabel('質量 [単位]').fill('12');
  await editor.getByRole('button', { name: '数値を適用' }).click();
  await expect(page.locator('.selected-summary')).toContainText('12.00');
  await expect(page.locator('.feedback')).toHaveText('物体の値を適用しました。');
  await expect(x).toHaveValue(coordinate);
});
