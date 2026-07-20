import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import type { TaxField } from '../../domain/return';
import { FieldStatusBadge } from './FieldStatusBadge';
import { CorrectionForm } from './CorrectionForm';
import { AuditHistory } from './AuditHistory';
import { CheckCircle2, Lock, Edit3 } from 'lucide-react';

interface FieldReviewPanelProps {
  field: TaxField;
}

export const FieldReviewPanel: React.FC<FieldReviewPanelProps> = ({ field }) => {
  const {
    state,
    startCorrection,
    updateCorrectionDraft,
    cancelCorrection,
    saveCorrection,
    verifyField,
    lockField,
    startReviewCorrection,
    updateReviewCorrection,
    cancelReviewCorrection,
    saveReviewCorrection,
  } = useApp();
  const { currentRole } = state;

  const [lockReason, setLockReason] = useState('');
  const [showLockInput, setShowLockInput] = useState(false);
  const [isWhyLockedOpen, setIsWhyLockedOpen] = useState(false);

  const isClient = currentRole === 'client';
  const isReviewer = currentRole === 'reviewer';
  // A senior-reviewer correction (Journey 3, tied to a ReviewCase) is a distinct workflow from a
  // preparer's plain field correction (Journey 1) — same shared draft state, different actions,
  // different required acknowledgement.
  const isReviewCaseCorrection = isReviewer && !!state.selectedReviewCase;

  const isLocked = field.verificationState === 'REVIEWER_VERIFIED_LOCKED';
  const isVerified = field.verificationState === 'PREPARER_VERIFIED';
  const hasIncompleteEvidence =
    field.verificationState === 'MISSING_EVIDENCE' || field.verificationState === 'CONFLICTING_EVIDENCE';

  const handleVerify = () => {
    verifyField(field.id, currentRole === 'reviewer' ? 'Marcus Vance' : 'David Chen', currentRole as any);
  };

  const handleLockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lockReason.trim()) return;
    lockField(field.id, 'Marcus Vance', 'reviewer', lockReason);
    setShowLockInput(false);
    setLockReason('');
  };

  const getLockAuditLog = () => {
    return field.auditEntries.find((entry) => entry.action === 'LOCK_VALUE');
  };

  const lockAudit = getLockAuditLog();

  return (
    <div className="space-y-6 bg-[var(--color-surface-bg)] rounded-lg border border-[var(--color-border-custom)] p-6">
      {/* Panel Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--color-border-custom)] pb-4">
        <div>
          <span className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase">
            {field.lineReference}
          </span>
          <h2 className="text-xl font-bold tracking-tight text-[var(--color-text-primary)]">
            {field.label}
          </h2>
        </div>
        <FieldStatusBadge state={field.verificationState} />
      </div>

      {/* Field Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[var(--color-surface-elevated-bg)]/40 p-4 rounded-md border border-[var(--color-border-custom)]/40">
        <div>
          <span className="block text-xs font-medium text-[var(--color-text-secondary)]">Current Calculated Value</span>
          <span className="text-2xl font-bold text-[var(--color-text-primary)] font-mono">{field.formattedValue}</span>
        </div>
        {field.originalValue && (
          <div>
            <span className="block text-xs font-medium text-[var(--color-text-secondary)]">Original Extracted Value</span>
            <span className="text-lg font-semibold text-[var(--color-text-secondary)] line-through font-mono">{field.originalValue}</span>
          </div>
        )}
      </div>

      {/* Action Controls */}
      <div className="space-y-4">
        {state.isCorrecting ? (
          <CorrectionForm
            originalValue={field.originalValue || field.formattedValue}
            initialValue={field.rawValue?.toString() || ''}
            requireEvidenceAcknowledgement={isReviewCaseCorrection}
            onSave={(val, reason, evidenceReviewed) => {
              if (isReviewCaseCorrection) {
                updateReviewCorrection(val, reason, !!evidenceReviewed);
                saveReviewCorrection();
              } else {
                updateCorrectionDraft(val, reason);
                saveCorrection(currentRole === 'reviewer' ? 'Marcus Vance' : 'David Chen', currentRole as any);
              }
            }}
            onCancel={isReviewCaseCorrection ? cancelReviewCorrection : cancelCorrection}
          />
        ) : (
          <div className="flex flex-wrap gap-3">
            {/* Preparer / Reviewer Edit Controls */}
            {!isClient && !isLocked && (
              <button
                onClick={() => (isReviewCaseCorrection ? startReviewCorrection(field.id) : startCorrection())}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-surface-elevated-bg)] border border-[var(--color-border-custom)] hover:bg-[var(--color-border-custom)] rounded-md text-sm font-semibold transition-colors"
                aria-label={`Correct value of ${field.label}`}
              >
                <Edit3 className="h-4 w-4" aria-hidden="true" />
                Correct value
              </button>
            )}

            {/* Verification Button for Preparer/Reviewer */}
            {!isClient && !isLocked && !isVerified && (
              <button
                onClick={handleVerify}
                disabled={hasIncompleteEvidence}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-primary-action)] text-white hover:bg-[var(--color-primary-action)]/80 disabled:opacity-50 disabled:cursor-not-allowed rounded-md text-sm font-semibold transition-colors"
                aria-label={`Verify source match for ${field.label}`}
              >
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                Verify source match
              </button>
            )}

            {/* Lock Control for Reviewer */}
            {isReviewer && !isLocked && !hasIncompleteEvidence && (
              <div className="w-full mt-2">
                {!showLockInput ? (
                  <button
                    onClick={() => setShowLockInput(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-700 text-white hover:bg-emerald-800 rounded-md text-sm font-semibold transition-colors"
                    aria-label={`Verify and lock ${field.label}`}
                  >
                    <Lock className="h-4 w-4" aria-hidden="true" />
                    Verify and lock field
                  </button>
                ) : (
                  <form onSubmit={handleLockSubmit} className="space-y-3 p-3 bg-emerald-950/20 border border-emerald-500/20 rounded-md">
                    <label htmlFor="lock-reason" className="block text-xs font-semibold text-[var(--color-text-secondary)]">
                      Specify locking reason (Required for compliance)
                    </label>
                    <div className="flex gap-2">
                      <input
                        id="lock-reason"
                        type="text"
                        required
                        value={lockReason}
                        onChange={(e) => setLockReason(e.target.value)}
                        placeholder="e.g. Verified with 1099-INT Schedule Ledger"
                        className="flex-1 bg-[var(--color-surface-bg)] border border-[var(--color-border-custom)] rounded-md px-3 py-1.5 text-sm"
                      />
                      <button
                        type="submit"
                        className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded"
                      >
                        Confirm Lock
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowLockInput(false)}
                        className="px-3 py-1.5 bg-[var(--color-surface-elevated-bg)] hover:bg-[var(--color-border-custom)] text-xs font-bold rounded"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        )}

        {/* Locked explanation disclosure (Accessible) */}
        {isLocked && (
          <div className="p-4 rounded-md border border-gray-600 bg-gray-900/40 text-sm">
            <div className="flex items-center gap-2 text-gray-300 font-semibold mb-2">
              <Lock className="h-4 w-4 text-emerald-400" aria-hidden="true" />
              <span>Field Locked by Reviewer</span>
            </div>
            <p className="text-xs text-[var(--color-text-secondary)] mb-3">
              Locked by: <span className="text-[var(--color-text-primary)] font-medium">{lockAudit?.actor || 'Marcus Vance'}</span> on {lockAudit ? new Date(lockAudit.timestamp).toLocaleDateString() : ''}
            </p>

            <button
              onClick={() => setIsWhyLockedOpen(!isWhyLockedOpen)}
              className="text-xs font-bold text-[var(--color-primary-emphasis-text)] hover:underline"
              aria-expanded={isWhyLockedOpen}
              aria-controls="locked-explanation-content"
            >
              Why is this locked?
            </button>

            {isWhyLockedOpen && (
              <div id="locked-explanation-content" className="mt-2 text-xs text-[var(--color-text-secondary)] bg-gray-950/40 p-2.5 rounded border border-gray-800">
                {lockAudit?.reason || 'Verified compliance check completed. Changes are restricted.'}
              </div>
            )}
          </div>
        )}

        {/* Client message portal view */}
        {isClient && (
          <div className="p-4 rounded-md border border-[var(--color-border-custom)] bg-[var(--color-surface-elevated-bg)]/20 text-xs">
            <span className="font-semibold block mb-1 text-[var(--color-text-primary)]">Client Transparency View</span>
            <p className="text-[var(--color-text-secondary)]">
              This field is currently being prepared and verified by Apex Tax Solutions LLP. Overwrites and audit verifications are restricted to licensed CPA staff.
            </p>
          </div>
        )}
      </div>

      {/* Audit Log component list */}
      <div className="border-t border-[var(--color-border-custom)] pt-6">
        <AuditHistory entries={field.auditEntries} />
      </div>
    </div>
  );
};
export default FieldReviewPanel;
