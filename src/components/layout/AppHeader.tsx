import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useApp } from '../../context/AppContext';
import type { PreviewRole } from '../../types/roles';
import { User, Eye } from 'lucide-react';

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

  return (
    <header className="flex h-16 items-center justify-between border-b border-[var(--color-border-custom)] bg-[var(--color-surface-bg)] px-6 text-[var(--color-text-primary)]">
      <div className="flex items-center gap-4">
        <span className="text-xl font-bold tracking-tight text-[var(--color-primary-action-text)]">ApexTax AI</span>
        <div className="h-4 w-px bg-[var(--color-border-custom)]" aria-hidden="true" />
        <span className="text-sm font-medium text-[var(--color-text-secondary)]">
          {state.currentRole === 'client' ? 'Client Portal' : `${state.currentRole.charAt(0).toUpperCase() + state.currentRole.slice(1)} Workspace`}
        </span>
      </div>

      <div className="flex items-center gap-6">
        <div className="sr-only" aria-live="polite" role="status">
          {announcement}
        </div>

        <div className="flex items-center gap-2 rounded-md bg-[var(--color-surface-elevated-bg)] px-3 py-1.5 border border-[var(--color-border-custom)]">
          <Eye className="h-4 w-4 text-[var(--color-primary-action)]" aria-hidden="true" />
          <label htmlFor="role-select" className="text-xs font-semibold text-[var(--color-text-secondary)]">
            Demo mode — Preview as:
          </label>
          <select
            id="role-select"
            value={state.currentRole}
            onChange={handleRoleChange}
            className="bg-transparent text-sm font-medium text-[var(--color-text-primary)] cursor-pointer"
          >
            <option value="preparer" className="bg-[var(--color-surface-bg)]">Preparer</option>
            <option value="reviewer" className="bg-[var(--color-surface-bg)]">Reviewer</option>
            <option value="client" className="bg-[var(--color-surface-bg)]">Client</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex flex-col text-right">
            <span className="text-sm font-medium">{getRoleDisplayName(state.currentRole)}</span>
            <span className="text-xs text-[var(--color-text-secondary)]">Apex Tax Solutions</span>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-surface-elevated-bg)] border border-[var(--color-border-custom)]">
            <User className="h-5 w-5 text-[var(--color-text-secondary)]" aria-hidden="true" />
          </div>
        </div>
      </div>
    </header>
  );
};
