import type { ReviewQueueItem } from './dashboard';

export interface GeneratedReturn extends ReviewQueueItem {
  serviceTarget: string; // e.g. "Gold", "Silver", "Standard"
  linkedDocumentIds: string[];
  linkedTaskIds: string[];
  linkedRequestIds: string[];
  linkedMessageIds: string[];
}

export type DocumentCategory = 'income' | 'deductions' | 'compliance' | 'credits' | 'other';
export type DocumentEvidenceState = 'complete' | 'uncertain' | 'conflict' | 'missing';

export interface GeneratedDocument {
  id: string;
  returnId: string;
  fileName: string;
  documentType: string;
  category: DocumentCategory;
  taxYear: number;
  pageCount: number;
  uploadStatus: 'uploaded' | 'pending' | 'failed';
  reviewStatus: 'reviewed' | 'unreviewed';
  evidenceState: DocumentEvidenceState;
  uploadedBy: string;
  uploadedAt: string;
  linkedFieldIds: string[];
  linkedTaskIds: string[];
  linkedRequestIds: string[];
  linkedMessageIds: string[];
  simulated: boolean;
}

export interface GeneratedTask {
  id: string;
  returnId: string;
  documentId: string | null;
  title: string;
  status: 'pending' | 'in_progress' | 'completed';
  owner: 'reviewer' | 'preparer' | 'client';
  dueDate: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
}

export interface GeneratedRequest {
  id: string;
  returnId: string;
  documentId: string | null;
  title: string;
  status: 'open' | 'submitted' | 'approved' | 'rejected';
  owner: 'client' | 'preparer' | 'reviewer';
  requestedAt: string;
  dueDate: string;
}

export interface GeneratedMessage {
  id: string;
  returnId: string;
  documentId: string | null;
  threadId: string;
  visibility: 'FIRM_INTERNAL' | 'CLIENT_VISIBLE';
  author: string;
  authorRole: 'client' | 'preparer' | 'reviewer';
  createdAt: string;
  subject: string;
  body: string;
}

export interface ScaleDatasetMetadata {
  seed: number;
  returnCount: number;
  documentCount: number;
  taskCount: number;
  requestCount: number;
  messageCount: number;
  totalActivityCount: number;
  generatorVersion: string;
}

export interface ScaleDataset {
  seed: number;
  generatedAtLabel: string;
  returns: GeneratedReturn[];
  documents: GeneratedDocument[];
  tasks: GeneratedTask[];
  requests: GeneratedRequest[];
  messages: GeneratedMessage[];
  metadata: ScaleDatasetMetadata;
}
