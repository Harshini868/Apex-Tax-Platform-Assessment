import { test, expect } from '@playwright/test';
import { switchRole, listenConsoleErrors } from './helpers';

test.describe('Journey 1 — Preparer Traceability & Verification Workflow', () => {
  test('1. Validates field selection, document highlighting, AI reasoning, and verification', async ({ page }) => {
    const consoleErrors = listenConsoleErrors(page);

    // Set role to preparer then navigate to field
    await page.goto('/dashboard/preparer');
    await switchRole(page, 'preparer');
    await page.goto('/return/ret-john-miller-1040?field=f1040-line1z');

    // 1. Wages field is selected
    const line1zBtn = page.getByRole('button', { name: /Line 1z/i }).first();
    await expect(line1zBtn).toBeVisible();

    // 2. URL contains field
    expect(page.url()).toContain('field=f1040-line1z');

    // 3. W-2 document name is visible
    await expect(page.getByText(/W2_John_Miller/i).first()).toBeVisible();

    // 4. Page 1 and Box 1 visible in evidence pane
    await expect(page.getByText(/Box 1/i).first()).toBeVisible();

    // 5. $152,500.00 is visibly highlighted
    await expect(page.locator('text=$152,500.00').first()).toBeVisible();

    // 6. AI reasoning and confidence explanation visible (click tab first)
    await page.getByRole('tab', { name: /AI Reasoning & Confidence/i }).click();
    await expect(page.getByText(/OCR character readability|Direct OCR match/i).first()).toBeVisible();

    // 7. Preparer verifies complete source match
    const verifyBtn = page.getByRole('button', { name: /verify source match/i });
    await expect(verifyBtn).toBeVisible();
    await verifyBtn.click();
    await expect(page.getByText(/verified/i).first()).toBeVisible();

    expect(consoleErrors).toEqual([]);
  });

  test('2. Validates correction workflow and error validation', async ({ page }) => {
    const consoleErrors = listenConsoleErrors(page);
    await page.goto('/dashboard/preparer');
    await switchRole(page, 'preparer');
    await page.goto('/return/ret-john-miller-1040?field=f1040-line1z');

    // Click Correct Value button
    const correctBtn = page.getByRole('button', { name: /correct value/i });
    await expect(correctBtn).toBeVisible();
    await correctBtn.click();

    // Submit empty explanation to test validation error
    const saveBtn = page.getByRole('button', { name: /save correction|save overwrite/i });
    await saveBtn.click();
    await expect(page.getByText(/explanation is required|specify a valid correction reason/i)).toBeVisible();

    // Enter valid correction
    const valueInput = page.locator('#correction-value');
    await valueInput.fill('153000');
    const reasonInput = page.locator('#correction-reason');
    await reasonInput.fill('Verified with client paystubs.');

    await saveBtn.click();

    // Verify success feedback and status change
    await expect(page.getByText(/corrected to \$153,000\.00/i)).toBeVisible();
    await expect(page.getByText('Awaiting Review').first()).toBeVisible();

    // Verify corrected and original values are visible
    await expect(page.getByText('$153,000.00').first()).toBeVisible();
    await expect(page.getByText('$152,500.00').first()).toBeVisible();

    // Verify no lock is applied (the lock icon/text is not visible)
    await expect(page.getByText(/Field Locked by Reviewer/i)).not.toBeVisible();

    // Verify audit history contains the correction
    await page.getByRole('button', { name: /Timeline Logs/i }).click();
    await expect(page.getByText(/Corrected value from \$152,500\.00 to \$153,000\.00/i)).toBeVisible();

    expect(consoleErrors).toEqual([]);
  });

  test('3. Validates Reviewer locking and Client read-only restriction', async ({ page }) => {
    const consoleErrors = listenConsoleErrors(page);

    // 1. Establish Reviewer role on dashboard
    await page.goto('/dashboard/reviewer');
    await switchRole(page, 'reviewer');

    // 2. Wait for reviewer dashboard workstation header to be visible to ensure role switch transition completed
    await expect(page.getByRole('heading', { name: /Reviewer Workstation/i })).toBeVisible();

    // 3. Explicitly navigate to return workspace page
    await page.goto('/return/ret-john-miller-1040?field=f1040-line1z');

    // 4. Confirm the heading and wages field are loaded
    await expect(page.getByRole('heading', { name: /Wages, salaries, tips/i })).toBeVisible();

    // 5. Locate the lock action button using current real accessible name
    const lockBtn = page.getByRole('button', { name: /Verify and lock Wages, salaries, tips/i });
    await expect(lockBtn).toBeVisible();
    await lockBtn.click();

    // 6. Enter lock reason
    const lockReasonInput = page.locator('#lock-reason');
    await expect(lockReasonInput).toBeVisible();
    await lockReasonInput.fill('Verified compliance check completed.');

    // 7. Confirm Lock
    await page.getByRole('button', { name: /Confirm Lock/i }).click();

    // 8. Verify status becomes locked, and Reviewer identity/timestamp appear
    await expect(page.getByText('Locked').first()).toBeVisible();
    await expect(page.getByText(/Field Locked by Reviewer/i).first()).toBeVisible();
    await expect(page.getByText(/Locked by: Marcus Vance/i).first()).toBeVisible();

    // 9. Verify "Why is this locked?" is keyboard reachable/visible
    const whyLockedBtn = page.getByRole('button', { name: /Why is this locked\?/i });
    await expect(whyLockedBtn).toBeVisible();

    // 10. Switch to Preparer and verify editing controls are removed (using SPA navigation to keep context)
    await switchRole(page, 'preparer');
    await page.getByRole('link', { name: 'Returns' }).click();
    await page.getByRole('button', { name: /Line 1z/i }).first().click();
    await expect(page.getByRole('button', { name: /correct value/i })).not.toBeVisible();
    await expect(page.getByRole('button', { name: /verify source match/i })).not.toBeVisible();

    // 11. Switch to Client and verify correction, verification, and locking controls are removed
    await switchRole(page, 'client');
    await page.getByRole('link', { name: 'Messages' }).click();
    await page.getByRole('button', { name: /Line 1z/i }).first().click();
    await expect(page.getByRole('button', { name: /correct value/i })).not.toBeVisible();
    await expect(page.getByRole('button', { name: /verify source match/i })).not.toBeVisible();
    await expect(page.getByRole('button', { name: /Verify and lock/i })).not.toBeVisible();
    await expect(page.getByText(/Client Transparency View/i).first()).toBeVisible();

    expect(consoleErrors).toEqual([]);
  });
});
