import { test, expect, devices } from '@playwright/test';

for (const name of ['iPhone 13', 'Pixel 7']) {
  test(`${name}: real viewport, native keyboard, sheet and rotation`, async ({ browser, baseURL }) => {
    const context = await browser.newContext({ ...devices[name] });
    const page = await context.newPage();
    await page.goto(`${baseURL}/tests/runtime-fixture.html?fixture=keyboard`);
    const screen = page.getByTestId('device-screen');
    await expect(screen).toHaveAttribute('data-native-phone', 'true');
    expect(await screen.boundingBox()).toMatchObject({ x: 0, y: 0, ...page.viewportSize() });
    await expect(page.locator('.phone-bezel,.status-bar,.home-indicator-svg,.keyboard-dock,.device-menu-bar')).toHaveCount(0);
    await page.getByRole('textbox', { name: 'Message', exact: true }).fill('Проверка ввода');
    await expect(page.getByRole('textbox', { name: 'Message', exact: true })).toHaveValue('Проверка ввода');
    await expect(page.locator('.keyboard-dock')).toHaveCount(0);
    await page.setViewportSize({ width: 844, height: 390 });
    await expect.poll(async () => (await screen.boundingBox())?.width).toBe(844);
    await expect.poll(async () => (await screen.boundingBox())?.height).toBe(390);
    await page.setViewportSize(devices[name].viewport);
    await page.goto(`${baseURL}/tests/runtime-fixture.html`);
    await page.getByRole('button', { name: 'Open sheet', exact: true }).click();
    const sheet = page.getByTestId('bottom-sheet');
    await expect(sheet).toBeVisible();
    await expect.poll(async () => Math.round((await sheet.boundingBox())!.y + (await sheet.boundingBox())!.height)).toBe(devices[name].viewport.height);
    await context.close();
  });
}

for (const width of [390, 1280]) {
  test(`desktop ${width}px keeps the phone preview`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/tests/runtime-fixture.html');
    await expect(page.locator('.phone-bezel')).toBeVisible();
    await expect(page.locator('.status-bar')).toBeVisible();
    await expect(page.getByTestId('device-picker')).toBeVisible();
    await expect(page.locator('[data-native-phone]')).toHaveCount(0);
  });
}

test('catalogue iframe on a phone retains its calibrated preview', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ ...devices['iPhone 13'] });
  const page = await context.newPage();
  await page.goto(`${baseURL}/tests/runtime-fixture.html`);
  await page.evaluate(() => {
    const iframe = document.createElement('iframe');
    iframe.src = '/tests/runtime-fixture.html';
    document.body.append(iframe);
  });
  await expect(page.frameLocator('iframe').locator('.phone-bezel')).toBeVisible();
  await expect(page.frameLocator('iframe').locator('[data-native-phone]')).toHaveCount(0);
  await context.close();
});
