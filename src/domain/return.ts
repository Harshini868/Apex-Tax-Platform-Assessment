import type { AuditEntry } from './audit';

export type VerificationState =
  | 'AI_GENERATED_UNVERIFIED'
  | 'PREPARER_VERIFIED'
  | 'USER_CORRECTED_AWAITING_REVIEW'
  | 'REVIEWER_VERIFIED_LOCKED'
  | 'CONFLICTING_EVIDENCE'
  | 'MISSING_EVIDENCE';

export interface TaxField {
  id: string;
  lineReference: string;
  label: string;
  formattedValue: string;
  rawValue: number | null;
  dataType: 'currency' | 'number' | 'text' | 'boolean';
  interactionState: 'editable' | 'read-only' | 'locked';
  aiAnalysisId: string | null;
  traceId: string | null;
  auditEntries: AuditEntry[];
  editableRoles: ('preparer' | 'reviewer')[];
  verificationState: VerificationState;
  originalValue?: string | null;
}

export interface ReturnSection {
  id: string;
  title: string;
  description: string;
  fields: TaxField[];
}

export interface TaxReturn {
  id: string;
  clientId: string;
  clientName: string;
  taxYear: number;
  returnType: string;
  status: string;
  nextActionOwner: string;
  sections: ReturnSection[];
}
