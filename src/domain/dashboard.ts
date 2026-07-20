export type QueueWarningSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';

export interface ReviewQueueItem {
  id: string;
  returnId: string;
  clientId: string;
  clientName: string;
  returnType: string;
  taxYear: number;
  stage: string;
  status: string;
  assignedPreparer: string;
  assignedReviewer: string;
  dueDate: string; // ISO date string
  reviewRequestedAt: string | null; // ISO date string or null
  warningSeverity: QueueWarningSeverity;
  unresolvedItemCount: number;
  blockerCount: number;
  nextActionOwner: string; // ActionOwner type (CLIENT, PREPARER, REVIEWER, etc.)
  priorityScore: number;
  priorityReasons: string[];
}
