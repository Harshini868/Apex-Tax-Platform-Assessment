import React from 'react';
import { NavLink } from 'react-router';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  FileText,
  Users,
  FolderOpen,
  Home,
  CheckSquare,
  MessageSquare,
  Settings,
} from 'lucide-react';

export const AppNavigation: React.FC = () => {
  const { state } = useApp();
  const isClient = state.currentRole === 'client';

  // Desktop navigation items for Firm Staff (Preparer / Reviewer)
  const staffNavItems = [
    {
      name: 'Dashboard',
      path: state.currentRole === 'reviewer' ? '/dashboard/reviewer' : '/dashboard/preparer',
      icon: LayoutDashboard,
    },
    {
      name: 'Returns',
      path: state.selectedReviewReturnId ? `/return/${state.selectedReviewReturnId}` : '/return/ret-john-miller-1040/summary',
      icon: FileText,
    },
    {
      name: 'Clients',
      path: '/settings',
      icon: Users,
    },
    {
      name: 'Documents',
      path: '/return/ret-john-miller-1040/documents',
      icon: FolderOpen,
    },
  ];

  const clientNavItems = [
    {
      name: 'Home',
      path: '/dashboard/client',
      icon: Home,
    },
    {
      name: 'Required Actions',
      path: '/onboarding',
      icon: CheckSquare,
    },
    {
      name: 'Documents',
      path: '/return/ret-john-miller-1040/documents',
      icon: FolderOpen,
    },
    {
      name: 'Messages',
      path: '/return/ret-john-miller-1040',
      icon: MessageSquare,
    },
  ];

  const activeNavItems = isClient ? clientNavItems : staffNavItems;

  return (
    <nav className="w-64 border-r border-[var(--color-border-custom)] bg-[var(--color-surface-bg)] py-6 flex flex-col justify-between" aria-label="Main Navigation">
      <div className="space-y-1 px-4">
        {activeNavItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            end={item.path.endsWith('/summary') || item.path.endsWith('/documents') ? false : true}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-[var(--color-surface-elevated-bg)] text-[var(--color-primary-action-text)] border-l-2 border-[var(--color-primary-action-text)]'
                  : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-elevated-bg)] hover:text-[var(--color-text-primary)]'
              }`
            }
          >
            <item.icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
            <span>{item.name}</span>
          </NavLink>
        ))}
      </div>

      <div className="px-4">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
              isActive
                ? 'bg-[var(--color-surface-elevated-bg)] text-[var(--color-primary-action-text)]'
                : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-elevated-bg)] hover:text-[var(--color-text-primary)]'
            }`
          }
        >
          <Settings className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
          <span>Settings</span>
        </NavLink>
      </div>
    </nav>
  );
};
