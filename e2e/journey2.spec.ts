import { test, expect } from '@playwright/test';
import { switchRole, listenConsoleErrors } from './helpers';

test.describe('Journey 2 — Client Onboarding & Collaboration Workflow', () => {
  test('1. Validates Client dashboard, CTA ownership, document staging, and submission', async ({ page }) => {
    const consoleErrors = listenConsoleErrors(page);

    await page.goto('/dashboard/client');
    await switchRole(page, 'client');

    // 1. Welcome banner & dominant next action
    await expect(page.getByRole('heading', { name: /Welcome, John|Welcome back/i })).toBeVisible();
    
    const ctaBtn = page.getByRole('button', { name: /Upload W-2 Statement|Continue Required Action/i }).first();
    await expect(ctaBtn).toBeVisible();
    await ctaBtn.click();

    // 2. Contextual request onboarding page
    expect(page.url()).toContain('/onboarding');
    expect(page.url()).toContain('request=req-john-w2');

    // 3. Staging simulated document upload
    const fileInput = page.locator('#simulated-file-input');
    await fileInput.setInputFiles({
      name: 'W2_John_Miller_2025.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('fictional test metadata fixture')
    });

    // Verify file name, size, type are visible
    await expect(page.getByText('W2_John_Miller_2025.pdf').first()).toBeVisible();
    await expect(page.getByText(/31 Bytes • application\/pdf/i).first()).toBeVisible();

    // Verify simulation disclosure is present
    await expect(page.getByText(/Prototype simulation/i).first()).toBeVisible();

    // 4. Digital asset radio question
    const noRadio = page.getByLabel('No', { exact: true });
    await noRadio.check();
    expect(await noRadio.isChecked()).toBeTruthy();

    // 5. Complete request submission
    await page.getByRole('button', { name: /Submit to David/i }).click();

    // 6. Verify status updates to submitted/completed and ownership change
    await expect(page.getByText(/Submitted to David Chen. Your preparer owns the next action/i)).toBeVisible();
    await expect(page.getByText('SUBMITTED', { exact: true })).toBeVisible();

    // Verify read-only submitted state
    await expect(noRadio).toBeDisabled();

    expect(consoleErrors).toEqual([]);
  });

  test('2. Validates client isolation from internal notes thread', async ({ page }) => {
    const consoleErrors = listenConsoleErrors(page);

    // 1. Establish Client role on dashboard
    await page.goto('/dashboard/client');
    await switchRole(page, 'client');

    // 2. Wait for Client dashboard header to be visible
    await expect(page.getByRole('heading', { name: /Welcome, John|Welcome back/i })).toBeVisible();

    // 3. Navigate to the restricted internal thread URL
    await page.goto('/return/ret-rostova-tech-1120s?panel=collaboration&thread=thread-rostova-internal');

    // 4. Verify generic unavailable message is shown
    await expect(page.getByText(/This conversation is unavailable/i)).toBeVisible();

    // 5. Verify internal metadata is completely absent from the DOM
    await expect(page.getByText('Marcus Vance')).not.toBeVisible();
    await expect(page.getByText('David Chen')).not.toBeVisible();
    await expect(page.getByText(/Firm-internal/i)).not.toBeVisible();
    await expect(page.getByText(/Internal note/i)).not.toBeVisible();

    expect(consoleErrors).toEqual([]);
  });
});
