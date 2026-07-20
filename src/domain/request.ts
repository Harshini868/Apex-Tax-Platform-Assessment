export type RequestStatus =
  | 'REQUESTED'
  | 'CLIENT_IN_PROGRESS'
  | 'SUBMITTED'
  | 'RECEIVED'
  | 'NEEDS_REPLACEMENT'
  | 'APPROVED';

export type ActionOwner = 'CLIENT' | 'PREPARER' | 'REVIEWER' | 'FIRM';

export interface RequestedFileMetadata {
  fileName: string;
  fileSize: number;
  mimeType: string;
  selectedAt: string;
  simulated: boolean;
  storageDisclosure: string;
}

export interface DocumentRequest {
  id: string;
  clientId: string;
  returnId: string;
  title: string;
  description: string;
  requestedDocumentType: string;
  requestedBy: string;
  requestedAt: string;
  dueDate: string;
  urgency: 'HIGH' | 'MEDIUM' | 'LOW';
  status: RequestStatus;
  nextActionOwner: ActionOwner;
  linkedQuestionId?: string;
  linkedThreadId?: string;
  receivedFileMetadata?: RequestedFileMetadata;
  reviewOutcome?: string;
}
