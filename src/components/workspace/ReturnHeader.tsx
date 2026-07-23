import React from 'react';
import type { TaxReturn } from '../../domain/return';
import { Link } from 'react-router';
import { Info, ArrowLeft, User2, PlayCircle } from 'lucide-react';

interface ReturnHeaderProps {
  curatedReturn: TaxReturn;
}

export const ReturnHeader: React.FC<ReturnHeaderProps> = ({ curatedReturn }) => {
  return (
    <header className="space-y-4" aria-label="Tax Return Workspace Header">
      {/* Breadcrumbs & Back Link */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <nav className="text-xs text-[var(--color-text-secondary)] font-medium" aria-label="Breadcrumb navigation">
          <ol className="flex items-center gap-1.5 list-none p-0 m-0">
            <li>
              <Link to="/dashboard" className="hover:text-[var(--color-text-primary)] hover:underline">
                Dashboard
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <span className="hover:text-[var(--color-text-primary)] cursor-default">
                {curatedReturn.clientName}
              </span>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <span className="text-[var(--color-text-primary)] font-semibold">
                {curatedReturn.taxYear} {curatedReturn.returnType}
              </span>
            </li>
          </ol>
        </nav>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
        >
          <ArrowLeft className="h-3 w-3" />
          Back to Dashboard
        </Link>
      </div>

      {/* Main Metadata Section */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--color-border-custom)] pb-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold tracking-tight text-[var(--color-text-primary)]">
            {curatedReturn.clientName} Personal Tax File
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--color-text-secondary)]">
            <span>
              <strong>Entity Type:</strong> {curatedReturn.returnType}
            </span>
            <span aria-hidden="true">•</span>
            <span>
              <strong>Tax Year:</strong> {curatedReturn.taxYear}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Status Badge */}
          <div className="flex items-center gap-2 rounded-md bg-[var(--color-surface-elevated-bg)] px-3 py-1.5 border border-[var(--color-border-custom)]">
            <PlayCircle className="h-4 w-4 text-[var(--color-primary-action)]" />
            <span className="text-xs font-semibold text-[var(--color-text-secondary)]">
              Status: <span className="text-[var(--color-text-primary)]">{curatedReturn.status}</span>
            </span>
          </div>

          {/* Owner Badge */}
          <div className="flex items-center gap-2 rounded-md bg-[var(--color-surface-elevated-bg)] px-3 py-1.5 border border-[var(--color-border-custom)]">
            <User2 className="h-4 w-4 text-purple-400" />
            <span className="text-xs font-semibold text-[var(--color-text-secondary)]">
              Next Action: <span className="text-[var(--color-text-primary)]">{curatedReturn.nextActionOwner}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Prototype Disclosure Banner */}
      <div className="flex items-start gap-3 rounded-md bg-blue-950/20 border border-[var(--color-primary-action)]/20 p-3.5 text-xs text-blue-200">
        <Info className="h-4 w-4 text-[var(--color-primary-action)] flex-shrink-0 mt-0.5" aria-hidden="true" />
        <p>
          <strong>Prototype Simulation Mode:</strong> Tax values, source documents, and AI analysis data are mock simulations. No actual tax filings will be submitted or processed.
        </p>
      </div>
    </header>
  );
};
export default ReturnHeader;
