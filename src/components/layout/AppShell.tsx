import React from 'react';
import { Outlet } from 'react-router';
import { SkipLink } from './SkipLink';
import { AppHeader } from './AppHeader';
import { AppNavigation } from './AppNavigation';

export const AppShell: React.FC = () => {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[var(--color-app-bg)] text-[var(--color-text-primary)]">
      <SkipLink />
      <AppHeader />
      <div className="flex flex-1 overflow-hidden">
        <AppNavigation />
        <main
          id="main-content"
          tabIndex={-1}
          className="flex-1 overflow-y-auto bg-[var(--color-app-bg)] p-4 sm:p-6 lg:p-8 focus:outline-none"
        >
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
