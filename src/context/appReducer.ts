import type { PreviewRole } from '../types/roles';
import type { TaxReturn } from '../domain/return';
import type { AuditEntry } from '../domain/audit';
import type { OnboardingProfile } from '../domain/onboarding';
import type { DocumentRequest, RequestedFileMetadata } from '../domain/request';
import type { QuestionnaireItem, ConversationThread, Message } from '../domain/collaboration';
import type { ProgressStage } from '../domain/progress';
import type { ReviewQueueItem } from '../domain/dashboard';
import type { ReviewCase, ReviewChecklistStatus, ReviewCorrection, ReviewDecision } from '../domain/review';
import type { StatusEvent } from '../domain/status';

import { curatedReturn as initialCuratedReturn } from '../mock/curatedJourneyOne';
import {
  initialOnboardingProfile,
  initialDocumentRequests,
  initialQuestionnaireItems,
  initialConversationThreads,
  initialProgressStages,
} from '../mock/curatedJourneyTwo';
import {
  initialReviewQueue,
  curatedRostovaReturn,
  curatedRostovaThreads,
  initialReviewCase,
  initialRostovaStatusEvents
} from '../mock/curatedJourneyThree';
import { calculatePriority, sortQueue } from '../domain/prioritization';

let auditIdCounter = 0;
function nextAuditId(): string {
  auditIdCounter += 1;
  return `audit-${auditIdCounter}`;
}

export interface AppState {
  currentRole: PreviewRole;
  curatedReturn: TaxReturn;
  selectedFieldId: string | null;
  correctionDraftValue: string;
  correctionDraftReason: string;
  isCorrecting: boolean;
  feedbackMessage: string | null;
  journeyTwoFeedback: string | null;

  // Journey 2 State
  onboardingProfile: OnboardingProfile;
  documentRequests: Record<string, DocumentRequest>;
  questionnaireItems: Record<string, QuestionnaireItem>;
  conversationThreads: Record<string, ConversationThread>;
  selectedRequestId: string | null;
  selectedThreadId: string | null;
  selectedOnboardingStepId: string | null;
  stagedFileMetadata: Record<string, RequestedFileMetadata>;
  messageDraft: string;
  progressStages: ProgressStage[];
  simulatedSubmitFail: boolean;
  simulatedSendFail: boolean;
  messageCounter: number;
  eventCounter: number;

  // Journey 3 State
  reviewQueue: ReviewQueueItem[];
  reviewQueueScope: 'mine' | 'team';
  reviewQueueFilterStatus: string;
  reviewQueueFilterSeverity: string;
  reviewQueueSearch: string;
  selectedReviewReturnId: string | null;
  selectedReviewCase: ReviewCase | null;
  reviewStatusEvents: StatusEvent[];
  simulatedDecisionFail: boolean;
  journeyThreeFeedback: string | null;
  internalNoteDraft: string;
  reviewCorrectionEvidenceReviewed: boolean;
}

export type AppAction =
  | { type: 'SET_ROLE'; payload: PreviewRole }
  | { type: 'LOAD_CURATED_RETURN'; payload: TaxReturn }
  | { type: 'SELECT_FIELD'; payload: string | null }
  | { type: 'START_CORRECTION' }
  | { type: 'UPDATE_CORRECTION_DRAFT'; payload: { value: string; reason: string } }
  | { type: 'CANCEL_CORRECTION' }
  | { type: 'SAVE_CORRECTION'; payload: { actor: string; actorRole: 'preparer' | 'reviewer' } }
  | { type: 'VERIFY_FIELD'; payload: { fieldId: string; actor: string; actorRole: 'preparer' | 'reviewer' } }
  | { type: 'LOCK_FIELD'; payload: { fieldId: string; actor: string; actorRole: 'preparer' | 'reviewer'; reason: string } }
  | { type: 'RESET_JOURNEY_ONE' }
  | { type: 'CLEAR_FEEDBACK' }
  // Journey 2 Actions
  | { type: 'LOAD_JOURNEY_TWO' }
  | { type: 'ACKNOWLEDGE_WELCOME' }
  | { type: 'SELECT_ONBOARDING_STEP'; payload: string | null }
  | { type: 'SELECT_REQUEST'; payload: string | null }
  | { type: 'STAGE_REQUEST_FILE'; payload: { requestId: string; file: RequestedFileMetadata } }
  | { type: 'CLEAR_STAGED_FILE'; payload: string }
  | { type: 'ANSWER_QUESTION'; payload: { questionId: string; answer: string } }
  | { type: 'SUBMIT_REQUEST'; payload: string }
  | { type: 'MARK_REQUEST_RECEIVED'; payload: string }
  | { type: 'REQUEST_REPLACEMENT'; payload: { requestId: string; outcome: string } }
  | { type: 'SELECT_THREAD'; payload: string | null }
  | { type: 'UPDATE_MESSAGE_DRAFT'; payload: string }
  | { type: 'SEND_CLIENT_MESSAGE'; payload: { threadId: string; authorId: string; authorName: string } }
  | { type: 'RETRY_CLIENT_MESSAGE'; payload: { threadId: string; messageId: string } }
  | { type: 'RESET_JOURNEY_TWO' }
  | { type: 'TOGGLE_SIMULATED_FAIL'; payload: { key: 'simulatedSubmitFail' | 'simulatedSendFail'; value: boolean } }
  // Journey 3 Actions
  | { type: 'LOAD_JOURNEY_THREE' }
  | { type: 'SET_REVIEW_QUEUE_SCOPE'; payload: 'mine' | 'team' }
  | { type: 'SET_REVIEW_QUEUE_FILTER'; payload: { status?: string; severity?: string } }
  | { type: 'SET_REVIEW_QUEUE_SEARCH'; payload: string }
  | { type: 'SELECT_REVIEW_RETURN'; payload: string | null }
  | { type: 'START_REVIEW'; payload: { returnId: string; reviewerId: string } }
  | { type: 'SELECT_REVIEW_FIELD'; payload: string | null }
  | { type: 'UPDATE_REVIEW_CHECKLIST'; payload: { itemId: string; status: ReviewChecklistStatus } }
  | { type: 'START_REVIEW_CORRECTION'; payload: string }
  | { type: 'UPDATE_REVIEW_CORRECTION'; payload: { value: string; reason: string; evidenceReviewed: boolean } }
  | { type: 'CANCEL_REVIEW_CORRECTION' }
  | { type: 'SAVE_REVIEW_CORRECTION' }
  | { type: 'UPDATE_REVIEW_DECISION_REASON'; payload: string }
  | { type: 'APPROVE_REVIEW_UNCHANGED'; payload: { reviewerId: string; actor: string } }
  | { type: 'CORRECT_AND_APPROVE'; payload: { reviewerId: string; actor: string } }
  | { type: 'RETURN_TO_PREPARER'; payload: { reviewerId: string; actor: string } }
  | { type: 'SELECT_REVIEW_THREAD'; payload: string | null }
  | { type: 'UPDATE_INTERNAL_NOTE_DRAFT'; payload: string }
  | { type: 'ADD_INTERNAL_NOTE'; payload: { threadId: string; authorId: string; authorName: string } }
  | { type: 'RESET_JOURNEY_THREE' }
  | { type: 'TOGGLE_SIMULATED_DECISION_FAIL'; payload: boolean };

export const initialState: AppState = {
  currentRole: (typeof window !== 'undefined' ? localStorage.getItem('demo_role') as PreviewRole : null) || 'preparer',
  curatedReturn: JSON.parse(JSON.stringify(initialCuratedReturn)),
  selectedFieldId: 'f1040-line1z',
  correctionDraftValue: '',
  correctionDraftReason: '',
  isCorrecting: false,
  feedbackMessage: null,
  journeyTwoFeedback: null,

  // Journey 2 Initial State
  onboardingProfile: JSON.parse(JSON.stringify(initialOnboardingProfile)),
  documentRequests: JSON.parse(JSON.stringify(initialDocumentRequests)),
  questionnaireItems: JSON.parse(JSON.stringify(initialQuestionnaireItems)),
  conversationThreads: JSON.parse(JSON.stringify(initialConversationThreads)),
  selectedRequestId: 'req-john-w2',
  selectedThreadId: 'thread-john-w2',
  selectedOnboardingStepId: 'step-required-info',
  stagedFileMetadata: {},
  messageDraft: '',
  progressStages: JSON.parse(JSON.stringify(initialProgressStages)),
  simulatedSubmitFail: false,
  simulatedSendFail: false,
  messageCounter: 0,
  eventCounter: 0,

  // Journey 3 Initial State
  reviewQueue: JSON.parse(JSON.stringify(initialReviewQueue)),
  reviewQueueScope: 'mine',
  reviewQueueFilterStatus: 'all',
  reviewQueueFilterSeverity: 'all',
  reviewQueueSearch: '',
  selectedReviewReturnId: null,
  selectedReviewCase: null,
  reviewStatusEvents: JSON.parse(JSON.stringify(initialRostovaStatusEvents)),
  simulatedDecisionFail: false,
  journeyThreeFeedback: null,
  internalNoteDraft: '',
  reviewCorrectionEvidenceReviewed: false,
};

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_ROLE':
      if (typeof window !== 'undefined') {
        localStorage.setItem('demo_role', action.payload);
      }
      return {
        ...state,
        currentRole: action.payload,
        isCorrecting: false,
        correctionDraftValue: '',
        correctionDraftReason: '',
      };

    case 'LOAD_CURATED_RETURN':
      return {
        ...state,
        curatedReturn: action.payload,
      };

    case 'SELECT_FIELD':
      return {
        ...state,
        selectedFieldId: action.payload,
        isCorrecting: false,
        correctionDraftValue: '',
        correctionDraftReason: '',
      };

    case 'START_CORRECTION':
      if (state.currentRole === 'client') return state;
      
      let initialVal = '';
      state.curatedReturn.sections.forEach((sec) => {
        const field = sec.fields.find((f) => f.id === state.selectedFieldId);
        if (field && field.rawValue !== null) {
          initialVal = field.rawValue.toString();
        }
      });

      return {
        ...state,
        isCorrecting: true,
        correctionDraftValue: initialVal,
        correctionDraftReason: '',
      };

    case 'UPDATE_CORRECTION_DRAFT':
      return {
        ...state,
        correctionDraftValue: action.payload.value,
        correctionDraftReason: action.payload.reason,
      };

    case 'CANCEL_CORRECTION':
      return {
        ...state,
        isCorrecting: false,
        correctionDraftValue: '',
        correctionDraftReason: '',
      };

    case 'SAVE_CORRECTION': {
      const { actor, actorRole } = action.payload;

      if (state.currentRole === 'client' || actorRole !== state.currentRole) {
        return state;
      }

      const targetField = state.curatedReturn.sections
        .flatMap((sec) => sec.fields)
        .find((f) => f.id === state.selectedFieldId);

      if (!targetField || targetField.verificationState === 'REVIEWER_VERIFIED_LOCKED') {
        return {
          ...state,
          isCorrecting: false,
          correctionDraftValue: '',
          correctionDraftReason: '',
          feedbackMessage: 'Correction rejected: this field is locked and cannot be edited.',
        };
      }

      const parsedVal = parseFloat(state.correctionDraftValue);
      if (isNaN(parsedVal)) {
        return {
          ...state,
          isCorrecting: false,
          correctionDraftValue: '',
          correctionDraftReason: '',
          feedbackMessage: 'Correction rejected: the value entered was not valid.',
        };
      }

      const formattedVal = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(parsedVal);

      const newAuditEntry: AuditEntry = {
        id: nextAuditId(),
        action: 'CORRECT_VALUE',
        actor,
        actorRole,
        timestamp: new Date().toISOString(),
        previousValue: targetField.formattedValue,
        newValue: formattedVal,
        reason: state.correctionDraftReason,
      };

      const updatedSections = state.curatedReturn.sections.map((section) => {
        const updatedFields = section.fields.map((field) => {
          if (field.id === state.selectedFieldId) {
            return {
              ...field,
              rawValue: parsedVal,
              formattedValue: formattedVal,
              originalValue: field.originalValue || field.formattedValue,
              verificationState: 'USER_CORRECTED_AWAITING_REVIEW' as const,
              interactionState: 'editable' as const,
              auditEntries: [...field.auditEntries, newAuditEntry],
            };
          }
          return field;
        });
        return { ...section, fields: updatedFields };
      });

      let updatedFieldLabel = 'Field';
      updatedSections.forEach((sec) => {
        const f = sec.fields.find((f) => f.id === state.selectedFieldId);
        if (f) updatedFieldLabel = f.label;
      });

      return {
        ...state,
        curatedReturn: {
          ...state.curatedReturn,
          sections: updatedSections,
        },
        isCorrecting: false,
        correctionDraftValue: '',
        correctionDraftReason: '',
        feedbackMessage: `${updatedFieldLabel} corrected to ${formattedVal} and sent for reviewer approval.`,
      };
    }

    case 'VERIFY_FIELD': {
      const { fieldId, actor, actorRole } = action.payload;

      if (state.currentRole === 'client' || actorRole !== state.currentRole) {
        return state;
      }

      let hasError = false;
      let errorMsg = '';

      const updatedSections = state.curatedReturn.sections.map((section) => {
        const updatedFields = section.fields.map((field) => {
          if (field.id === fieldId) {
            if (field.verificationState === 'MISSING_EVIDENCE') {
              hasError = true;
              errorMsg = 'Verification unavailable because the source document is missing.';
              return field;
            }
            if (field.verificationState === 'CONFLICTING_EVIDENCE') {
              hasError = true;
              errorMsg = 'Verification unavailable because source document values conflict.';
              return field;
            }

            const newAuditEntry: AuditEntry = {
              id: nextAuditId(),
              action: 'VERIFY_VALUE',
              actor,
              actorRole,
              timestamp: new Date().toISOString(),
              previousValue: field.formattedValue,
              newValue: field.formattedValue,
              reason: null,
            };

            const nextState =
              actorRole === 'reviewer'
                ? ('REVIEWER_VERIFIED_LOCKED' as const)
                : ('PREPARER_VERIFIED' as const);

            const nextInteraction = actorRole === 'reviewer' ? ('locked' as const) : ('editable' as const);

            return {
              ...field,
              verificationState: nextState,
              interactionState: nextInteraction,
              auditEntries: [...field.auditEntries, newAuditEntry],
            };
          }
          return field;
        });
        return { ...section, fields: updatedFields };
      });

      if (hasError) {
        return {
          ...state,
          feedbackMessage: errorMsg,
        };
      }

      let fieldLabel = 'Field';
      updatedSections.forEach((sec) => {
        const f = sec.fields.find((f) => f.id === fieldId);
        if (f) fieldLabel = f.label;
      });

      return {
        ...state,
        curatedReturn: {
          ...state.curatedReturn,
          sections: updatedSections,
        },
        feedbackMessage: `${fieldLabel} marked as ${actorRole} verified.`,
      };
    }

    case 'LOCK_FIELD': {
      const { fieldId, actor, actorRole, reason } = action.payload;

      if (state.currentRole !== 'reviewer' || actorRole !== 'reviewer') {
        return state;
      }

      let hasError = false;
      let errorMsg = '';

      const updatedSections = state.curatedReturn.sections.map((section) => {
        const updatedFields = section.fields.map((field) => {
          if (field.id === fieldId) {
            if (field.verificationState === 'MISSING_EVIDENCE') {
              hasError = true;
              errorMsg = 'Locking unavailable because the source document is missing.';
              return field;
            }
            if (field.verificationState === 'CONFLICTING_EVIDENCE') {
              hasError = true;
              errorMsg = 'Locking unavailable because source document values conflict.';
              return field;
            }

            const newAuditEntry: AuditEntry = {
              id: nextAuditId(),
              action: 'LOCK_VALUE',
              actor,
              actorRole,
              timestamp: new Date().toISOString(),
              previousValue: field.formattedValue,
              newValue: field.formattedValue,
              reason,
            };

            return {
              ...field,
              verificationState: 'REVIEWER_VERIFIED_LOCKED' as const,
              interactionState: 'locked' as const,
              auditEntries: [...field.auditEntries, newAuditEntry],
            };
          }
          return field;
        });
        return { ...section, fields: updatedFields };
      });

      if (hasError) {
        return {
          ...state,
          feedbackMessage: errorMsg,
        };
      }

      let fieldLabel = 'Field';
      updatedSections.forEach((sec) => {
        const f = sec.fields.find((f) => f.id === fieldId);
        if (f) fieldLabel = f.label;
      });

      return {
        ...state,
        curatedReturn: {
          ...state.curatedReturn,
          sections: updatedSections,
        },
        feedbackMessage: `${fieldLabel} verified and locked.`,
      };
    }

    case 'RESET_JOURNEY_ONE':
      return {
        ...state,
        curatedReturn: JSON.parse(JSON.stringify(initialCuratedReturn)),
        selectedFieldId: 'f1040-line1z',
        isCorrecting: false,
        correctionDraftValue: '',
        correctionDraftReason: '',
        feedbackMessage: null,
      };

    case 'CLEAR_FEEDBACK':
      return {
        ...state,
        feedbackMessage: null,
        journeyTwoFeedback: null,
      };

    // --- Journey 2 Reducer Cases ---
    case 'LOAD_JOURNEY_TWO':
      return {
        ...state,
        currentRole: 'client',
        selectedOnboardingStepId: 'step-required-info',
        selectedRequestId: 'req-john-w2',
        selectedThreadId: 'thread-john-w2',
      };

    case 'ACKNOWLEDGE_WELCOME':
      return {
        ...state,
        onboardingProfile: {
          ...state.onboardingProfile,
          firstLogin: false,
          welcomeAcknowledged: true,
          startedAt: state.onboardingProfile.startedAt || new Date().toISOString(),
        },
        journeyTwoFeedback: 'Welcome acknowledged.',
      };

    case 'SELECT_ONBOARDING_STEP':
      return {
        ...state,
        selectedOnboardingStepId: action.payload,
      };

    case 'SELECT_REQUEST': {
      const reqId = action.payload;
      const req = reqId ? state.documentRequests[reqId] : null;
      const linkedThread = req?.linkedThreadId ? state.conversationThreads[req.linkedThreadId] : null;

      // Same visibility rule as SELECT_THREAD: never auto-select a thread the current role can't read
      const canSeeLinkedThread =
        linkedThread && !(linkedThread.visibility === 'FIRM_INTERNAL' && state.currentRole === 'client');

      return {
        ...state,
        selectedRequestId: reqId,
        selectedThreadId: canSeeLinkedThread ? linkedThread.id : state.selectedThreadId,
      };
    }

    case 'STAGE_REQUEST_FILE': {
      const { requestId, file } = action.payload;
      const req = state.documentRequests[requestId];
      
      // Rule: client can stage metadata only for requests owned by Client
      if (!req || req.nextActionOwner !== 'CLIENT' || state.currentRole !== 'client') {
        return state;
      }

      return {
        ...state,
        stagedFileMetadata: {
          ...state.stagedFileMetadata,
          [requestId]: file,
        },
        journeyTwoFeedback: `File ${file.fileName} staged.`,
      };
    }

    case 'CLEAR_STAGED_FILE': {
      const staged = { ...state.stagedFileMetadata };
      delete staged[action.payload];
      return {
        ...state,
        stagedFileMetadata: staged,
      };
    }

    case 'ANSWER_QUESTION': {
      const { questionId, answer } = action.payload;
      const question = state.questionnaireItems[questionId];
      if (!question) return state;

      return {
        ...state,
        questionnaireItems: {
          ...state.questionnaireItems,
          [questionId]: {
            ...question,
            answer,
            status: 'ANSWERED',
          },
        },
      };
    }

    case 'SUBMIT_REQUEST': {
      const requestId = action.payload;
      const req = state.documentRequests[requestId];
      
      // Permission check: Client only
      if (state.currentRole !== 'client') return state;

      if (!req || req.nextActionOwner !== 'CLIENT') {
        return state;
      }

      // Check required conditions: file must be staged
      const file = state.stagedFileMetadata[requestId];
      if (!file) {
        return {
          ...state,
          journeyTwoFeedback: 'Submission failed: Please select a file to upload.',
        };
      }

      // Check linked question answered
      if (req.linkedQuestionId) {
        const question = state.questionnaireItems[req.linkedQuestionId];
        if (question && question.required && !question.answer) {
          return {
            ...state,
            journeyTwoFeedback: 'Submission failed: Please answer the required tax question.',
          };
        }
      }

      // Handle simulated submit failure
      if (state.simulatedSubmitFail) {
        return {
          ...state,
          journeyTwoFeedback: 'Simulation error: Document transmission failed. Please retry.',
        };
      }

      // Immutably transition requests status
      const updatedRequests = { ...state.documentRequests };
      updatedRequests[requestId] = {
        ...req,
        status: 'SUBMITTED',
        nextActionOwner: 'PREPARER',
        receivedFileMetadata: file,
      };

      // Clear staged file metadata for this request
      const updatedStaged = { ...state.stagedFileMetadata };
      delete updatedStaged[requestId];

      // Update onboarding step status
      const steps = state.onboardingProfile.steps.map((step) => {
        if (step.linkedRequestId === requestId) {
          return {
            ...step,
            status: 'COMPLETED' as const,
            completedAt: new Date().toISOString(),
          };
        }
        return step;
      });

      const completedCount = steps.filter((s) => s.status === 'COMPLETED').length;
      const percentComplete = Math.round((completedCount / steps.length) * 100);

      // Update progressStages
      const progressStages = state.progressStages.map((stage) => {
        if (stage.id === 'stage-info-needed') {
          return {
            ...stage,
            status: 'COMPLETED' as const,
            completedAt: new Date().toISOString(),
            nextActionOwner: 'PREPARER' as const,
            blockerIds: stage.blockerIds.filter((id) => id !== requestId),
          };
        }
        if (stage.id === 'stage-preparation') {
          return {
            ...stage,
            status: 'IN_PROGRESS' as const,
            nextActionOwner: 'PREPARER' as const,
          };
        }
        return stage;
      });

      const nextEventId = `submit-event-${state.eventCounter}`;

      return {
        ...state,
        documentRequests: updatedRequests,
        stagedFileMetadata: updatedStaged,
        onboardingProfile: {
          ...state.onboardingProfile,
          steps,
          percentComplete,
          completedAt: percentComplete === 100 ? new Date().toISOString() : undefined,
        },
        progressStages,
        eventCounter: state.eventCounter + 1,
        journeyTwoFeedback: `Submitted. Event ID: ${nextEventId}`,
      };
    }

    case 'MARK_REQUEST_RECEIVED': {
      const requestId = action.payload;
      const req = state.documentRequests[requestId];
      if (!req) return state;

      return {
        ...state,
        documentRequests: {
          ...state.documentRequests,
          [requestId]: {
            ...req,
            status: 'RECEIVED',
          },
        },
      };
    }

    case 'REQUEST_REPLACEMENT': {
      const { requestId, outcome } = action.payload;
      const req = state.documentRequests[requestId];
      if (!req) return state;

      // Immutably revert next action owner back to client
      const updatedRequests = { ...state.documentRequests };
      updatedRequests[requestId] = {
        ...req,
        status: 'NEEDS_REPLACEMENT',
        nextActionOwner: 'CLIENT',
        reviewOutcome: outcome,
      };

      // Set steps status back to IN_PROGRESS
      const steps = state.onboardingProfile.steps.map((step) => {
        if (step.linkedRequestId === requestId) {
          return {
            ...step,
            status: 'IN_PROGRESS' as const,
            completedAt: undefined,
          };
        }
        return step;
      });

      const completedCount = steps.filter((s) => s.status === 'COMPLETED').length;
      const percentComplete = Math.round((completedCount / steps.length) * 100);

      // Revert stages status
      const progressStages = state.progressStages.map((stage) => {
        if (stage.id === 'stage-info-needed') {
          const blockers = stage.blockerIds.includes(requestId)
            ? stage.blockerIds
            : [...stage.blockerIds, requestId];
          return {
            ...stage,
            status: 'IN_PROGRESS' as const,
            completedAt: undefined,
            nextActionOwner: 'CLIENT' as const,
            blockerIds: blockers,
          };
        }
        if (stage.id === 'stage-preparation') {
          return {
            ...stage,
            status: 'NOT_STARTED' as const,
            nextActionOwner: 'PREPARER' as const,
          };
        }
        return stage;
      });

      return {
        ...state,
        documentRequests: updatedRequests,
        onboardingProfile: {
          ...state.onboardingProfile,
          steps,
          percentComplete,
        },
        progressStages,
        journeyTwoFeedback: `Replacement requested: ${outcome}`,
      };
    }

    case 'SELECT_THREAD': {
      const threadId = action.payload;
      if (!threadId) {
        return {
          ...state,
          selectedThreadId: null,
        };
      }

      const thread = state.conversationThreads[threadId];
      if (!thread) return state;

      // Permission check: client cannot read internal threads
      if (thread.visibility === 'FIRM_INTERNAL' && state.currentRole === 'client') {
        return state;
      }

      return {
        ...state,
        selectedThreadId: threadId,
      };
    }

    case 'UPDATE_MESSAGE_DRAFT':
      return {
        ...state,
        messageDraft: action.payload,
      };

    case 'SEND_CLIENT_MESSAGE': {
      const { threadId, authorId, authorName } = action.payload;
      const thread = state.conversationThreads[threadId];
      if (!thread) return state;

      // Rule: client cannot select, read or send to FIRM_INTERNAL thread
      if (thread.visibility === 'FIRM_INTERNAL' && state.currentRole === 'client') {
        return state;
      }

      // Rule: client can only send client visible messages
      const isClientRole = state.currentRole === 'client';
      const visibility = isClientRole ? 'CLIENT_VISIBLE' : thread.visibility;

      const trimmedDraft = state.messageDraft.trim();
      if (!trimmedDraft) return state;

      const nextMsgId = `msg-client-${state.messageCounter}`;

      const newMessage: Message = {
        id: nextMsgId,
        threadId,
        authorId,
        authorName,
        authorRole: isClientRole ? 'client' : (state.currentRole as any),
        body: trimmedDraft,
        createdAt: new Date().toISOString(),
        visibility,
        deliveryState: state.simulatedSendFail ? 'FAILED' : 'SENT',
        simulated: true,
      };

      const updatedThreads = { ...state.conversationThreads };
      updatedThreads[threadId] = {
        ...thread,
        messages: [...thread.messages, newMessage],
        nextActionOwner: isClientRole ? 'PREPARER' : 'CLIENT',
      };

      return {
        ...state,
        conversationThreads: updatedThreads,
        messageDraft: state.simulatedSendFail ? state.messageDraft : '', // retain on fail, clear on success
        messageCounter: state.messageCounter + 1,
        journeyTwoFeedback: state.simulatedSendFail
          ? 'Message delivery failed.'
          : 'Message sent successfully.',
      };
    }

    case 'RETRY_CLIENT_MESSAGE': {
      const { threadId, messageId } = action.payload;
      const thread = state.conversationThreads[threadId];
      if (!thread) return state;

      // Rule: client cannot retry messages on FIRM_INTERNAL thread
      if (thread.visibility === 'FIRM_INTERNAL' && state.currentRole === 'client') {
        return state;
      }

      // Try sending failed message again
      const updatedMessages = thread.messages.map((msg) => {
        if (msg.id === messageId && msg.deliveryState === 'FAILED') {
          return {
            ...msg,
            deliveryState: (state.simulatedSendFail ? 'FAILED' : 'SENT') as 'FAILED' | 'SENT',
          };
        }
        return msg;
      });

      const isStillFailed = updatedMessages.some(
        (m) => m.id === messageId && m.deliveryState === 'FAILED'
      );

      const updatedThreads = { ...state.conversationThreads };
      updatedThreads[threadId] = {
        ...thread,
        messages: updatedMessages,
      };

      return {
        ...state,
        conversationThreads: updatedThreads,
        journeyTwoFeedback: isStillFailed ? 'Message retry failed.' : 'Message retry succeeded.',
      };
    }

    case 'RESET_JOURNEY_TWO':
      return {
        ...state,
        onboardingProfile: JSON.parse(JSON.stringify(initialOnboardingProfile)),
        documentRequests: JSON.parse(JSON.stringify(initialDocumentRequests)),
        questionnaireItems: JSON.parse(JSON.stringify(initialQuestionnaireItems)),
        conversationThreads: JSON.parse(JSON.stringify(initialConversationThreads)),
        selectedRequestId: 'req-john-w2',
        selectedThreadId: 'thread-john-w2',
        selectedOnboardingStepId: 'step-required-info',
        stagedFileMetadata: {},
        messageDraft: '',
        progressStages: JSON.parse(JSON.stringify(initialProgressStages)),
        simulatedSubmitFail: false,
        simulatedSendFail: false,
        messageCounter: 0,
        eventCounter: 0,
        journeyTwoFeedback: null,
      };

    case 'TOGGLE_SIMULATED_FAIL':
      return {
        ...state,
        [action.payload.key]: action.payload.value,
      };

    case 'LOAD_JOURNEY_THREE': {
      const sorted = sortQueue(initialReviewQueue, 'reviewer-marcus-vance');
      return {
        ...state,
        reviewQueue: sorted,
        reviewQueueScope: 'mine',
        reviewQueueFilterStatus: 'all',
        reviewQueueFilterSeverity: 'all',
        reviewQueueSearch: '',
        selectedReviewReturnId: null,
        selectedReviewCase: null,
        reviewStatusEvents: JSON.parse(JSON.stringify(initialRostovaStatusEvents)),
        simulatedDecisionFail: false,
        journeyThreeFeedback: null,
        internalNoteDraft: '',
      };
    }

    case 'SET_REVIEW_QUEUE_SCOPE': {
      return {
        ...state,
        reviewQueueScope: action.payload,
      };
    }

    case 'SET_REVIEW_QUEUE_FILTER': {
      return {
        ...state,
        reviewQueueFilterStatus: action.payload.status !== undefined ? action.payload.status : state.reviewQueueFilterStatus,
        reviewQueueFilterSeverity: action.payload.severity !== undefined ? action.payload.severity : state.reviewQueueFilterSeverity,
      };
    }

    case 'SET_REVIEW_QUEUE_SEARCH': {
      return {
        ...state,
        reviewQueueSearch: action.payload,
      };
    }

    case 'SELECT_REVIEW_RETURN': {
      const returnId = action.payload;
      // Re-selecting the return already loaded must preserve in-session progress (checklist state,
      // an in-progress or approved review case, field corrections) — re-initializing from the pristine
      // fixture every time would silently discard review progress and let an approved case be reset
      // back to READY_FOR_REVIEW just by navigating away and back.
      const alreadyLoaded = state.selectedReviewReturnId === returnId;

      if (returnId === 'ret-rostova-tech-1120s') {
        const conversations = { ...state.conversationThreads, ...curatedRostovaThreads };
        const defaultThread = state.currentRole === 'client' ? 'thread-rostova-client' : 'thread-rostova-internal';
        return {
          ...state,
          selectedReviewReturnId: returnId,
          curatedReturn: alreadyLoaded ? state.curatedReturn : JSON.parse(JSON.stringify(curatedRostovaReturn)),
          selectedReviewCase: alreadyLoaded && state.selectedReviewCase
            ? state.selectedReviewCase
            : JSON.parse(JSON.stringify(initialReviewCase)),
          selectedFieldId: alreadyLoaded ? state.selectedFieldId : 'rostova-interest-expense',
          conversationThreads: conversations,
          selectedThreadId: alreadyLoaded ? state.selectedThreadId : defaultThread,
        };
      } else if (returnId === 'ret-john-miller-1040') {
        return {
          ...state,
          selectedReviewReturnId: returnId,
          curatedReturn: JSON.parse(JSON.stringify(initialCuratedReturn)),
          selectedReviewCase: null,
          selectedFieldId: 'f1040-line1z',
        };
      } else {
        return {
          ...state,
          selectedReviewReturnId: returnId,
          selectedReviewCase: null,
        };
      }
    }

    case 'START_REVIEW': {
      if (state.currentRole !== 'reviewer') return state;
      const { returnId } = action.payload;
      if (returnId !== state.selectedReviewReturnId) return state;

      const updatedCase = state.selectedReviewCase ? {
        ...state.selectedReviewCase,
        status: 'REVIEW_IN_PROGRESS' as const,
        startedAt: state.selectedReviewCase.startedAt || new Date().toISOString(),
      } : null;

      const updatedQueue = state.reviewQueue.map((item) => {
        if (item.returnId === returnId) {
          const updated = {
            ...item,
            status: 'Review in progress',
            nextActionOwner: 'REVIEWER',
          };
          const { score, reasons } = calculatePriority(updated, 'reviewer-marcus-vance');
          return {
            ...updated,
            priorityScore: score,
            priorityReasons: reasons,
          };
        }
        return item;
      });

      return {
        ...state,
        curatedReturn: {
          ...state.curatedReturn,
          status: 'Review in progress',
          nextActionOwner: 'REVIEWER',
        },
        selectedReviewCase: updatedCase,
        reviewQueue: sortQueue(updatedQueue, 'reviewer-marcus-vance'),
        journeyThreeFeedback: 'Review started.',
      };
    }

    case 'SELECT_REVIEW_FIELD': {
      return {
        ...state,
        selectedFieldId: action.payload,
      };
    }

    case 'UPDATE_REVIEW_CHECKLIST': {
      if (state.currentRole !== 'reviewer') return state;
      if (!state.selectedReviewCase) return state;

      const updatedItems = state.selectedReviewCase.checklistItems.map((item) => {
        if (item.id === action.payload.itemId) {
          return {
            ...item,
            status: action.payload.status,
            completedBy: 'reviewer-marcus-vance',
            completedAt: new Date().toISOString(),
          };
        }
        return item;
      });

      return {
        ...state,
        selectedReviewCase: {
          ...state.selectedReviewCase,
          checklistItems: updatedItems,
        },
        journeyThreeFeedback: 'Checklist updated.',
      };
    }

    case 'START_REVIEW_CORRECTION': {
      if (state.currentRole !== 'reviewer') return state;
      let initialVal = '';
      state.curatedReturn.sections.forEach((sec) => {
        const field = sec.fields.find((f) => f.id === action.payload);
        if (field && field.rawValue !== null) {
          initialVal = field.rawValue.toString();
        }
      });
      return {
        ...state,
        isCorrecting: true,
        correctionDraftValue: initialVal,
        correctionDraftReason: '',
        reviewCorrectionEvidenceReviewed: false,
      };
    }

    case 'UPDATE_REVIEW_CORRECTION': {
      if (state.currentRole !== 'reviewer') return state;
      return {
        ...state,
        correctionDraftValue: action.payload.value,
        correctionDraftReason: action.payload.reason,
        reviewCorrectionEvidenceReviewed: action.payload.evidenceReviewed,
      };
    }

    case 'CANCEL_REVIEW_CORRECTION': {
      return {
        ...state,
        isCorrecting: false,
        correctionDraftValue: '',
        correctionDraftReason: '',
        reviewCorrectionEvidenceReviewed: false,
      };
    }

    case 'SAVE_REVIEW_CORRECTION': {
      if (state.currentRole !== 'reviewer') return state;
      if (!state.selectedReviewCase) return state;

      const activeField = state.curatedReturn.sections
        .flatMap((s) => s.fields)
        .find((f) => f.id === state.selectedFieldId);

      const parsedVal = parseFloat(state.correctionDraftValue);
      if (isNaN(parsedVal)) {
        return {
          ...state,
          isCorrecting: false,
          journeyThreeFeedback: 'Correction rejected: the value entered was not valid.',
        };
      }

      if (!state.correctionDraftReason.trim()) {
        return {
          ...state,
          journeyThreeFeedback: 'Correction rejected: a valid explanation reason is required.',
        };
      }

      if (!state.reviewCorrectionEvidenceReviewed) {
        return {
          ...state,
          journeyThreeFeedback: 'Correction rejected: evidence-reviewed acknowledgement is required.',
        };
      }

      const formattedVal = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(parsedVal);

      const correction: ReviewCorrection = {
        fieldId: state.selectedFieldId || '',
        originalValue: activeField?.originalValue || activeField?.formattedValue || '',
        preparerValue: activeField?.formattedValue || '',
        reviewerValue: formattedVal,
        reason: state.correctionDraftReason,
        evidenceReviewed: true,
      };

      const decision: ReviewDecision = {
        id: `dec-${state.eventCounter + 1}`,
        reviewCaseId: state.selectedReviewCase.id,
        type: 'CORRECT_AND_APPROVE',
        reviewerId: 'reviewer-marcus-vance',
        reason: state.correctionDraftReason,
        correction,
        createdAt: new Date().toISOString(),
      };

      return {
        ...state,
        isCorrecting: false,
        reviewCorrectionEvidenceReviewed: false,
        selectedReviewCase: {
          ...state.selectedReviewCase,
          decision,
          decisionReason: state.correctionDraftReason,
        },
        journeyThreeFeedback: 'Correction draft saved.',
      };
    }

    case 'UPDATE_REVIEW_DECISION_REASON': {
      if (!state.selectedReviewCase) return state;
      return {
        ...state,
        selectedReviewCase: {
          ...state.selectedReviewCase,
          decisionReason: action.payload,
        },
      };
    }

    case 'APPROVE_REVIEW_UNCHANGED': {
      if (state.currentRole !== 'reviewer') return state;
      if (!state.selectedReviewCase) return state;
      if (state.selectedReviewCase.reviewerId !== action.payload.reviewerId) {
        return {
          ...state,
          journeyThreeFeedback: 'Cannot approve: this case is assigned to another reviewer.',
        };
      }
      if (state.selectedReviewCase.status === 'REVIEWER_APPROVED') {
        return {
          ...state,
          journeyThreeFeedback: 'Cannot approve: this return is already approved.',
        };
      }

      // Check checklist resolution
      const allResolved = state.selectedReviewCase.checklistItems
        .filter((item) => item.required)
        .every((item) => item.status === 'ACCEPTED' || item.status === 'NOT_APPLICABLE');

      if (!allResolved) {
        return {
          ...state,
          journeyThreeFeedback: 'Cannot approve: required checklist items are unresolved.',
        };
      }

      // Check if evidence is uncertain / conflict
      const activeField = state.curatedReturn.sections
        .flatMap((s) => s.fields)
        .find((f) => f.id === state.selectedFieldId);

      const isUncertain = activeField && (
        activeField.verificationState === 'CONFLICTING_EVIDENCE' ||
        activeField.verificationState === 'MISSING_EVIDENCE' ||
        activeField.verificationState === 'USER_CORRECTED_AWAITING_REVIEW'
      );

      if (isUncertain && !state.selectedReviewCase.decisionReason?.trim()) {
        return {
          ...state,
          journeyThreeFeedback: 'Cannot approve: a compliance justification reason is required for uncertain evidence.',
        };
      }

      if (state.simulatedDecisionFail) {
        return {
          ...state,
          journeyThreeFeedback: 'Simulated decision failure occurred.',
        };
      }

      // Record verify audit entry
      const updatedSections = state.curatedReturn.sections.map((sec) => {
        const fields = sec.fields.map((f) => {
          if (f.id === state.selectedFieldId) {
            const audit: AuditEntry = {
              id: nextAuditId(),
              action: 'VERIFY_VALUE',
              actor: action.payload.actor,
              actorRole: 'reviewer',
              timestamp: new Date().toISOString(),
              previousValue: f.formattedValue,
              newValue: f.formattedValue,
              reason: state.selectedReviewCase?.decisionReason || 'Approved unchanged.',
            };
            return {
              ...f,
              verificationState: 'REVIEWER_VERIFIED_LOCKED' as const,
              interactionState: 'locked' as const,
              auditEntries: [...f.auditEntries, audit],
            };
          }
          return f;
        });
        return { ...sec, fields };
      });

      const updatedQueue = state.reviewQueue.map((item) => {
        if (item.returnId === state.selectedReviewReturnId) {
          const updated = {
            ...item,
            // Reviewer approval is a firm sign-off, not an IRS filing event — never label it "Filed"
            status: 'Reviewer approved',
            stage: 'Completed',
            nextActionOwner: 'FIRM',
          };
          const { score, reasons } = calculatePriority(updated, 'reviewer-marcus-vance');
          return {
            ...updated,
            priorityScore: score,
            priorityReasons: reasons,
          };
        }
        return item;
      });

      const newEvent: StatusEvent = {
        id: `evt-rostova-${state.eventCounter + 2}`,
        returnId: state.selectedReviewReturnId || '',
        action: 'REVIEWER_APPROVED',
        actorId: action.payload.reviewerId,
        actorName: action.payload.actor,
        actorRole: 'reviewer',
        previousStatus: state.curatedReturn.status,
        newStatus: 'Reviewer approved',
        previousOwner: 'REVIEWER',
        newOwner: 'FIRM',
        reason: state.selectedReviewCase.decisionReason || 'Approved unchanged.',
        createdAt: new Date().toISOString(),
        visibility: 'STAFF_ONLY',
      };

      return {
        ...state,
        curatedReturn: {
          ...state.curatedReturn,
          status: 'Reviewer approved',
          nextActionOwner: 'FIRM',
          sections: updatedSections,
        },
        selectedReviewCase: {
          ...state.selectedReviewCase,
          status: 'REVIEWER_APPROVED',
          completedAt: new Date().toISOString(),
          decision: {
            id: `dec-${state.eventCounter + 1}`,
            reviewCaseId: state.selectedReviewCase.id,
            type: 'APPROVE_UNCHANGED',
            reviewerId: action.payload.reviewerId,
            reason: state.selectedReviewCase.decisionReason || 'Approved unchanged.',
            createdAt: new Date().toISOString(),
          },
        },
        reviewQueue: sortQueue(updatedQueue, 'reviewer-marcus-vance'),
        reviewStatusEvents: [...state.reviewStatusEvents, newEvent],
        eventCounter: state.eventCounter + 1,
        journeyThreeFeedback: 'Return approved unchanged successfully.',
      };
    }

    case 'CORRECT_AND_APPROVE': {
      if (state.currentRole !== 'reviewer') return state;
      if (!state.selectedReviewCase) return state;
      if (state.selectedReviewCase.reviewerId !== action.payload.reviewerId) {
        return {
          ...state,
          journeyThreeFeedback: 'Cannot approve: this case is assigned to another reviewer.',
        };
      }
      if (state.selectedReviewCase.status === 'REVIEWER_APPROVED') {
        return {
          ...state,
          journeyThreeFeedback: 'Cannot approve: this return is already approved.',
        };
      }

      const decision = state.selectedReviewCase.decision;
      if (!decision || !decision.correction) {
        return {
          ...state,
          journeyThreeFeedback: 'Cannot approve: no valid correction draft exists.',
        };
      }

      // Check checklist resolution
      const allResolved = state.selectedReviewCase.checklistItems
        .filter((item) => item.required)
        .every((item) => item.status === 'ACCEPTED' || item.status === 'NOT_APPLICABLE');

      if (!allResolved) {
        return {
          ...state,
          journeyThreeFeedback: 'Cannot approve: required checklist items are unresolved.',
        };
      }

      if (state.simulatedDecisionFail) {
        return {
          ...state,
          journeyThreeFeedback: 'Simulated decision failure occurred.',
        };
      }

      const correction = decision.correction;
      const parsedVal = parseFloat(correction.reviewerValue.replace(/[^0-9.-]+/g, ''));

      // Apply reviewer value correction and lock field
      const updatedSections = state.curatedReturn.sections.map((sec) => {
        const fields = sec.fields.map((f) => {
          if (f.id === state.selectedFieldId) {
            const audit: AuditEntry = {
              id: nextAuditId(),
              action: 'CORRECT_VALUE',
              actor: action.payload.actor,
              actorRole: 'reviewer',
              timestamp: new Date().toISOString(),
              previousValue: f.formattedValue,
              newValue: correction.reviewerValue,
              reason: correction.reason,
            };
            const lockAudit: AuditEntry = {
              id: nextAuditId(),
              action: 'LOCK_VALUE',
              actor: action.payload.actor,
              actorRole: 'reviewer',
              timestamp: new Date().toISOString(),
              previousValue: correction.reviewerValue,
              newValue: correction.reviewerValue,
              reason: 'Reviewer lock applied on corrected value.',
            };
            return {
              ...f,
              rawValue: parsedVal,
              formattedValue: correction.reviewerValue,
              verificationState: 'REVIEWER_VERIFIED_LOCKED' as const,
              interactionState: 'locked' as const,
              auditEntries: [...f.auditEntries, audit, lockAudit],
            };
          }
          return f;
        });
        return { ...sec, fields };
      });

      const updatedQueue = state.reviewQueue.map((item) => {
        if (item.returnId === state.selectedReviewReturnId) {
          const updated = {
            ...item,
            // Reviewer approval is a firm sign-off, not an IRS filing event — never label it "Filed"
            status: 'Reviewer approved',
            stage: 'Completed',
            nextActionOwner: 'FIRM',
          };
          const { score, reasons } = calculatePriority(updated, 'reviewer-marcus-vance');
          return {
            ...updated,
            priorityScore: score,
            priorityReasons: reasons,
          };
        }
        return item;
      });

      const newEvent: StatusEvent = {
        id: `evt-rostova-${state.eventCounter + 2}`,
        returnId: state.selectedReviewReturnId || '',
        action: 'REVIEWER_APPROVED',
        actorId: action.payload.reviewerId,
        actorName: action.payload.actor,
        actorRole: 'reviewer',
        previousStatus: state.curatedReturn.status,
        newStatus: 'Reviewer approved',
        previousOwner: 'REVIEWER',
        newOwner: 'FIRM',
        reason: correction.reason,
        createdAt: new Date().toISOString(),
        visibility: 'STAFF_ONLY',
      };

      return {
        ...state,
        curatedReturn: {
          ...state.curatedReturn,
          status: 'Reviewer approved',
          nextActionOwner: 'FIRM',
          sections: updatedSections,
        },
        selectedReviewCase: {
          ...state.selectedReviewCase,
          status: 'REVIEWER_APPROVED',
          completedAt: new Date().toISOString(),
        },
        reviewQueue: sortQueue(updatedQueue, 'reviewer-marcus-vance'),
        reviewStatusEvents: [...state.reviewStatusEvents, newEvent],
        eventCounter: state.eventCounter + 1,
        journeyThreeFeedback: 'Return corrected and approved successfully.',
      };
    }

    case 'RETURN_TO_PREPARER': {
      if (state.currentRole !== 'reviewer') return state;
      if (!state.selectedReviewCase) return state;
      if (state.selectedReviewCase.reviewerId !== action.payload.reviewerId) {
        return {
          ...state,
          journeyThreeFeedback: 'Cannot return: this case is assigned to another reviewer.',
        };
      }
      if (state.selectedReviewCase.status === 'REVIEWER_APPROVED') {
        return {
          ...state,
          journeyThreeFeedback: 'Cannot return: this return is already approved.',
        };
      }

      if (!state.selectedReviewCase.decisionReason?.trim()) {
        return {
          ...state,
          journeyThreeFeedback: 'Cannot return: an actionable explanation reason is required.',
        };
      }

      const hasNeedsCorrection = state.selectedReviewCase.checklistItems
        .some((item) => item.status === 'NEEDS_CORRECTION');

      if (!hasNeedsCorrection) {
        return {
          ...state,
          journeyThreeFeedback: 'Cannot return: at least one checklist item must be marked Needs correction.',
        };
      }

      if (state.simulatedDecisionFail) {
        return {
          ...state,
          journeyThreeFeedback: 'Simulated decision failure occurred.',
        };
      }

      const updatedQueue = state.reviewQueue.map((item) => {
        if (item.returnId === state.selectedReviewReturnId) {
          const updated = {
            ...item,
            status: 'Changes requested',
            nextActionOwner: 'PREPARER',
          };
          const { score, reasons } = calculatePriority(updated, 'reviewer-marcus-vance');
          return {
            ...updated,
            priorityScore: score,
            priorityReasons: reasons,
          };
        }
        return item;
      });

      const newEvent: StatusEvent = {
        id: `evt-rostova-${state.eventCounter + 2}`,
        returnId: state.selectedReviewReturnId || '',
        action: 'RETURN_TO_PREPARER',
        actorId: action.payload.reviewerId,
        actorName: action.payload.actor,
        actorRole: 'reviewer',
        previousStatus: state.curatedReturn.status,
        newStatus: 'Changes requested',
        previousOwner: 'REVIEWER',
        newOwner: 'PREPARER',
        reason: state.selectedReviewCase.decisionReason,
        createdAt: new Date().toISOString(),
        visibility: 'STAFF_ONLY',
      };

      return {
        ...state,
        curatedReturn: {
          ...state.curatedReturn,
          status: 'Changes requested',
          nextActionOwner: 'PREPARER',
        },
        selectedReviewCase: {
          ...state.selectedReviewCase,
          status: 'CHANGES_REQUESTED',
        },
        reviewQueue: sortQueue(updatedQueue, 'reviewer-marcus-vance'),
        reviewStatusEvents: [...state.reviewStatusEvents, newEvent],
        eventCounter: state.eventCounter + 1,
        journeyThreeFeedback: 'Return returned to preparer successfully.',
      };
    }

    case 'SELECT_REVIEW_THREAD': {
      const threadId = action.payload;
      const thread = state.conversationThreads[threadId || ''];
      if ((threadId === 'thread-rostova-internal' || (thread && thread.visibility === 'FIRM_INTERNAL')) && state.currentRole === 'client') {
        return state;
      }
      return {
        ...state,
        selectedThreadId: action.payload,
      };
    }

    case 'UPDATE_INTERNAL_NOTE_DRAFT': {
      return {
        ...state,
        internalNoteDraft: action.payload,
      };
    }

    case 'ADD_INTERNAL_NOTE': {
      if (state.currentRole === 'client') return state;
      const { threadId, authorId, authorName } = action.payload;
      const thread = state.conversationThreads[threadId];
      if (!thread) return state;

      const newMsg: Message = {
        id: `msg-rostova-i-${state.messageCounter + 2}`,
        threadId,
        authorId,
        authorName,
        authorRole: state.currentRole as any,
        body: state.internalNoteDraft,
        createdAt: new Date().toISOString(),
        visibility: 'FIRM_INTERNAL',
        deliveryState: 'SENT',
        simulated: true,
      };

      const updatedThreads = { ...state.conversationThreads };
      updatedThreads[threadId] = {
        ...thread,
        messages: [...thread.messages, newMsg],
      };

      return {
        ...state,
        conversationThreads: updatedThreads,
        internalNoteDraft: '',
        messageCounter: state.messageCounter + 1,
        journeyThreeFeedback: 'Internal note added.',
      };
    }

    case 'TOGGLE_SIMULATED_DECISION_FAIL': {
      return {
        ...state,
        simulatedDecisionFail: action.payload,
      };
    }

    case 'RESET_JOURNEY_THREE': {
      const sorted = sortQueue(initialReviewQueue, 'reviewer-marcus-vance');
      return {
        ...state,
        reviewQueue: sorted,
        reviewQueueScope: 'mine',
        reviewQueueFilterStatus: 'all',
        reviewQueueFilterSeverity: 'all',
        reviewQueueSearch: '',
        selectedReviewReturnId: null,
        selectedReviewCase: null,
        reviewStatusEvents: JSON.parse(JSON.stringify(initialRostovaStatusEvents)),
        simulatedDecisionFail: false,
        journeyThreeFeedback: null,
        internalNoteDraft: '',
        reviewCorrectionEvidenceReviewed: false,
        curatedReturn: JSON.parse(JSON.stringify(initialCuratedReturn)),
        selectedFieldId: 'f1040-line1z',
      };
    }

    default:
      return state;
  }
}
