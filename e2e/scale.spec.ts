import { test, expect } from '@playwright/test';
import { switchRole, listenConsoleErrors } from './helpers';

test.describe('Scale Mode — 300-Return Reviewer Queue', () => {
  test('1. Validates 300-return scale dataset toggle, metrics, search, and pagination', async ({ page }) => {
    const consoleErrors = listenConsoleErrors(page);

    await page.goto('/dashboard/reviewer');
    await switchRole(page, 'reviewer');

    // Select scale dataset
    const datasetSelect = page.getByLabel(/dataset:/i);
    await datasetSelect.selectOption('scale');

    // 1. Scale mode banner visible
    await expect(page.getByText(/300 fictional returns represented/i)).toBeVisible();

    // 2. Metrics updated for 300 returns
    await expect(page.getByText(/of 300 total scale returns/i)).toBeVisible();

    // 3. Queue card count on page 1 <= 25
    const links = page.getByRole('link', { name: /view scale detail/i });
    const count = await links.count();
    expect(count).toBeGreaterThan(0);
    expect(count).toBeLessThanOrEqual(25);

    // 4. Pagination Next button click updates page to 2
    const nextBtn = page.getByRole('button', { name: /next page/i }).first();
    await nextBtn.click();
    expect(page.url()).toContain('page=2');
    await expect(page.getByText(/page 2 of/i).first()).toBeVisible();

    // 5. Search over 300 returns
    const searchInput = page.getByLabel(/search returns/i);
    await searchInput.fill('Tech Inc.');
    await expect(page.getByText(/Tech Inc./i).first()).toBeVisible();

    // 6. Reset filters
    const resetBtn = page.getByRole('button', { name: /reset filters/i });
    if (await resetBtn.isVisible()) {
      await resetBtn.click();
    }

    expect(consoleErrors).toEqual([]);
  });

  test('2. Validates scale detail page read-only fixture view', async ({ page }) => {
    const consoleErrors = listenConsoleErrors(page);

    await page.goto('/return/scale-ret-0001?dataset=scale');
    await expect(page.getByText(/Scale-Test Notice/i)).toBeVisible();

    expect(consoleErrors).toEqual([]);
  });
});
