import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useApp } from '../../context/AppContext';
import type { PreviewRole } from '../../types/roles';
import { User, Eye, Menu, X } from 'lucide-react';

export const AppHeader: React.FC = () => {
  const { state, setRole } = useApp();
  const navigate = useNavigate();
  const [announcement, setAnnouncement] = useState('');

  const handleRoleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newRole = event.target.value as PreviewRole;
    setRole(newRole);
    setAnnouncement(`Context switched to ${newRole} view`);
    navigate(`/dashboard/${newRole}`);
  };

  useEffect(() => {
    if (announcement) {
      const timer = setTimeout(() => setAnnouncement(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [announcement]);

  const getRoleDisplayName = (role: PreviewRole) => {
    switch (role) {
      case 'preparer': return 'Tax Preparer (David Chen)';
      case 'reviewer': return 'Senior Reviewer (Marcus Vance)';
      case 'client': return 'Individual Taxpayer (John Miller)';
    }
  };

  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Close mobile nav on escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileNavOpen) {
        setMobileNavOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileNavOpen]);

  return (
    <>
      <header className="flex min-h-16 flex-wrap items-center justify-between gap-3 border-b border-[var(--color-border-custom)] bg-[var(--color-surface-bg)] px-4 sm:px-6 py-2.5 text-[var(--color-text-primary)]">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            aria-expanded={mobileNavOpen}
            aria-controls="mobile-navigation-drawer"
            aria-label={mobileNavOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className="mobile-nav-trigger h-9 w-9 items-center justify-center rounded-md border border-[var(--color-border-custom)] bg-[var(--color-surface-elevated-bg)] text-[var(--color-text-primary)] hover:bg-[var(--color-border-custom)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-focus-indicator)]"
          >
            {mobileNavOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <span className="text-xl font-bold tracking-tight text-[var(--color-primary-action-text)]">ApexTax AI</span>
          <div className="hidden sm:block h-4 w-px bg-[var(--color-border-custom)]" aria-hidden="true" />
          <span className="hidden sm:inline text-sm font-medium text-[var(--color-text-secondary)]">
            {state.currentRole === 'client' ? 'Client Portal' : `${state.currentRole.charAt(0).toUpperCase() + state.currentRole.slice(1)} Workspace`}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3 sm:gap-6">
          <div className="sr-only" aria-live="polite" role="status">
            {announcement}
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 rounded-md bg-[var(--color-surface-elevated-bg)] px-2.5 py-1 sm:px-3 sm:py-1.5 border border-[var(--color-border-custom)]">
            <Eye className="h-4 w-4 text-[var(--color-primary-action)] flex-shrink-0" aria-hidden="true" />
            <label htmlFor="role-select" className="text-xs font-semibold text-[var(--color-text-secondary)] whitespace-nowrap">
              Demo mode — Preview as:
            </label>
            <select
              id="role-select"
              value={state.currentRole}
              onChange={handleRoleChange}
              className="bg-transparent text-xs sm:text-sm font-medium text-[var(--color-text-primary)] cursor-pointer focus:outline-none"
            >
              <option value="preparer" className="bg-[var(--color-surface-bg)]">Preparer</option>
              <option value="reviewer" className="bg-[var(--color-surface-bg)]">Reviewer</option>
              <option value="client" className="bg-[var(--color-surface-bg)]">Client</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-sm font-medium">{getRoleDisplayName(state.currentRole)}</span>
              <span className="text-xs text-[var(--color-text-secondary)]">Apex Tax Solutions</span>
            </div>
            <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-[var(--color-surface-elevated-bg)] border border-[var(--color-border-custom)]">
              <User className="h-4 w-4 sm:h-5 sm:w-5 text-[var(--color-text-secondary)]" aria-hidden="true" />
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileNavOpen(false)}
            aria-hidden="true"
          />
          <div
            id="mobile-navigation-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation Menu"
            className="relative z-10 w-4/5 max-w-xs bg-[var(--color-surface-bg)] p-6 shadow-xl border-r border-[var(--color-border-custom)] flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-[var(--color-border-custom)]">
                <span className="text-lg font-bold text-[var(--color-primary-action-text)]">ApexTax Navigation</span>
                <button
                  type="button"
                  onClick={() => setMobileNavOpen(false)}
                  aria-label="Close navigation menu"
                  className="rounded-md p-1.5 text-[var(--color-text-secondary)] hover:text-white hover:bg-[var(--color-surface-elevated-bg)]"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <AppNavigation onNavClick={() => setMobileNavOpen(false)} isMobileDrawer />
            </div>
            <div className="pt-4 border-t border-[var(--color-border-custom)] text-xs text-[var(--color-text-secondary)]">
              Signed in as <span className="font-semibold text-white">{state.currentRole}</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
