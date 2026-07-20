import React, { useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useNavigate } from 'react-router';
import { ClientProgress } from './ClientProgress';
import { Shield, ArrowRight, Clock, Calendar, CheckSquare, Info } from 'lucide-react';

export const ClientWelcome: React.FC = () => {
  const { state, acknowledgeWelcome } = useApp();
  const { onboardingProfile, documentRequests, progressStages } = state;
  const navigate = useNavigate();

  // First login is acknowledged automatically on arrival — it's a state flag, not a
  // meaningful onboarding step, so it should never block or delay the dominant action below.
  useEffect(() => {
    if (onboardingProfile.firstLogin) {
      acknowledgeWelcome();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onboardingProfile.firstLogin]);

  const currentW2Request = documentRequests['req-john-w2'];
  const isW2Submitted = currentW2Request?.status === 'SUBMITTED' || currentW2Request?.status === 'APPROVED';

  return (
    <div className="space-y-6">
      {/* Client Home Main Viewport Dashboard */}
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-[var(--color-text-primary)]">
          Welcome, John
        </h1>
        <p className="text-xs text-[var(--color-text-secondary)]">
          Filing Entity: <strong>2025 Form 1040 (Personal Income Tax)</strong>
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Column A: Primary Action Card (Covers 2 spans on large viewports) */}
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-[var(--color-surface-bg)] border border-[var(--color-border-custom)] rounded-lg p-6 space-y-6" aria-label="Dominant Required Action queue">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 mt-1">
                <CheckSquare className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <span className="inline-flex items-center rounded bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-300 border border-amber-500/20">
                  Required Now
                </span>
                <h2 className="text-lg font-bold text-[var(--color-text-primary)]">
                  {isW2Submitted
                    ? 'No outstanding client actions'
                    : 'Provide your 2025 W-2 and answer 1 question'}
                </h2>
                <p className="text-xs text-[var(--color-text-secondary)]">
                  {isW2Submitted
                    ? 'Thank you! Your CPA, David Chen, is preparing your tax file.'
                    : 'David Chen needs this information before preparation can continue.'}
                </p>
              </div>
            </div>

            {!isW2Submitted && currentW2Request && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-b border-[var(--color-border-custom)] py-4 text-xs">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-[var(--color-text-secondary)]" aria-hidden="true" />
                    <div>
                      <span className="block text-[10px] text-[var(--color-text-secondary)] font-medium">DUE DATE</span>
                      <span className="font-semibold text-[var(--color-text-primary)]">
                        {new Date(currentW2Request.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-[var(--color-text-secondary)]" aria-hidden="true" />
                    <div>
                      <span className="block text-[10px] text-[var(--color-text-secondary)] font-medium">EST. TIME</span>
                      <span className="font-semibold text-[var(--color-text-primary)]">
                        5 minutes
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-[var(--color-text-secondary)]" aria-hidden="true" />
                    <div>
                      <span className="block text-[10px] text-[var(--color-text-secondary)] font-medium">RETURN CONTEXT</span>
                      <span className="font-semibold text-[var(--color-text-primary)]">
                        2025 Form 1040
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => navigate('/onboarding?step=required-information&request=req-john-w2')}
                    className="inline-flex items-center gap-2 rounded-md bg-[var(--color-primary-action-btn)] px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 transition-colors cursor-pointer"
                  >
                    Continue Required Action
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </>
            )}

            {isW2Submitted && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-200 p-4 rounded text-xs">
                Your next required action is cleared. The file has been transmitted in simulation mode to your tax preparer.
              </div>
            )}
          </section>

          {/* Prototype Policy Notice Disclosure */}
          <div className="flex items-start gap-3 rounded-lg bg-blue-950/20 border border-[var(--color-primary-action)]/20 p-4 text-xs text-blue-200">
            <Info className="h-4 w-4 text-[var(--color-primary-action)] flex-shrink-0 mt-0.5" aria-hidden="true" />
            <div className="space-y-1">
              <span className="font-bold">Prototype Simulation:</span>
              <p>
                Tax returns, digital questions, and message composition are fully client-side mock simulations. No actual files are stored or uploaded, and no filings are submitted to the IRS.
              </p>
            </div>
          </div>
        </div>

        {/* Column B: Timeline Progress Stage Tracker */}
        <aside className="lg:col-span-1" aria-label="Milestone Progress Sidebar">
          <ClientProgress stages={progressStages} />
        </aside>
      </div>
    </div>
  );
};
export default ClientWelcome;
