import React from 'react';
import { Link } from 'react-router';
import { useApp } from '../context/AppContext';
import { Clock, ArrowLeft } from 'lucide-react';

interface PlaceholderPageProps {
  title?: string;
  description?: string;
}

export const PlaceholderPage: React.FC<PlaceholderPageProps> = ({ title, description }) => {
  const { state } = useApp();
  const dashboardPath = `/dashboard/${state.currentRole}`;

  return (
    <div className="rounded-lg border border-[var(--color-border-custom)] bg-[var(--color-surface-bg)] p-8 text-center max-w-2xl mx-auto my-12">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-warning)]/10 text-[var(--color-warning)] mx-auto mb-4">
        <Clock className="h-6 w-6" aria-hidden="true" />
      </div>
      <h1 className="text-2xl font-bold tracking-tight mb-2">
        {title || 'Feature Planned'}
      </h1>
      <p className="text-[var(--color-text-secondary)] mb-6 text-sm">
        {description || 'This feature is currently in the design phase and is scheduled for the next development sprint. It is not implemented in this prototype.'}
      </p>
      <Link
        to={dashboardPath}
        className="inline-flex items-center gap-2 rounded-md bg-[var(--color-surface-elevated-bg)] px-3.5 py-2 text-sm font-semibold text-[var(--color-text-primary)] hover:bg-[var(--color-border-custom)] border border-[var(--color-border-custom)]"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to Dashboard
      </Link>
    </div>
  );
};
export default PlaceholderPage;
