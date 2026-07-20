import { test, expect } from '@playwright/test';
import { switchRole, listenConsoleErrors } from './helpers';

test.describe('Journey 3 — Senior Reviewer Workflow & Approval Decisions', () => {
  test('1. Validates Reviewer queue, search/filtering, and Rostova return opening', async ({ page }) => {
    const consoleErrors = listenConsoleErrors(page);

    await page.goto('/dashboard/reviewer');
    await switchRole(page, 'reviewer');

    // 1. Reviewer Workstation header
    await expect(page.getByRole('heading', { name: /Reviewer Workstation/i })).toBeVisible();

    // 2. Actionable queue is loaded and searchable
    const searchInput = page.getByLabel('Search returns');
    await expect(searchInput).toBeVisible();
    await searchInput.fill('Rostova');

    // 3. Opening a specific return
    const startReviewBtn = page.getByRole('button', { name: /start review|continue review/i }).first();
    await expect(startReviewBtn).toBeVisible();
    await startReviewBtn.click();

    expect(page.url()).toContain('/return/ret-rostova-tech-1120s');

    expect(consoleErrors).toEqual([]);
  });

  test('2. Validates dual-source evidence, internal notes, checklist, and approval', async ({ page }) => {
    const consoleErrors = listenConsoleErrors(page);

    await page.goto('/dashboard/reviewer');
    await switchRole(page, 'reviewer');
    await page.goto('/return/ret-rostova-tech-1120s?field=rostova-interest-expense&panel=review');

    // 1. Check review checklist items
    await expect(page.getByText('Source documents reviewed')).toBeVisible();
    await expect(page.getByText('AI uncertainty resolved')).toBeVisible();

    // 2. Firm-internal collaboration note workflow
    await page.getByRole('button', { name: 'Chat Notes' }).click();
    await page.getByRole('button', { name: 'Firm-Internal Notes' }).click();

    const noteInput = page.getByPlaceholder('Add internal audit note...');
    await expect(noteInput).toBeVisible();
    await noteInput.fill('Reviewed PDF scanner trace. Interest matches.');
    await page.getByRole('button', { name: 'Send message' }).click();

    // Verify note is sent
    await expect(page.getByText('Reviewed PDF scanner trace. Interest matches.')).toBeVisible();

    // 3. Go back to CPA Review panel
    await page.getByRole('button', { name: 'CPA Review' }).click();

    // Accept checklist items sequentially by selecting the first unaccepted button
    for (let i = 0; i < 5; i++) {
      await page.locator('button:has-text("Accept"):not(.bg-emerald-600)').first().click();
      await expect(page.locator('button.bg-emerald-600:has-text("Accept")')).toHaveCount(i + 1);
    }

    // Try to approve without justification (should display warning)
    const approveBtn = page.getByRole('button', { name: /approve unchanged/i });
    await expect(approveBtn).toBeVisible();
    await approveBtn.click();
    await expect(page.getByText(/compliance justification reason is required/i)).toBeVisible();

    // Fill notes reason
    await page.locator('#decision-reason').fill('Checked dec Chase summary statement. Discrepancy explained.');

    // Approve
    await approveBtn.click();
    await expect(page.getByText('Return approved unchanged successfully.')).toBeVisible();

    expect(consoleErrors).toEqual([]);
  });

  test('3. Validates Return to Preparer decision workflow with actionable reason', async ({ page }) => {
    const consoleErrors = listenConsoleErrors(page);

    await page.goto('/dashboard/reviewer');
    await switchRole(page, 'reviewer');
    await page.goto('/return/ret-rostova-tech-1120s?field=rostova-interest-expense&panel=review');

    // Mark the first checklist item as "Needs Correction" (required prerequisite to return to preparer)
    const needsCorrectionBtn = page.getByRole('button', { name: 'Needs Correction' }).first();
    await expect(needsCorrectionBtn).toBeVisible();
    await needsCorrectionBtn.click();

    // Enter return reason in the Compliance Explanation / Preparer Correction Note textarea
    const reasonInput = page.locator('#decision-reason');
    await expect(reasonInput).toBeVisible();
    await reasonInput.fill('Please obtain updated bank statement for Line 13.');

    // Click Return to Preparer button
    const returnBtn = page.getByRole('button', { name: /Return to Preparer/i });
    await expect(returnBtn).toBeVisible();
    await returnBtn.click();

    // Verify success feedback message and status change
    await expect(page.getByText('Return returned to preparer successfully.')).toBeVisible();
    await expect(page.getByText('Changes requested').first()).toBeVisible();

    expect(consoleErrors).toEqual([]);
  });
});
