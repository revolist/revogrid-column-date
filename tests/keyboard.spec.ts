import { test, expect, type Page } from '@playwright/test';
async function open(page: Page, query = '') {
  await page.goto('/tests/editor.html' + query);
  const cell = page.locator('[data-rgrow="0"][data-rgcol="0"]').first();
  await cell.click();
  await page.keyboard.press('Enter');
  return page.locator('.revo-float input.revo-date-input');
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
  await expect(page.locator('.revo-date-dialog')).toBeHidden();
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
  await page.locator('.revo-date-toggle').click();
  await expect(page.locator('.revo-date-dialog')).toBeVisible();
  await page.getByRole('gridcell', { name: /20 November 2026/ }).click();
  await expect(page.locator('.revo-float')).toHaveCount(0);
  expect(
    await page.locator('revo-grid').evaluate((el: any) => el.source[0].date),
  ).toBe('2026-11-20');
  await page.goto('/tests/editor.html?calendar');
  await page.locator('[data-rgrow="0"][data-rgcol="0"]').first().dblclick();
  const defaultPicker = page.getByRole('dialog');
  await expect(defaultPicker.getByRole('grid')).toBeVisible();
  expect(await defaultPicker.evaluate(dialog => dialog.contains(document.activeElement))).toBe(true);
  const month = defaultPicker.getByRole('combobox', { name: 'Choose month' });
  await month.click();
  await defaultPicker.getByRole('option', { name: 'Dec', exact: true }).click();
  await expect(defaultPicker.getByRole('grid', { name: /December 2026/ })).toBeVisible();
  await month.click();
  await defaultPicker.getByRole('option', { name: 'Nov', exact: true }).click();
  await defaultPicker.getByRole('gridcell', { name: /20 November 2026/ }).click();
  await expect(page.locator('.revo-date-editor')).toHaveCount(0);
  expect(await page.locator('revo-grid').evaluate(grid => grid.source[0].date))
    .toBe('2026-11-20');
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
    await page.locator('.revo-date-toggle').click();
    await page.getByRole('gridcell', { name: /21 November 2026/ }).click();
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
  await expect(page.locator('.revo-date-dialog')).toBeVisible();
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


test('retains custom date adapters without a mask', async ({ page }) => {
  const input = await open(page, '?custom');
  await expect(input).toHaveValue('11.11.2026');
  await input.fill('20.11.2026'); await page.keyboard.press('Enter');
  await expect.poll(() => page.locator('revo-grid').evaluate((el: any) => el.source[0].date)).toBe('2026-11-20');
});

test.describe('Date display west of UTC', () => {
  test.use({ timezoneId: 'America/Los_Angeles' });

  test('tabbing out of an untouched date preserves its timestamp', async ({ page }) => {
    await page.goto('/tests/editor.html?asDate');
    const grid = page.locator('revo-grid');
    await grid.evaluate(el => {
      el.source = [{ date: new Date('2026-11-11T23:15:16Z'), next: 'next' }];
    });
    const cell = page.locator('[data-rgrow="0"][data-rgcol="0"]').first();
    await cell.dblclick();
    await expect(page.locator('.revo-date-input')).toHaveValue('2026-11-11');
    await page.keyboard.press('Tab');
    await expect(page.locator('.revo-date-input')).toHaveCount(0);
    expect(await grid.evaluate(el => el.source[0].date.toISOString()))
      .toBe('2026-11-11T23:15:16.000Z');
  });

  test('displays the same day before and after reopening', async ({ page }) => {
    const input = await open(page, '?asDate');
    const cell = page.locator('[data-rgrow="0"][data-rgcol="0"]').first();
    await input.fill('2026-11-20');
    await page.keyboard.press('Enter');
    await expect(input).toHaveCount(0);
    await expect(cell.locator('.cell-value-wrapper')).toHaveText('2026-11-20');
    await cell.dblclick();
    await expect(input).toHaveValue('2026-11-20');
  });
});

test('rejects dates outside the supported calendar years', async ({ page }) => {
  const input = await open(page, '?unbounded');
  await input.fill('0099-01-01');
  await page.keyboard.press('Enter');
  await expect(input).toHaveValue('0099-01-01');
  await expect(input).toHaveAttribute('aria-invalid', 'true');
  expect(await page.locator('revo-grid').evaluate(grid => grid.source[0].date))
    .toBe('2026-11-11');
});

test('rejects a custom adapter date that would roll into a different month', async ({ page }) => {
  const input = await open(page, '?custom');
  await input.fill('00.12.2026');
  await page.keyboard.press('Enter');
  await expect(input).toHaveAttribute('aria-invalid', 'true');
  expect(await page.locator('revo-grid').evaluate(grid => grid.source[0].date))
    .toBe('2026-11-11');
});

test('opens the calendar directly from the grid cell calendar button', async ({ page }) => {
  await page.goto('/tests/editor.html');
  const cell = page.locator('[data-rgrow="0"][data-rgcol="0"]').first();
  await cell.locator('button.calendar').click();
  await expect(page.locator('.revo-date-dialog')).toBeVisible();
  await page.getByRole('gridcell', { name: /20 November 2026/ }).click();
  await expect(cell.locator('.cell-value-wrapper')).toHaveText('2026-11-20');
  await cell.dblclick();
  await expect(page.locator('.revo-date-input')).toBeFocused();
  await expect(page.locator('.revo-date-dialog')).toBeHidden();
});

test('preserves the first digit when typing starts the edit', async ({ page }) => {
  await page.goto('/tests/editor.html');
  await page.locator('[data-rgrow="0"][data-rgcol="0"]').first().click();
  await page.keyboard.press('2');
  const input = page.locator('.revo-date-input');
  await expect(input).toBeFocused();
  await expect(input).toHaveValue('2');
  await page.keyboard.type('0261120');
  await expect(input).toHaveValue('2026-11-20');
});

test('forward Delete crosses the mask separator', async ({ page }) => {
  const input = await open(page);
  await input.fill('2026-11-20');
  await input.evaluate((el: HTMLInputElement) => el.setSelectionRange(4, 4));
  await page.keyboard.press('Delete');
  await expect(input).toHaveValue('2026-12-0');
});

test('composition keys do not trigger grid navigation or cancellation', async ({ page }) => {
  const input = await open(page);
  for (const key of ['Escape', 'Tab']) {
    await input.dispatchEvent('keydown', { key, code: key, isComposing: true });
    await expect(input).toBeFocused();
  }
  await page.keyboard.press('Escape');
  await expect(input).toHaveCount(0);
});

test('a canceled cell calendar request leaves the next edit keyboard-first', async ({ page }) => {
  await page.goto('/tests/editor.html');
  const grid = page.locator('revo-grid');
  const cell = page.locator('[data-rgrow="0"][data-rgcol="0"]').first();
  await grid.evaluate(el => {
    el.addEventListener('beforeeditstart', event => event.preventDefault(), { once: true });
  });
  await cell.locator('button.calendar').click();
  const input = page.locator('.revo-date-input');
  await expect(input).toHaveCount(0);
  // Move off the button so Enter starts a grid edit instead of activating it.
  await cell.click({ position: { x: 20, y: 10 } });
  await page.keyboard.press('Enter');
  await expect(input).toBeFocused();
  await expect(page.locator('.revo-date-dialog')).toBeHidden();
});

test('shows a stored early year without silently changing its century', async ({ page }) => {
  await page.goto('/tests/editor.html?unbounded');
  const grid = page.locator('revo-grid');
  await grid.evaluate(el => {
    el.source = [{ date: '0099-01-01', next: 'next' }];
  });
  await page.locator('[data-rgrow="0"][data-rgcol="0"]').first().dblclick();
  const input = page.locator('.revo-date-input');
  await expect(input).toHaveValue('0099-01-01');
  await page.keyboard.press('Escape');
  await expect(input).toHaveCount(0);
  expect(await grid.evaluate(el => el.source[0].date)).toBe('0099-01-01');
});

test('clicking outside or pressing Escape dismisses the calendar and preserves the draft', async ({ page }) => {
  const input = await open(page, '?localized');
  await input.fill('2026-11');
  await page.keyboard.press('Alt+ArrowDown');

  const picker = page.getByRole('dialog', { name: 'Datum wählen' });
  await expect(picker).toBeVisible();
  await expect(picker.getByRole('grid')).toHaveCount(1);
  await expect(picker.getByRole('button', { name: 'Schließen' })).toHaveCount(0);
  await expect(picker.getByRole('gridcell', { name: /13\. November 2026/ })).toBeDisabled();

  await page.mouse.click(5, 5);
  await expect(picker).toBeHidden();
  await expect(input).toBeFocused();
  await expect(input).toHaveValue('2026-11');

  await page.keyboard.press('Alt+ArrowDown');
  await expect(picker).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(picker).toBeHidden();
  await expect(input).toBeFocused();
  await expect(input).toHaveValue('2026-11');
  expect(await page.locator('revo-grid').evaluate(grid => grid.source[0].date))
    .toBe('2026-11-11');
  await input.fill('2026-11-20');
  await page.keyboard.press('Enter');
  await expect(input).toHaveCount(0);
  expect(await page.locator('revo-grid').evaluate(grid => grid.source[0].date))
    .toBe('2026-11-20');
});

test('the floating editor inherits grid typography and bundles dropdown styles', async ({ page }) => {
  await page.goto('/tests/editor.html');
  const grid = page.locator('revo-grid');
  await grid.evaluate(el => {
    el.style.fontFamily = 'monospace';
  });
  await page.locator('[data-rgrow="0"][data-rgcol="0"]').first().dblclick();
  const input = page.locator('.revo-date-input');
  await expect(input).toHaveCSS('font-family', 'monospace');

  await page.getByRole('button', { name: 'Choose date' }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toHaveCSS('font-family', 'monospace');
  await dialog.getByRole('combobox', { name: 'Choose month' }).click();
  const option = dialog.getByRole('option', { name: 'Nov', exact: true });
  await expect(option).toHaveCSS('list-style-type', 'none');
  await expect(option).toHaveCSS('font-family', 'monospace');
});
