import React from 'react';
import { Routes, Route, Navigate } from 'react-router';
import { AppShell } from '../components/layout/AppShell';
import { DashboardPage } from '../pages/DashboardPage';
import { ReturnWorkspacePageWrapper } from '../pages/ReturnWorkspacePageWrapper';
import { DocumentExplorerPage } from '../pages/DocumentExplorerPage';
import { OnboardingPage } from '../pages/OnboardingPage';
import { SettingsPage } from '../pages/SettingsPage';
import { NotFoundPage } from '../components/feedback/NotFoundPage';
import { useApp } from '../context/AppContext';

export const AppRoutes: React.FC = () => {
  const { state } = useApp();

  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route path="/dashboard" element={<Navigate to={`/dashboard/${state.currentRole}`} replace />} />
        <Route path="/dashboard/preparer" element={<DashboardPage />} />
        <Route path="/dashboard/reviewer" element={<DashboardPage />} />
        <Route path="/dashboard/client" element={<DashboardPage />} />

        <Route path="/return/:returnId" element={<ReturnWorkspacePageWrapper />} />
        <Route path="/return/:returnId/summary" element={<ReturnWorkspacePageWrapper />} />
        <Route path="/return/:returnId/documents" element={<DocumentExplorerPage />} />

        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/settings" element={<SettingsPage />} />

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};
