import React from 'react';
import type { VerificationState } from '../../domain/return';
import { Sparkles, CheckCircle2, AlertTriangle, AlertOctagon, HelpCircle, Lock } from 'lucide-react';

interface FieldStatusBadgeProps {
  state: VerificationState;
}

export const FieldStatusBadge: React.FC<FieldStatusBadgeProps> = ({ state }) => {
  const getBadgeConfig = () => {
    switch (state) {
      case 'AI_GENERATED_UNVERIFIED':
        return {
          bg: 'bg-purple-950/45 border-purple-500/30 text-purple-200',
          icon: Sparkles,
          label: 'AI Extracted',
        };
      case 'PREPARER_VERIFIED':
        return {
          bg: 'bg-emerald-950/45 border-emerald-500/30 text-emerald-200',
          icon: CheckCircle2,
          label: 'Verified',
        };
      case 'USER_CORRECTED_AWAITING_REVIEW':
        return {
          bg: 'bg-amber-950/45 border-amber-500/30 text-amber-200',
          icon: AlertTriangle,
          label: 'Awaiting Review',
        };
      case 'REVIEWER_VERIFIED_LOCKED':
        return {
          bg: 'bg-gray-800 border-gray-600 text-gray-300',
          icon: Lock,
          label: 'Locked',
        };
      case 'CONFLICTING_EVIDENCE':
        return {
          bg: 'bg-rose-950/45 border-rose-500/30 text-rose-200',
          icon: AlertOctagon,
          label: 'Conflict',
        };
      case 'MISSING_EVIDENCE':
        return {
          bg: 'bg-zinc-800 border-zinc-600 text-zinc-400',
          icon: HelpCircle,
          label: 'Missing Evidence',
        };
    }
  };

  const config = getBadgeConfig();
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${config.bg}`}>
      <Icon className="h-3 w-3" aria-hidden="true" />
      <span>{config.label}</span>
    </span>
  );
};
export default FieldStatusBadge;
