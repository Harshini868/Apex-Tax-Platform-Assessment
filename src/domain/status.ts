export type StatusEventVisibility = 'STAFF_ONLY' | 'CLIENT_VISIBLE';

export interface ReturnProgress {
  returnId: string;
  currentStage: string;
  completedStages: string[];
  upcomingStages: string[];
  blockers: string[];
  nextActionOwner: string;
  updatedAt: string; // ISO date string
}

export interface StatusEvent {
  id: string;
  returnId: string;
  action: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  previousStatus: string;
  newStatus: string;
  previousOwner: string;
  newOwner: string;
  reason: string | null;
  createdAt: string; // ISO date string
  visibility: StatusEventVisibility;
}
