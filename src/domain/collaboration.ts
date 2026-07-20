import type { ActionOwner } from './request';

export type QuestionStatus = 'UNANSWERED' | 'ANSWERED' | 'NEEDS_CLARIFICATION';

export type ThreadVisibility = 'CLIENT_VISIBLE' | 'FIRM_INTERNAL';

export type MessageDeliveryState = 'DRAFT' | 'SENT' | 'FAILED';

export interface QuestionnaireItem {
  id: string;
  prompt: string;
  helperText?: string;
  answerType: 'SINGLE_CHOICE' | 'TEXT' | 'NUMBER';
  options?: string[];
  answer?: string;
  required: boolean;
  status: QuestionStatus;
  linkedRequestId?: string;
  linkedThreadId?: string;
}

export interface Message {
  id: string;
  threadId: string;
  authorId: string;
  authorName: string;
  authorRole: 'client' | 'preparer' | 'reviewer';
  body: string;
  createdAt: string;
  visibility: ThreadVisibility;
  deliveryState: MessageDeliveryState;
  simulated: boolean;
}

export interface ConversationThread {
  id: string;
  subject: string;
  returnId: string;
  requestId?: string;
  questionId?: string;
  visibility: ThreadVisibility;
  participants: string[];
  messages: Message[];
  nextActionOwner: ActionOwner;
  status: 'ACTIVE' | 'RESOLVED';
}
