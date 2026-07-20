import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { switchRole } from './helpers';

const targetRoutes = [
  { name: 'Client Dashboard', path: '/dashboard/client', role: 'client' },
  { name: 'Client Onboarding Request', path: '/onboarding?step=required-information&request=req-john-w2', role: 'client' },
  { name: 'John Miller Workspace', path: '/return/ret-john-miller-1040?field=f1040-line1z', role: 'preparer' },
  { name: 'Reviewer Dashboard', path: '/dashboard/reviewer', role: 'reviewer' },
  { name: 'Rostova Review Workspace', path: '/return/ret-rostova-tech-1120s?field=rostova-interest-expense&panel=review', role: 'reviewer' },
  { name: 'Scale Reviewer Queue', path: '/dashboard/reviewer?dataset=scale', role: 'reviewer' },
  { name: 'Document Explorer', path: '/return/ret-rostova-tech-1120s/documents?dataset=scale', role: 'reviewer' },
  { name: 'Not Found 404 Page', path: '/non-existent-route-path', role: 'preparer' },
];

test.describe('Automated Accessibility (Axe) Scans — WCAG 2.1 AA', () => {
  for (const r of targetRoutes) {
    test(`Axe scan: ${r.name} (${r.path})`, async ({ page }) => {
      await page.goto('/dashboard/' + r.role);
      await switchRole(page, r.role as any);
      await page.goto(r.path);

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

      const criticalOrSerious = accessibilityScanResults.violations.filter(
        (v) => v.impact === 'critical' || v.impact === 'serious'
      );

      if (criticalOrSerious.length > 0) {
        console.log(`AXE VIOLATIONS on ${r.name}:`, JSON.stringify(criticalOrSerious.map(v => ({
          id: v.id,
          impact: v.impact,
          description: v.description,
          nodes: v.nodes.map(n => n.html)
        })), null, 2));
      }

      expect(criticalOrSerious, `Critical/Serious A11y violations found on ${r.name}`).toEqual([]);
    });
  }
});
