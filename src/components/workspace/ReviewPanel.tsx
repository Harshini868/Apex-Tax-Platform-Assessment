import React, { useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import type { ReviewChecklistStatus } from '../../domain/review';
import {
  CheckCircle,
  AlertTriangle,
  FileText,
  Sliders,
  CheckCircle2,
  Lock,
  ArrowRight,
  Undo2,
} from 'lucide-react';

export const ReviewPanel: React.FC = () => {
  const {
    state,
    updateReviewChecklist,
    updateReviewDecisionReason,
    approveReviewUnchanged,
    correctAndApprove,
    returnToPreparer,
    cancelReviewCorrection,
  } = useApp();

  const { selectedReviewCase, currentRole, journeyThreeFeedback } = state;
  const reasonRef = useRef<HTMLTextAreaElement>(null);
  const checklistRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  useEffect(() => {
    // Accessibility: Focus first unresolved required checklist item on checklist error
    if (journeyThreeFeedback?.toLowerCase().includes('checklist items are unresolved')) {
      const firstUnresolved = selectedReviewCase?.checklistItems.find(
        (item) => item.required && item.status === 'NOT_REVIEWED'
      );
      if (firstUnresolved && checklistRefs.current[firstUnresolved.id]) {
        checklistRefs.current[firstUnresolved.id]?.focus();
      }
    } else if (journeyThreeFeedback?.toLowerCase().includes('explanation reason is required')) {
      reasonRef.current?.focus();
    }
  }, [journeyThreeFeedback, selectedReviewCase]);

  if (!selectedReviewCase) {
    return (
      <div className="bg-[var(--color-surface-bg)] border border-[var(--color-border-custom)] rounded-lg p-6 text-center text-xs text-[var(--color-text-secondary)] italic">
        No active review case loaded for this return.
      </div>
    );
  }

  const isReviewer = currentRole === 'reviewer';
  const isApproved = selectedReviewCase.status === 'REVIEWER_APPROVED';


  const draftCorrection = selectedReviewCase.decision?.correction;

  const handleUpdateChecklist = (itemId: string, status: ReviewChecklistStatus) => {
    if (!isReviewer || isApproved) return;
    updateReviewChecklist(itemId, status);
  };

  const handleApproveUnchanged = () => {
    approveReviewUnchanged('reviewer-marcus-vance', 'Marcus Vance');
  };

  const handleCorrectAndApprove = () => {
    correctAndApprove('reviewer-marcus-vance', 'Marcus Vance');
  };

  const handleReturnToPreparer = () => {
    returnToPreparer('reviewer-marcus-vance', 'Marcus Vance');
  };

  return (
    <div className="bg-[var(--color-surface-bg)] border border-[var(--color-border-custom)] rounded-lg p-6 space-y-6" aria-label="Reviewer control center">
      <div className="border-b border-[var(--color-border-custom)] pb-3">
        <h2 className="text-lg font-bold text-[var(--color-text-primary)]">Reviewer Control Center</h2>
        <p className="text-xs text-[var(--color-text-secondary)]">
          Senior Auditor: <strong>Marcus Vance</strong> | Case Status: <strong>{selectedReviewCase.status}</strong>
        </p>
      </div>

      {/* 1. Review Checklist */}
      <div className="space-y-4">
        <h3 className="text-xs font-extrabold uppercase text-[var(--color-text-secondary)] flex items-center gap-2">
          <Sliders className="h-4 w-4" />
          Review Checklist
        </h3>

        <div className="space-y-3">
          {selectedReviewCase.checklistItems.map((item) => {
            const isUnresolved = item.required && item.status === 'NOT_REVIEWED';
            return (
              <div
                key={item.id}
                className={`p-3 rounded-md border text-xs space-y-2 transition-colors ${
                  isUnresolved
                    ? 'border-amber-500/20 bg-amber-950/10'
                    : 'border-[var(--color-border-custom)] bg-[var(--color-surface-elevated-bg)]/20'
                }`}
              >
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <span className="font-bold text-[var(--color-text-primary)] block">
                      {item.label} {item.required && <span className="text-amber-500 font-bold">*</span>}
                    </span>
                    <span className="text-[var(--color-text-secondary)] block mt-0.5">{item.description}</span>
                  </div>
                  <span className={`text-[10px] px-1.5 py-0.5 font-bold rounded uppercase ${
                    item.status === 'ACCEPTED'
                      ? 'bg-emerald-950/30 text-emerald-300'
                      : item.status === 'NEEDS_CORRECTION'
                      ? 'bg-rose-950/30 text-rose-300'
                      : item.status === 'NOT_APPLICABLE'
                      ? 'bg-zinc-800 text-zinc-400'
                      : 'bg-zinc-950 text-zinc-400 border border-zinc-800'
                  }`}>
                    {item.status.replace('_', ' ')}
                  </span>
                </div>

                {isReviewer && !isApproved && (
                  <div className="flex gap-1.5 pt-1.5 border-t border-[var(--color-border-custom)]/40">
                    <button
                      ref={(el) => { checklistRefs.current[item.id] = el; }}
                      onClick={() => handleUpdateChecklist(item.id, 'ACCEPTED')}
                      className={`px-2.5 py-1 rounded font-semibold text-[10px] transition-colors ${
                        item.status === 'ACCEPTED'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-[var(--color-surface-bg)] border border-[var(--color-border-custom)] text-[var(--color-text-primary)] hover:bg-[var(--color-border-custom)]'
                      }`}
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleUpdateChecklist(item.id, 'NEEDS_CORRECTION')}
                      className={`px-2.5 py-1 rounded font-semibold text-[10px] transition-colors ${
                        item.status === 'NEEDS_CORRECTION'
                          ? 'bg-rose-600 text-white'
                          : 'bg-[var(--color-surface-bg)] border border-[var(--color-border-custom)] text-[var(--color-text-primary)] hover:bg-[var(--color-border-custom)]'
                      }`}
                    >
                      Needs Correction
                    </button>
                    <button
                      onClick={() => handleUpdateChecklist(item.id, 'NOT_APPLICABLE')}
                      className={`px-2.5 py-1 rounded font-semibold text-[10px] transition-colors ${
                        item.status === 'NOT_APPLICABLE'
                          ? 'bg-zinc-600 text-white'
                          : 'bg-[var(--color-surface-bg)] border border-[var(--color-border-custom)] text-[var(--color-text-primary)] hover:bg-[var(--color-border-custom)]'
                      }`}
                    >
                      N/A
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Reviewer Correction Draft Section */}
      <div className="space-y-3 pt-3 border-t border-[var(--color-border-custom)]/40">
        <h3 className="text-xs font-extrabold uppercase text-[var(--color-text-secondary)] flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Reviewer Correction Draft
        </h3>

        {draftCorrection ? (
          <div className="p-3 bg-emerald-950/15 border border-emerald-500/25 rounded-md text-xs space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <CheckCircle2 className="h-4 w-4" />
              <span>Staged Correction Active</span>
            </div>
            <div className="grid grid-cols-3 gap-2 py-1 text-center font-mono">
              <div className="p-1 bg-zinc-950/40 rounded">
                <span className="text-[9px] text-zinc-500 block uppercase">Original</span>
                <span className="text-xs font-bold text-zinc-400 line-through">{draftCorrection.originalValue}</span>
              </div>
              <div className="p-1 bg-zinc-950/40 rounded">
                <span className="text-[9px] text-zinc-500 block uppercase">Preparer</span>
                <span className="text-xs font-bold text-zinc-400">{draftCorrection.preparerValue}</span>
              </div>
              <div className="p-1 bg-emerald-950/50 rounded border border-emerald-500/25">
                <span className="text-[9px] text-emerald-500 block uppercase">Reviewer</span>
                <span className="text-xs font-bold text-emerald-300">{draftCorrection.reviewerValue}</span>
              </div>
            </div>
            <div className="text-[11px] text-[var(--color-text-secondary)] pt-1 border-t border-emerald-500/20">
              <strong>Draft Reason:</strong> {draftCorrection.reason}
            </div>
            {!isApproved && isReviewer && (
              <button
                onClick={cancelReviewCorrection}
                className="mt-1 inline-flex items-center gap-1 text-[10px] font-bold text-rose-400 hover:underline"
              >
                <Undo2 className="h-3 w-3" />
                Discard Correction Draft
              </button>
            )}
          </div>
        ) : (
          <div className="text-xs text-[var(--color-text-secondary)] bg-[var(--color-surface-elevated-bg)]/20 p-3 rounded-md border border-[var(--color-border-custom)]/40 italic">
            No draft correction active. Click "Correct value" in the center review panel to override wages/interest details.
          </div>
        )}
      </div>

      {/* 3. Final Decision Form */}
      <div className="space-y-4 pt-3 border-t border-[var(--color-border-custom)]/40">
        <h3 className="text-xs font-extrabold uppercase text-[var(--color-text-secondary)]">
          Audit Decision Note
        </h3>

        <div className="space-y-2">
          <label htmlFor="decision-reason" className="block text-xs font-medium text-[var(--color-text-secondary)]">
            Compliance Explanation / Preparer Correction Note
          </label>
          <textarea
            id="decision-reason"
            ref={reasonRef}
            rows={3}
            disabled={!isReviewer || isApproved}
            value={selectedReviewCase.decisionReason || ''}
            onChange={(e) => updateReviewDecisionReason(e.target.value)}
            placeholder="Provide a required description reason for your unchanged approval justification or return-to-preparer instructions..."
            className="w-full text-xs bg-[var(--color-surface-elevated-bg)] border border-[var(--color-border-custom)] rounded-md px-3 py-2 text-[var(--color-text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary-action)]"
          />
        </div>

        {/* Feedback Messages */}
        {journeyThreeFeedback && (
          <div
            className={`p-3 rounded-md border text-xs flex gap-2 items-start ${
              journeyThreeFeedback.toLowerCase().includes('successfully') || journeyThreeFeedback.includes('added')
                ? 'border-emerald-500/20 bg-emerald-950/15 text-emerald-300'
                : 'border-rose-500/20 bg-rose-950/20 text-rose-300'
            }`}
            role="alert"
          >
            {journeyThreeFeedback.toLowerCase().includes('successfully') ? (
              <CheckCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
            )}
            <span>{journeyThreeFeedback}</span>
          </div>
        )}

        {/* Action Buttons */}
        {isReviewer && !isApproved && (
          <div className="flex flex-col gap-2 pt-2">
            <div className="flex gap-2">
              <button
                onClick={handleApproveUnchanged}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-md text-xs font-bold transition-colors"
                aria-label="Approve unchanged"
              >
                Approve Unchanged
              </button>

              {draftCorrection && (
                <button
                  onClick={handleCorrectAndApprove}
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-[var(--color-primary-action)] hover:bg-[var(--color-primary-action)]/90 text-white px-4 py-2.5 rounded-md text-xs font-bold transition-colors"
                  aria-label="Correct and approve"
                >
                  <Lock className="h-3.5 w-3.5" />
                  Correct & Approve
                </button>
              )}
            </div>

            <button
              onClick={handleReturnToPreparer}
              className="inline-flex items-center justify-center gap-2 bg-rose-650 hover:bg-rose-700 text-white px-4 py-2.5 rounded-md text-xs font-bold transition-colors"
              aria-label="Return to preparer"
            >
              Return to Preparer
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {isApproved && (
          <div className="p-3 bg-emerald-950/10 border border-emerald-500/20 rounded-md text-center text-xs text-emerald-400 font-bold">
            This return has been verified and locked by Senior CPA Marcus Vance.
          </div>
        )}
      </div>
    </div>
  );
};
