import type { ActionOwner } from './request';

export type ProgressStageStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'BLOCKED';

export interface ProgressStage {
  id: string;
  clientLabel: string;
  staffLabel: string;
  description: string;
  status: ProgressStageStatus;
  completedAt?: string;
  nextActionOwner: ActionOwner;
  blockerIds: string[];
}
