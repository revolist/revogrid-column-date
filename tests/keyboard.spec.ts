import { test, expect, type Page } from '@playwright/test';
async function open(page: Page, query = '') {
  await page.goto('/tests/editor.html' + query);
  const cell = page.locator('[data-rgrow="0"][data-rgcol="0"]').first();
  await cell.click();
  await page.keyboard.press('Enter');
  return page.locator('.revo-float input.duet-date__input');
}
test('keyboard-first mode focuses/selects and stages masked typing until Tab, then navigates', async ({
  page,
}) => {
  const input = await open(page);
  await expect(input).toBeFocused();
  expect(
    await input.evaluate((el: HTMLInputElement) => [
      el.selectionStart,
      el.selectionEnd,
    ]),
  ).toEqual([0, 10]);
  await expect(page.locator('.duet-date__dialog')).toBeHidden();
  await page.keyboard.type('20261120');
  await expect(input).toHaveValue('2026-11-20');
  expect(
    await page.locator('revo-grid').evaluate((el: any) => el.source[0].date),
  ).toBe('2026-11-11');
  await page.keyboard.press('Tab');
  await expect(page.locator('.revo-float')).toHaveCount(0);
  expect(
    await page.locator('revo-grid').evaluate((el: any) => el.source[0].date),
  ).toBe('2026-11-20');
  expect(
    await page
      .locator('revo-grid')
      .evaluate(async (el: any) => (await el.getFocused()).column.prop),
  ).toBe('next');
});
test('invalid dates stay editable and Escape cancels', async ({
  page,
}) => {
  const input = await open(page);
  for (const text of ['2026-02-30', '2026-11-13', '2026-11-', '2026-12-01']) {
    await input.fill(text);
    await page.keyboard.press('Enter');
    await expect(input).toBeFocused();
    await expect(input).toHaveAttribute('aria-invalid', 'true');
  }
  await input.fill('2026-11-21');
  await page.keyboard.press('Escape');
  await expect(page.locator('.revo-float')).toHaveCount(0);
  expect(
    await page.locator('revo-grid').evaluate((el: any) => el.source[0].date),
  ).toBe('2026-11-11');
});
test('calendar remains available and default calendar-first behavior remains unchanged', async ({
  page,
}) => {
  await open(page);
  await page.locator('.duet-date__toggle').click();
  await expect(page.locator('.duet-date__dialog')).toBeVisible();
  await page.getByRole('button', { name: '20 November', exact: true }).click();
  await expect(page.locator('.revo-float')).toHaveCount(0);
  expect(
    await page.locator('revo-grid').evaluate((el: any) => el.source[0].date),
  ).toBe('2026-11-20');
  await page.goto('/tests/editor.html?calendar');
  await page.locator('[data-rgrow="0"][data-rgcol="0"]').first().dblclick();
  await expect(page.locator('.duet-date__dialog')).toBeVisible();
});
test.describe('Date storage east of UTC', () => {
  test.use({ timezoneId: 'Europe/Helsinki' });

  test('typed and picked dates reopen on the saved day', async ({ page }) => {
    const input = await open(page, '?asDate');
    const grid = page.locator('revo-grid');
    const cell = page.locator('[data-rgrow="0"][data-rgcol="0"]').first();

    await input.fill('2026-11-20');
    await page.keyboard.press('Enter');
    await expect(input).toHaveCount(0);
    expect(await grid.evaluate((el: any) => el.source[0].date.toISOString()))
      .toBe('2026-11-20T00:00:00.000Z');

    await cell.dblclick();
    await expect(input).toHaveValue('2026-11-20');
    await page.locator('.duet-date__toggle').click();
    await page.getByRole('button', { name: '21 November', exact: true }).click();
    await expect(input).toHaveCount(0);
    await cell.dblclick();
    await expect(input).toHaveValue('2026-11-21');
  });
});

test('rejects impossible dates in keyboard-first mode without a mask', async ({ page }) => {
  const input = await open(page, '?noMask');
  await input.fill('2026-02-30');
  await page.keyboard.press('Enter');
  await expect(input).toBeFocused();
  await expect(input).toHaveValue('2026-02-30');
  expect(await page.locator('revo-grid').evaluate((el: any) => el.source[0].date))
    .toBe('2026-11-11');
});

test('calendar-first keeps its custom adapter even with the mask option', async ({ page }) => {
  const input = await open(page, '?calendar&custom&mask');
  await expect(page.locator('.duet-date__dialog')).toBeVisible();
  await expect(input).toHaveValue('11.11.2026');
});

test('Shift+Tab moves left, clearing is staged, and removed grids release floating editors', async ({
  page,
}) => {
  const input = await open(page);
  await input.fill('20261121');
  await expect(input).toHaveValue('2026-11-21');
  await page.keyboard.press('Tab');
  await expect(page.locator('.revo-float')).toHaveCount(0);
  await expect
    .poll(() =>
      page
        .locator('revo-grid')
        .evaluate(async (el: any) => (await el.getFocused()).column.prop),
    )
    .toBe('next');
  await page.keyboard.press('Enter');
  await expect(page.locator('revogr-edit input')).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(page.locator('revogr-edit')).toHaveCount(0);
  await expect
    .poll(() =>
      page
        .locator('revo-grid')
        .evaluate(async (el: any) => (await el.getFocused()).column.prop),
    )
    .toBe('date');
  await page.keyboard.press('Enter');
  await expect(input).toBeFocused();
  await input.fill('');
  await expect(input).toHaveValue('');
  expect(
    await page.locator('revo-grid').evaluate((el: any) => el.source[0].date),
  ).toBe('2026-11-21');
  await page.keyboard.press('Enter');
  await expect
    .poll(() =>
      page.locator('revo-grid').evaluate((el: any) => el.source[0].date),
    )
    .toBe('');
  await page.locator('[data-rgrow="0"][data-rgcol="0"]').first().dblclick();
  await expect(input).toBeVisible();
  await page.locator('revo-grid').evaluate((el) => el.remove());
  await expect(page.locator('.revo-float')).toHaveCount(0);
});


test('retains custom Duet adapters without a mask', async ({ page }) => {
  const input = await open(page, '?custom');
  await expect(input).toHaveValue('11.11.2026');
  await input.fill('20.11.2026'); await page.keyboard.press('Enter');
  await expect.poll(() => page.locator('revo-grid').evaluate((el: any) => el.source[0].date)).toBe('2026-11-20');
});
