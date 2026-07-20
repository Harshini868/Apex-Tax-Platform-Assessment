import React from 'react';
import { Link } from 'react-router';
import { useApp } from '../../context/AppContext';
import { AlertCircle, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  const { state } = useApp();
  const dashboardPath = `/dashboard/${state.currentRole}`;

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center px-4">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-error)]/10 text-[var(--color-error)] mb-6">
        <AlertCircle className="h-10 w-10" aria-hidden="true" />
      </div>
      <h1 className="text-3xl font-extrabold tracking-tight mb-3">404 - Page Not Found</h1>
      <p className="max-w-md text-[var(--color-text-secondary)] mb-8">
        The page you are looking for does not exist, has been moved, or is not implemented in this prototype stage.
      </p>
      <Link
        to={dashboardPath}
        className="inline-flex items-center gap-2 rounded-md bg-[var(--color-primary-action)] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[var(--color-primary-action)]/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus-indicator)]"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Return to Dashboard
      </Link>
    </div>
  );
};
