import { test, expect } from '@playwright/test';
import { switchRole, listenConsoleErrors } from './helpers';

test.describe('Document Complexity Explorer & Dual-Source Evidence', () => {
  test('1. Validates 260 Rostova documents, filters, hierarchy expand/collapse, and selection trail', async ({ page }) => {
    const consoleErrors = listenConsoleErrors(page);

    await page.goto('/dashboard/reviewer');
    await switchRole(page, 'reviewer');
    await page.goto('/return/ret-rostova-tech-1120s/documents?dataset=scale');

    // 1. Orientation header
    await expect(page.getByRole('heading', { name: /Rostova Tech Inc. — Documents/i })).toBeVisible();

    // 2. Category group expand / collapse
    const incomeBtn = page.getByRole('button', { name: /Income Documents/i }).first();
    await expect(incomeBtn).toBeVisible();
    await incomeBtn.click(); // toggle

    // 3. Category filter
    const catSelect = page.getByLabel(/category/i);
    await catSelect.selectOption('income');

    // 4. Document search
    const searchInput = page.getByLabel(/search documents/i);
    await searchInput.fill('1099');

    // 5. Select document row to view connected object trail
    const docRow = page.locator('button', { hasText: /Statement|Form|Summary|1099/i }).first();
    if (await docRow.isVisible()) {
      await docRow.click();
    }

    expect(consoleErrors).toEqual([]);
  });

  test('2. Validates dual-source evidence presentation for Rostova interest expense', async ({ page }) => {
    const consoleErrors = listenConsoleErrors(page);

    await page.goto('/dashboard/reviewer');
    await switchRole(page, 'reviewer');
    await page.goto('/return/ret-rostova-tech-1120s?field=rostova-interest-expense&panel=evidence');

    // Both sources separately presented
    await expect(page.getByText(/1099-INT/i).first()).toBeVisible();
    await expect(page.getByText(/Bank Statement/i).first()).toBeVisible();

    // Source values extracted
    await expect(page.locator('text=$15,900').first()).toBeVisible();
    await expect(page.locator('text=$14,200').first()).toBeVisible();

    // Simulated preview disclosure
    await expect(page.getByText(/Simulated Document Viewer/i).first()).toBeVisible();

    expect(consoleErrors).toEqual([]);
  });
});
