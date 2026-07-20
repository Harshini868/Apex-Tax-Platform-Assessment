import React from 'react';
import { useApp } from '../../context/AppContext';
import { History } from 'lucide-react';

export const HistoryPanel: React.FC = () => {
  const { state } = useApp();
  const { reviewStatusEvents, currentRole } = state;

  // Filter events: Client can NOT view STAFF_ONLY status events
  const visibleEvents = reviewStatusEvents.filter(
    (evt) => evt.visibility !== 'STAFF_ONLY' || currentRole !== 'client'
  );

  return (
    <div className="bg-[var(--color-surface-bg)] border border-[var(--color-border-custom)] rounded-lg p-5 space-y-4" aria-label="Filing audit trail">
      <div className="border-b border-[var(--color-border-custom)] pb-3 flex items-center gap-2">
        <History className="h-5 w-5 text-[var(--color-primary-action)]" />
        <h2 className="text-sm font-bold text-[var(--color-text-primary)]">Filing Audit Trail</h2>
      </div>

      <div className="relative border-l border-[var(--color-border-custom)] ml-3 pl-5 space-y-6 py-2 text-xs">
        {visibleEvents.map((evt) => {
          // Determine status badges or highlights
          const isAI = evt.actorRole === 'system';
          const isReviewer = evt.actorRole === 'reviewer';

          return (
            <div key={evt.id} className="relative">
              {/* Bullet Dot */}
              <span className={`absolute -left-[26px] top-0.5 flex h-3 w-3 items-center justify-center rounded-full ring-4 ring-[var(--color-surface-bg)] ${
                isAI
                  ? 'bg-purple-500'
                  : isReviewer
                  ? 'bg-emerald-500'
                  : 'bg-[var(--color-primary-action)]'
              }`} />

              <div className="space-y-1">
                {/* Header info */}
                <div className="flex items-center justify-between text-[10px] text-[var(--color-text-secondary)]">
                  <span className="font-semibold uppercase tracking-wider">
                    {evt.actorName} ({evt.actorRole})
                  </span>
                  <span className="font-mono">
                    {new Date(evt.createdAt).toLocaleString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                {/* Event summary */}
                <p className="text-[var(--color-text-primary)] font-bold">
                  {evt.action.replace(/_/g, ' ')}
                </p>

                {/* Status transition details */}
                <div className="flex items-center gap-1.5 py-0.5 font-mono text-[10px] text-[var(--color-text-secondary)]">
                  <span>Owner:</span>
                  <span className="text-[var(--color-text-primary)] font-bold">{evt.previousOwner}</span>
                  <span>→</span>
                  <span className="text-[var(--color-text-primary)] font-bold">{evt.newOwner}</span>
                </div>

                {/* Note / Reason */}
                {evt.reason && (
                  <p className="p-2 bg-[var(--color-surface-elevated-bg)]/35 border border-[var(--color-border-custom)]/40 rounded text-[var(--color-text-secondary)] italic leading-relaxed">
                    Note: "{evt.reason}"
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
