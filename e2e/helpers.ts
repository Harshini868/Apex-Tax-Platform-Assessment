import { Page, expect } from '@playwright/test';

/**
 * Switch role using the top header role select control.
 */
export async function switchRole(page: Page, role: 'preparer' | 'reviewer' | 'client') {
  const roleSelect = page.locator('#role-select');
  await expect(roleSelect).toBeVisible();
  const current = await roleSelect.inputValue();
  if (current !== role) {
    await roleSelect.selectOption(role);
    // Wait for the select input value to update to the target role
    await expect(roleSelect).toHaveValue(role);
    // Wait for context update to propagate
    await page.waitForTimeout(500);
  }
}

/**
 * Assert clean console (no uncaught errors or console.error).
 */
export function listenConsoleErrors(page: Page) {
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  page.on('pageerror', (err) => {
    errors.push(err.message);
  });
  return errors;
}
