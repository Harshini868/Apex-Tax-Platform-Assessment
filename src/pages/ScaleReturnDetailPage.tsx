import React from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { scaleDataset } from '../mock/scaleDataset';
import {
  ArrowLeft,
  FileText,
  ShieldAlert,
  FolderOpen,
  CheckSquare,
  MessageSquare,
  AlertTriangle,
} from 'lucide-react';

export const ScaleReturnDetailPage: React.FC = () => {
  const { returnId } = useParams();
  const navigate = useNavigate();

  // Find the generated return
  const ret = scaleDataset.returns.find((r) => r.returnId === returnId);

  // Recovery state if generated ID is unknown
  if (!ret) {
    return (
      <div className="max-w-2xl mx-auto my-12 p-8 border border-rose-500/30 bg-rose-950/20 rounded-lg text-center" role="alert">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-900/40 text-rose-200 mx-auto mb-4 border border-rose-500/40">
          <AlertTriangle className="h-6 w-6" aria-hidden="true" />
        </div>
        <h2 className="text-xl font-bold tracking-tight mb-2">Unknown Scale Return ID</h2>
        <p className="text-sm text-[var(--color-text-secondary)] mb-6">
          The return ID <code className="bg-rose-950 px-1.5 py-0.5 rounded font-mono text-rose-300">"{returnId}"</code> was not found in the scale dataset.
        </p>
        <button
          onClick={() => navigate('/dashboard/reviewer?dataset=scale')}
          className="inline-flex items-center gap-2 rounded-md bg-[var(--color-primary-action)] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[var(--color-primary-action)]/80"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Scale Dashboard
        </button>
      </div>
    );
  }

  // Determine badge colors based on severity
  let severityBadge = 'bg-zinc-950/40 text-zinc-400 border-zinc-700/30';
  if (ret.warningSeverity === 'CRITICAL') {
    severityBadge = 'bg-rose-950/40 text-rose-300 border-rose-500/30';
  } else if (ret.warningSeverity === 'HIGH') {
    severityBadge = 'bg-red-950/30 text-red-300 border-red-500/20';
  } else if (ret.warningSeverity === 'MEDIUM') {
    severityBadge = 'bg-amber-950/20 text-amber-300 border-amber-500/20';
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4">
      {/* Back Link */}
      <div className="flex items-center justify-between">
        <Link
          to="/dashboard/reviewer?dataset=scale"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Scale Queue
        </Link>
        <span className="text-[10px] text-zinc-500 font-mono">ID: {ret.returnId}</span>
      </div>

      {/* Main Panel Card */}
      <div className="bg-[var(--color-surface-bg)] border border-[var(--color-border-custom)] rounded-lg p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--color-border-custom)] pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-extrabold tracking-tight text-[var(--color-text-primary)]">
                {ret.clientName}
              </h1>
              <span className={`text-[10px] font-bold border px-2 py-0.5 rounded ${severityBadge}`}>
                {ret.warningSeverity} WARNING
              </span>
            </div>
            <p className="text-xs text-[var(--color-text-secondary)]">
              {ret.returnType} — Tax Year {ret.taxYear}
            </p>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-bold bg-amber-950/20 text-amber-400 border border-amber-500/20 px-2 py-1 rounded">
              Service Tier: {ret.serviceTarget}
            </span>
          </div>
        </div>

        {/* Read-only Disclosure Banner */}
        <div className="p-3 bg-amber-950/10 border border-amber-500/20 rounded-md text-xs text-amber-300 flex items-start gap-2">
          <ShieldAlert className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
          <div>
            <strong>Scale-Test Notice:</strong> This return is a deterministically generated record for scale testing. Signing off, approving, modifying, or locking values is disabled for this test fixture.
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h2 className="text-sm font-bold border-b border-[var(--color-border-custom)] pb-1 text-[var(--color-text-primary)]">
              Workflow Info
            </h2>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-[var(--color-text-secondary)] block">Filing Stage</span>
                <span className="font-semibold text-[var(--color-text-primary)]">{ret.stage}</span>
              </div>
              <div>
                <span className="text-[var(--color-text-secondary)] block">Workflow Status</span>
                <span className="font-semibold text-[var(--color-text-primary)]">{ret.status}</span>
              </div>
              <div>
                <span className="text-[var(--color-text-secondary)] block">Filing Due Date</span>
                <span className="font-semibold text-[var(--color-text-primary)]">
                  {new Date(ret.dueDate).toLocaleDateString()}
                </span>
              </div>
              <div>
                <span className="text-[var(--color-text-secondary)] block">Current Action Owner</span>
                <span className="font-semibold text-[var(--color-text-primary)]">{ret.nextActionOwner}</span>
              </div>
              <div>
                <span className="text-[var(--color-text-secondary)] block">Assigned Preparer</span>
                <span className="font-semibold text-[var(--color-text-primary)]">{ret.assignedPreparer}</span>
              </div>
              <div>
                <span className="text-[var(--color-text-secondary)] block">Assigned Reviewer</span>
                <span className="font-semibold text-[var(--color-text-primary)]">{ret.assignedReviewer}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-sm font-bold border-b border-[var(--color-border-custom)] pb-1 text-[var(--color-text-primary)]">
              Priority Reasoning
            </h2>
            <div className="space-y-2">
              {ret.priorityReasons.map((reason, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)]">
                  <div className="h-1.5 w-1.5 rounded-full bg-[var(--color-primary-action)]" />
                  <span>{reason}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Connection Counts */}
        <div className="pt-4 border-t border-[var(--color-border-custom)]">
          <h2 className="text-sm font-bold text-[var(--color-text-primary)] mb-3">Linked Activity summary</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-3 bg-[var(--color-surface-elevated-bg)]/30 border border-[var(--color-border-custom)] rounded-lg text-center">
              <FolderOpen className="h-5 w-5 text-sky-400 mx-auto mb-1.5" />
              <span className="text-xs text-[var(--color-text-secondary)] block">Documents</span>
              <span className="text-lg font-bold text-[var(--color-text-primary)]">{ret.linkedDocumentIds.length}</span>
            </div>
            <div className="p-3 bg-[var(--color-surface-elevated-bg)]/30 border border-[var(--color-border-custom)] rounded-lg text-center">
              <CheckSquare className="h-5 w-5 text-emerald-400 mx-auto mb-1.5" />
              <span className="text-xs text-[var(--color-text-secondary)] block">Tasks</span>
              <span className="text-lg font-bold text-[var(--color-text-primary)]">{ret.linkedTaskIds.length}</span>
            </div>
            <div className="p-3 bg-[var(--color-surface-elevated-bg)]/30 border border-[var(--color-border-custom)] rounded-lg text-center">
              <FileText className="h-5 w-5 text-amber-400 mx-auto mb-1.5" />
              <span className="text-xs text-[var(--color-text-secondary)] block">Requests</span>
              <span className="text-lg font-bold text-[var(--color-text-primary)]">{ret.linkedRequestIds.length}</span>
            </div>
            <div className="p-3 bg-[var(--color-surface-elevated-bg)]/30 border border-[var(--color-border-custom)] rounded-lg text-center">
              <MessageSquare className="h-5 w-5 text-purple-400 mx-auto mb-1.5" />
              <span className="text-xs text-[var(--color-text-secondary)] block">Messages</span>
              <span className="text-lg font-bold text-[var(--color-text-primary)]">{ret.linkedMessageIds.length}</span>
            </div>
          </div>
        </div>

        {/* CTA Actions */}
        <div className="flex gap-4 pt-2 justify-end">
          {ret.linkedDocumentIds.length > 0 ? (
            <Link
              to={`/return/${ret.returnId}/documents?dataset=scale`}
              className="inline-flex items-center gap-2 bg-[var(--color-primary-action)] text-white px-4 py-2.5 rounded-md text-xs font-bold transition-colors hover:bg-[var(--color-primary-action)]/95"
            >
              <FolderOpen className="h-4 w-4" />
              Explore Scale Documents ({ret.linkedDocumentIds.length})
            </Link>
          ) : (
            <span className="text-xs text-[var(--color-text-secondary)] italic">
              No documents linked to this return.
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
export default ScaleReturnDetailPage;
