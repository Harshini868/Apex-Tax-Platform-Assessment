import React from 'react';
import type { OnboardingStep } from '../../domain/onboarding';
import { CheckCircle2, Circle, AlertCircle } from 'lucide-react';

interface OnboardingStepListProps {
  steps: OnboardingStep[];
  selectedStepId: string | null;
  onSelectStep: (stepId: string) => void;
}

export const OnboardingStepList: React.FC<OnboardingStepListProps> = ({
  steps,
  selectedStepId,
  onSelectStep,
}) => {
  return (
    <div className="bg-[var(--color-surface-bg)] border border-[var(--color-border-custom)] rounded-lg p-4 space-y-4" role="region" aria-label="Onboarding checklist tracker">
      <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
        Onboarding Steps
      </h3>
      <nav aria-label="Onboarding step checklist navigation">
        <ul className="space-y-2 list-none p-0 m-0">
          {steps.map((step) => {
            const isSelected = step.id === selectedStepId;
            const isCompleted = step.status === 'COMPLETED';
            const isBlocked = step.status === 'BLOCKED';

            return (
              <li key={step.id}>
                <button
                  onClick={() => onSelectStep(step.id)}
                  className={`w-full text-left flex items-start gap-3 p-3 rounded-md text-xs font-semibold transition-colors cursor-pointer border focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-primary-action)] ${
                    isSelected
                      ? 'bg-[var(--color-surface-elevated-bg)] border-[var(--color-primary-action)] text-[var(--color-text-primary)]'
                      : 'bg-transparent border-transparent text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-elevated-bg)] hover:text-[var(--color-text-primary)]'
                  }`}
                  aria-current={isSelected ? 'step' : undefined}
                >
                  <div className="mt-0.5 flex-shrink-0">
                    {isCompleted ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" role="img" aria-label="Step completed" />
                    ) : isBlocked ? (
                      <AlertCircle className="h-4 w-4 text-rose-400" role="img" aria-label="Step blocked" />
                    ) : (
                      <Circle className="h-4 w-4 text-[var(--color-border-custom)]" role="img" aria-label="Step incomplete" />
                    )}
                  </div>
                  <div className="space-y-0.5">
                    <span className="block text-[var(--color-text-primary)]">{step.title}</span>
                    <span className="block text-[10px] text-[var(--color-text-secondary)] font-normal leading-relaxed">
                      {step.description}
                    </span>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span
                        className={`inline-flex items-center rounded px-1.5 py-0.5 text-[8px] font-bold ${
                          isCompleted
                            ? 'bg-emerald-500/10 text-emerald-300'
                            : step.status === 'IN_PROGRESS'
                            ? 'bg-blue-950 text-blue-200 border border-blue-400'
                            : 'bg-[var(--color-surface-bg)] text-[var(--color-text-secondary)] border border-[var(--color-border-custom)]'
                        }`}
                      >
                        {step.status.replace('_', ' ')}
                      </span>
                      {step.required && (
                        <span className="text-[8px] font-bold text-amber-400 uppercase tracking-tight">
                          Required
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};
export default OnboardingStepList;
