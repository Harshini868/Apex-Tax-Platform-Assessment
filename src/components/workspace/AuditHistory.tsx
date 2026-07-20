import React from 'react';
import type { AuditEntry } from '../../domain/audit';
import { History, User, Sparkles } from 'lucide-react';

interface AuditHistoryProps {
  entries: AuditEntry[];
}

export const AuditHistory: React.FC<AuditHistoryProps> = ({ entries }) => {
  if (!entries || entries.length === 0) {
    return (
      <div className="text-xs text-[var(--color-text-secondary)] italic">
        No audit logs recorded. Initial extraction active.
      </div>
    );
  }

  const formatTimestamp = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
        <History className="h-4 w-4" aria-hidden="true" />
        <span>Verification & Correction Log</span>
      </div>

      <ul className="space-y-3" aria-label="Audit history log entries">
        {entries.map((entry) => {
          const isAI = entry.actor === 'AI System';
          return (
            <li
              key={entry.id}
              className="relative pl-6 pb-2 border-l border-[var(--color-border-custom)] last:pb-0"
            >
              {/* Dot marker */}
              <div className="absolute -left-1.5 top-1.5 h-3 w-3 rounded-full bg-[var(--color-surface-elevated-bg)] border border-[var(--color-border-custom)] flex items-center justify-center">
                <div className="h-1.5 w-1.5 rounded-full bg-[var(--color-primary-action)]" />
              </div>

              <div className="flex flex-col text-xs gap-1">
                <div className="flex items-center gap-2">
                  {isAI ? (
                    <Sparkles className="h-3 w-3 text-purple-400" aria-hidden="true" />
                  ) : (
                    <User className="h-3 w-3 text-blue-400" aria-hidden="true" />
                  )}
                  <span className="font-semibold text-[var(--color-text-primary)]">
                    {entry.actor}
                  </span>
                  <span className="text-[var(--color-text-secondary)]">
                    ({entry.actorRole})
                  </span>
                  <span className="text-[var(--color-text-secondary)] ml-auto">
                    {formatTimestamp(entry.timestamp)}
                  </span>
                </div>

                <div className="text-[var(--color-text-primary)] font-medium">
                  {entry.action === 'INITIAL_EXTRACTION' && (
                    <span>Extracted initial value: {entry.newValue}</span>
                  )}
                  {entry.action === 'VERIFY_VALUE' && (
                    <span>Verified source match: {entry.newValue}</span>
                  )}
                  {entry.action === 'LOCK_VALUE' && (
                    <span>Locked verified value: {entry.newValue}</span>
                  )}
                  {entry.action === 'CORRECT_VALUE' && (
                    <span>
                      Corrected value from {entry.previousValue} to {entry.newValue}
                    </span>
                  )}
                </div>

                {entry.reason && (
                  <p className="text-[var(--color-text-secondary)] bg-[var(--color-surface-elevated-bg)]/40 p-1.5 rounded border border-[var(--color-border-custom)]/40">
                    Reason: "{entry.reason}"
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
export default AuditHistory;
