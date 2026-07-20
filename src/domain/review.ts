import type { AuditEntry } from './audit';

export type ReviewCaseStatus =
  | 'READY_FOR_REVIEW'
  | 'REVIEW_IN_PROGRESS'
  | 'CHANGES_REQUESTED'
  | 'REVIEWER_APPROVED';

export type ReviewChecklistStatus =
  | 'NOT_REVIEWED'
  | 'ACCEPTED'
  | 'NEEDS_CORRECTION'
  | 'NOT_APPLICABLE';

export type ReviewDecisionType =
  | 'APPROVE_UNCHANGED'
  | 'CORRECT_AND_APPROVE'
  | 'RETURN_TO_PREPARER';

export interface ReviewChecklistItem {
  id: string;
  label: string;
  description: string;
  required: boolean;
  status: ReviewChecklistStatus;
  linkedFieldId?: string | null;
  completedBy?: string | null;
  completedAt?: string | null;
}

export interface ReviewCorrection {
  fieldId: string;
  originalValue: string;
  preparerValue: string;
  reviewerValue: string;
  reason: string;
  evidenceReviewed: boolean;
}

export interface ReviewDecision {
  id: string;
  reviewCaseId: string;
  type: ReviewDecisionType;
  reviewerId: string;
  reason: string;
  correction?: ReviewCorrection | null;
  createdAt: string; // ISO date string
}

export interface ReviewCase {
  id: string;
  returnId: string;
  reviewerId: string;
  status: ReviewCaseStatus;
  startedAt: string | null;
  completedAt: string | null;
  selectedFieldId?: string | null;
  checklistItems: ReviewChecklistItem[];
  decision?: ReviewDecision | null;
  decisionReason?: string | null;
  nextActionOwner: string;
  auditEntries: AuditEntry[];
}
