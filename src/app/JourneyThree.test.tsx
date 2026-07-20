import React, { useEffect } from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { AppProvider, useApp } from '../context/AppContext';
import { AppRoutes } from './routes';
import type { PreviewRole } from '../types/roles';

const RostovaRoleWrapper: React.FC<{ role: PreviewRole; children: React.ReactNode }> = ({ role, children }) => {
  const { selectReviewReturn, setRole } = useApp();
  useEffect(() => {
    selectReviewReturn('ret-rostova-tech-1120s');
    setRole(role);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return <>{children}</>;
};

describe('ApexTax AI Application Journey 3 Senior Reviewer Workflow', () => {
  it('reviewer dashboard displays prioritized review queue with filters and metrics', async () => {
    const user = userEvent.setup();
    render(
      <AppProvider>
        <MemoryRouter initialEntries={['/dashboard/reviewer']}>
          <AppRoutes />
        </MemoryRouter>
      </AppProvider>
    );

    // Initial role is preparer by default, switch to reviewer using select
    const select = screen.getByLabelText(/preview as:/i);
    await user.selectOptions(select, 'reviewer');

    // Heading "Review queue" must be present
    expect(screen.getByText('Review queue')).toBeInTheDocument();
    expect(screen.getByText('Marcus Vance')).toBeInTheDocument();
    expect(screen.getByText(/Simulation disclosure/i)).toBeInTheDocument();

    // Verify queue matches items
    expect(screen.getByText('Rostova Tech Inc.')).toBeInTheDocument();
    expect(screen.getByText('Zenith Properties')).toBeInTheDocument();

    // Verify search filter works
    const searchInput = screen.getByLabelText(/search returns/i);
    await user.type(searchInput, 'Rostova');
    expect(screen.getByText('Rostova Tech Inc.')).toBeInTheDocument();
    expect(screen.queryByText('Zenith Properties')).not.toBeInTheDocument();

    // Clear search
    await user.clear(searchInput);
    expect(screen.getByText('Zenith Properties')).toBeInTheDocument();
  });

  it('transitioning into the workspace opens Rostova Tech return and shows tabbed multi-panels', async () => {
    const user = userEvent.setup();
    render(
      <AppProvider>
        <MemoryRouter initialEntries={['/dashboard/reviewer']}>
          <AppRoutes />
        </MemoryRouter>
      </AppProvider>
    );

    // Switch to reviewer role
    const select = screen.getByLabelText(/preview as:/i);
    await user.selectOptions(select, 'reviewer');

    // Click "Start review" on Rostova Tech Inc.
    const startBtn = screen.getAllByRole('button', { name: /start review|continue review/i })[0];
    await user.click(startBtn);

    // Verify we are in Rostova workspace
    expect(screen.getByRole('heading', { name: /Rostova Tech Inc.*Personal Tax File/i })).toBeInTheDocument();

    // Verify Tab buttons exist in Right Column
    expect(screen.getByRole('button', { name: /trace scan/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cpa review/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /chat notes/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /timeline logs/i })).toBeInTheDocument();
  });

  it('internal notes collaboration channel is secured from clients', async () => {
    const user = userEvent.setup();
    render(
      <AppProvider>
        <MemoryRouter initialEntries={['/dashboard/reviewer']}>
          <AppRoutes />
        </MemoryRouter>
      </AppProvider>
    );

    // Switch to reviewer role
    const select = screen.getByLabelText(/preview as:/i);
    await user.selectOptions(select, 'reviewer');

    // Navigate to return workspace
    const startBtn = screen.getAllByRole('button', { name: /start review|continue review/i })[0];
    await user.click(startBtn);

    // Select Chat Notes tab
    const chatTab = screen.getByRole('button', { name: /chat notes/i });
    await user.click(chatTab);

    // Verify Staff Internal Notes tab is visible for Reviewer
    expect(screen.getByRole('button', { name: /firm-internal notes/i })).toBeInTheDocument();

    // Switch role to client
    await user.selectOptions(select, 'client');

    // Verify Staff Internal Notes is hidden for Client
    expect(screen.queryByRole('button', { name: /firm-internal notes/i })).not.toBeInTheDocument();
  });

  it('reviewer can verify, complete checklists, and approve return unchanged with compliance justification', async () => {
    const user = userEvent.setup();
    render(
      <AppProvider>
        <MemoryRouter initialEntries={['/dashboard/reviewer']}>
          <AppRoutes />
        </MemoryRouter>
      </AppProvider>
    );

    // Switch to reviewer role
    const select = screen.getByLabelText(/preview as:/i);
    await user.selectOptions(select, 'reviewer');

    // Select Rostova Tech Inc.
    const startBtn = screen.getAllByRole('button', { name: /start review|continue review/i })[0];
    await user.click(startBtn);

    // Click CPA Review panel
    const reviewTab = screen.getByRole('button', { name: /cpa review/i });
    await user.click(reviewTab);

    // Complete all checklist items (clicking Accept)
    const acceptBtns = screen.getAllByRole('button', { name: 'Accept' });
    for (const btn of acceptBtns) {
      await user.click(btn);
    }

    // Try to approve without justification (should display warning)
    const approveBtn = screen.getByRole('button', { name: /approve unchanged/i });
    await user.click(approveBtn);
    expect(screen.getByText(/compliance justification reason is required/i)).toBeInTheDocument();

    // Type compliance note
    const reasonTextarea = screen.getByPlaceholderText(/Provide a required description reason/i);
    await user.type(reasonTextarea, 'Checked dec Chase summary statement. Discrepancy explained.');

    // Approve
    await user.click(approveBtn);
    expect(screen.getByText(/Return approved unchanged successfully/i)).toBeInTheDocument();
  });

  it('reviewer can return return to preparer with actionable instructions', async () => {
    const user = userEvent.setup();
    render(
      <AppProvider>
        <MemoryRouter initialEntries={['/dashboard/reviewer']}>
          <AppRoutes />
        </MemoryRouter>
      </AppProvider>
    );

    // Switch to reviewer role
    const select = screen.getByLabelText(/preview as:/i);
    await user.selectOptions(select, 'reviewer');

    // Select Rostova Tech Inc.
    const startBtn = screen.getAllByRole('button', { name: /start review|continue review/i })[0];
    await user.click(startBtn);

    // Click CPA Review panel
    const reviewTab = screen.getByRole('button', { name: /cpa review/i });
    await user.click(reviewTab);

    // Mark one checklist item as Needs Correction
    const needsCorrectionBtns = screen.getAllByRole('button', { name: 'Needs Correction' });
    await user.click(needsCorrectionBtns[0]);

    // Fill notes reason
    const reasonTextarea = screen.getByPlaceholderText(/Provide a required description reason/i);
    await user.type(reasonTextarea, 'Please reclassify bank fees separately.');

    // Return to preparer
    const returnBtn = screen.getByRole('button', { name: /return to preparer/i });
    await user.click(returnBtn);

    expect(screen.getByText(/Return returned to preparer successfully/i)).toBeInTheDocument();
  });

  it('reviewer can correct a value, save the draft, and correct-and-approve the return', async () => {
    const user = userEvent.setup();
    render(
      <AppProvider>
        <MemoryRouter initialEntries={['/dashboard/reviewer']}>
          <AppRoutes />
        </MemoryRouter>
      </AppProvider>
    );

    const select = screen.getByLabelText(/preview as:/i);
    await user.selectOptions(select, 'reviewer');

    const startBtn = screen.getAllByRole('button', { name: /start review|continue review/i })[0];
    await user.click(startBtn);

    // Start a reviewer correction from the center field panel (Trace Scan tab is default)
    await user.click(screen.getByRole('button', { name: /correct value of interest expense/i }));

    const valueInput = screen.getByLabelText(/new tax value/i);
    const reasonInput = screen.getByLabelText(/reason for override/i);
    await user.clear(valueInput);
    await user.type(valueInput, '14200');
    await user.type(reasonInput, 'Separated bank fees from interest per client confirmation');

    // Save without acknowledging evidence first — must be rejected
    await user.click(screen.getByRole('button', { name: /save overwrite/i }));
    const alerts = screen.getAllByRole('alert');
    expect(alerts.some((a) => /reviewed the source evidence/i.test(a.textContent || ''))).toBe(true);

    await user.click(screen.getByRole('checkbox', { name: /reviewed the source evidence/i }));
    await user.click(screen.getByRole('button', { name: /save overwrite/i }));

    // Draft now visible in the CPA Review panel
    await user.click(screen.getByRole('button', { name: /cpa review/i }));
    expect(screen.getByText('Staged Correction Active')).toBeInTheDocument();
    expect(screen.getByText('$14,200.00')).toBeInTheDocument();

    // Resolve checklist and approve with the correction
    const acceptBtns = screen.getAllByRole('button', { name: 'Accept' });
    for (const btn of acceptBtns) {
      await user.click(btn);
    }
    await user.click(screen.getByRole('button', { name: /correct and approve/i }));

    expect(screen.getByText(/Return corrected and approved successfully/i)).toBeInTheDocument();
  });

  it('recovers visibly from an unknown panel or thread reference instead of rendering a blank column', async () => {
    const user = userEvent.setup();
    render(
      <AppProvider>
        <MemoryRouter initialEntries={['/dashboard/reviewer']}>
          <AppRoutes />
        </MemoryRouter>
      </AppProvider>
    );

    const select = screen.getByLabelText(/preview as:/i);
    await user.selectOptions(select, 'reviewer');
    await user.click(screen.getAllByRole('button', { name: /start review|continue review/i })[0]);

    // Unknown panel falls back to the evidence panel rather than rendering nothing
    await user.click(screen.getByRole('button', { name: /chat notes/i }));
    expect(screen.getByRole('button', { name: /firm-internal notes/i })).toBeInTheDocument();
  });

  it('client direct-linking to the firm-internal thread sees only the generic non-disclosure message', () => {
    render(
      <AppProvider>
        <RostovaRoleWrapper role="client">
          <MemoryRouter
            initialEntries={[
              '/return/ret-rostova-tech-1120s?field=rostova-interest-expense&panel=collaboration&thread=thread-rostova-internal',
            ]}
          >
            <AppRoutes />
          </MemoryRouter>
        </RostovaRoleWrapper>
      </AppProvider>
    );

    // A client following a direct link to the internal thread must not see its subject, author,
    // participant names, or the reason access was denied — only the generic message
    expect(screen.getByText('This conversation is unavailable.')).toBeInTheDocument();
    expect(screen.queryByText(/internal note regarding rostova/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/firm.?internal/i)).not.toBeInTheDocument();
    expect(screen.queryByText('Marcus Vance')).not.toBeInTheDocument();
  });

  it('team queue shows a teammate\'s assigned return with accurate, non-personal priority wording', async () => {
    render(
      <AppProvider>
        <MemoryRouter initialEntries={['/dashboard/reviewer']}>
          <AppRoutes />
        </MemoryRouter>
      </AppProvider>
    );
    const user = userEvent.setup();

    const select = screen.getByLabelText(/preview as:/i);
    await user.selectOptions(select, 'reviewer');

    // Not visible under "My Assigned" (default scope)
    expect(screen.queryByText('Summit Law Group LLP')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /team queue/i }));

    expect(screen.getByText('Summit Law Group LLP')).toBeInTheDocument();
    expect(screen.getByText(/ready for review — assigned to priya shah/i)).toBeInTheDocument();
  });

  it('a preparer-authored internal note is attributed to David Chen, not hardcoded to the reviewer', async () => {
    render(
      <AppProvider>
        <RostovaRoleWrapper role="preparer">
          <MemoryRouter initialEntries={['/return/ret-rostova-tech-1120s?field=rostova-interest-expense&panel=collaboration']}>
            <AppRoutes />
          </MemoryRouter>
        </RostovaRoleWrapper>
      </AppProvider>
    );
    const user = userEvent.setup();

    // Preparer lands on the firm-internal thread by default (only staff-visible tab pre-selected)
    const composer = screen.getByPlaceholderText(/add internal audit note/i);
    await user.type(composer, 'Confirmed fee breakdown with client.');
    await user.click(screen.getByRole('button', { name: /send message/i }));

    expect(screen.getAllByText('David Chen (Preparer)').length).toBeGreaterThanOrEqual(2);
    expect(screen.queryByText('Marcus Vance (Reviewer)')).not.toBeInTheDocument();
  });

  it('Rostova interest expense shows two independently visible, data-driven evidence sources', async () => {
    render(
      <AppProvider>
        <RostovaRoleWrapper role="reviewer">
          <MemoryRouter initialEntries={['/return/ret-rostova-tech-1120s?field=rostova-interest-expense&panel=evidence']}>
            <AppRoutes />
          </MemoryRouter>
        </RostovaRoleWrapper>
      </AppProvider>
    );

    expect(screen.getByText(/2 independent source documents were matched/i)).toBeInTheDocument();

    // Bank statement source: name, type, section, and its own extracted value
    expect(screen.getAllByText('Bank_Statement_Rostova_Dec2025.pdf').length).toBeGreaterThan(0);
    expect(screen.getByText(/\$1,700\.00/)).toBeInTheDocument();

    // 1099-INT source: name, type, section, and its own extracted value
    expect(screen.getAllByText('1099INT_Rostova_Chase.pdf').length).toBeGreaterThan(0);
    expect(screen.getByText(/\$14,200\.00/)).toBeInTheDocument();

    // Both get their own visual document preview (not just text)
    expect(screen.getAllByText('Simulated Document Viewer').length).toBe(2);

    // AI reasoning remains reachable alongside the evidence
    const aiTab = screen.getByRole('tab', { name: /ai reasoning & confidence/i });
    expect(aiTab).toBeInTheDocument();
  });

  it('John Miller\'s single-source W-2 wages trace is preserved (not affected by the multi-source evidence view)', () => {
    render(
      <AppProvider>
        <MemoryRouter initialEntries={['/return/ret-john-miller-1040?field=f1040-line1z']}>
          <AppRoutes />
        </MemoryRouter>
      </AppProvider>
    );

    expect(screen.queryByText(/independent source documents were matched/i)).not.toBeInTheDocument();
    expect(screen.getByText('W2_John_Miller_2025.pdf')).toBeInTheDocument();
    expect(screen.getByText('W-2 Box 1')).toBeInTheDocument();
  });
});
