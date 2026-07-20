import React from 'react';
import type { ProgressStage } from '../../domain/progress';
import { CheckCircle2, Circle, AlertCircle, User } from 'lucide-react';

interface ClientProgressProps {
  stages: ProgressStage[];
}

export const ClientProgress: React.FC<ClientProgressProps> = ({ stages }) => {
  // Find current/active stage (usually the first one that is IN_PROGRESS or BLOCKED)
  const currentStage = stages.find((s) => s.status === 'IN_PROGRESS' || s.status === 'BLOCKED') || stages[0];
  const blockerCount = currentStage.blockerIds.length;

  return (
    <div className="bg-[var(--color-surface-bg)] border border-[var(--color-border-custom)] rounded-lg p-5 space-y-5" role="region" aria-label="Progress timeline tracker">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--color-border-custom)] pb-4">
        <div>
          <span className="block text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
            Current Stage
          </span>
          <h3 className="text-lg font-extrabold text-[var(--color-text-primary)]">
            {currentStage.clientLabel}
          </h3>
        </div>
        <div className="flex items-center gap-2 bg-[var(--color-surface-elevated-bg)] px-3 py-1.5 rounded border border-[var(--color-border-custom)] text-xs">
          <User className="h-3.5 w-3.5 text-[var(--color-primary-action)]" />
          <span className="text-[var(--color-text-secondary)] font-medium">
            Next Action: <span className="font-bold text-[var(--color-text-primary)]">{currentStage.nextActionOwner === 'CLIENT' ? 'You' : 'Tax Preparer'}</span>
          </span>
        </div>
      </div>

      {/* Blocker Banner */}
      {blockerCount > 0 && (
        <div className="flex items-start gap-3 bg-amber-500/10 border border-amber-500/30 text-amber-200 p-3 rounded text-xs" role="alert">
          <AlertCircle className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <span className="font-bold">Outstanding Actions:</span> Waiting for W-2 file upload and crypto question response.
          </div>
        </div>
      )}

      {/* Stages Stepper */}
      <nav aria-label="Tax filing milestone steps">
        <ol className="space-y-4">
          {stages.map((stage) => {
            const isCompleted = stage.status === 'COMPLETED';
            const isInProgress = stage.status === 'IN_PROGRESS';
            
            return (
              <li
                key={stage.id}
                className="flex items-start gap-3 text-xs"
              >
                <div className="mt-0.5">
                  {isCompleted ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" role="img" aria-label="Completed stage" />
                  ) : isInProgress ? (
                    <div className="h-4 w-4 rounded-full border-2 border-[var(--color-primary-action)] flex items-center justify-center" role="img" aria-label="Current active stage">
                      <div className="h-1.5 w-1.5 rounded-full bg-[var(--color-primary-action)]" />
                    </div>
                  ) : (
                    <Circle className="h-4 w-4 text-[var(--color-border-custom)]" role="img" aria-label="Future stage" />
                  )}
                </div>
                <div className="space-y-0.5">
                  <span className={`block font-bold ${isCompleted ? 'text-emerald-400' : isInProgress ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-secondary)]'}`}>
                    {stage.clientLabel}
                  </span>
                  <span className="block text-[var(--color-text-secondary)]">
                    {stage.description}
                  </span>
                  {isCompleted && stage.completedAt && (
                    <span className="block text-[10px] text-[var(--color-text-secondary)] italic">
                      Completed on {new Date(stage.completedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  );
};
export default ClientProgress;
