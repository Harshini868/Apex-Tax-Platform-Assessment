import React, { createContext, useContext, useReducer } from 'react';
import type { ReactNode } from 'react';
import type { PreviewRole } from '../types/roles';
import { appReducer, initialState } from './appReducer';
import type { AppState } from './appReducer';
import type { RequestedFileMetadata } from '../domain/request';
import type { ReviewChecklistStatus } from '../domain/review';

interface AppContextType {
  state: AppState;
  setRole: (role: PreviewRole) => void;
  selectField: (fieldId: string | null) => void;
  startCorrection: () => void;
  updateCorrectionDraft: (value: string, reason: string) => void;
  cancelCorrection: () => void;
  saveCorrection: (actor: string, actorRole: 'preparer' | 'reviewer') => void;
  verifyField: (fieldId: string, actor: string, actorRole: 'preparer' | 'reviewer') => void;
  lockField: (fieldId: string, actor: string, actorRole: 'preparer' | 'reviewer', reason: string) => void;
  resetJourneyOne: () => void;
  clearFeedback: () => void;

  // Journey 2 dispatch functions
  loadJourneyTwo: () => void;
  acknowledgeWelcome: () => void;
  selectOnboardingStep: (stepId: string | null) => void;
  selectRequest: (requestId: string | null) => void;
  stageRequestFile: (requestId: string, file: RequestedFileMetadata) => void;
  clearStagedFile: (requestId: string) => void;
  answerQuestion: (questionId: string, answer: string) => void;
  submitRequest: (requestId: string) => void;
  markRequestReceived: (requestId: string) => void;
  requestReplacement: (requestId: string, outcome: string) => void;
  selectThread: (threadId: string | null) => void;
  updateMessageDraft: (body: string) => void;
  sendClientMessage: (threadId: string, authorId: string, authorName: string) => void;
  retryClientMessage: (threadId: string, messageId: string) => void;
  resetJourneyTwo: () => void;
  toggleSimulatedFail: (key: 'simulatedSubmitFail' | 'simulatedSendFail', value: boolean) => void;

  // Journey 3 Actions
  loadJourneyThree: () => void;
  setReviewQueueScope: (scope: 'mine' | 'team') => void;
  setReviewQueueFilter: (status: string, severity: string) => void;
  setReviewQueueSearch: (query: string) => void;
  selectReviewReturn: (returnId: string | null) => void;
  startReview: (returnId: string, reviewerId: string) => void;
  selectReviewField: (fieldId: string | null) => void;
  updateReviewChecklist: (itemId: string, status: ReviewChecklistStatus) => void;
  startReviewCorrection: (fieldId: string) => void;
  updateReviewCorrection: (value: string, reason: string, evidenceReviewed: boolean) => void;
  cancelReviewCorrection: () => void;
  saveReviewCorrection: () => void;
  updateReviewDecisionReason: (reason: string) => void;
  approveReviewUnchanged: (reviewerId: string, actor: string) => void;
  correctAndApprove: (reviewerId: string, actor: string) => void;
  returnToPreparer: (reviewerId: string, actor: string) => void;
  selectReviewThread: (threadId: string | null) => void;
  updateInternalNoteDraft: (body: string) => void;
  addInternalNote: (threadId: string, authorId: string, authorName: string) => void;
  resetJourneyThree: () => void;
  toggleSimulatedDecisionFail: (value: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const setRole = (role: PreviewRole) => {
    dispatch({ type: 'SET_ROLE', payload: role });
  };

  const selectField = (fieldId: string | null) => {
    dispatch({ type: 'SELECT_FIELD', payload: fieldId });
  };

  const startCorrection = () => {
    dispatch({ type: 'START_CORRECTION' });
  };

  const updateCorrectionDraft = (value: string, reason: string) => {
    dispatch({ type: 'UPDATE_CORRECTION_DRAFT', payload: { value, reason } });
  };

  const cancelCorrection = () => {
    dispatch({ type: 'CANCEL_CORRECTION' });
  };

  const saveCorrection = (actor: string, actorRole: 'preparer' | 'reviewer') => {
    dispatch({ type: 'SAVE_CORRECTION', payload: { actor, actorRole } });
  };

  const verifyField = (fieldId: string, actor: string, actorRole: 'preparer' | 'reviewer') => {
    dispatch({ type: 'VERIFY_FIELD', payload: { fieldId, actor, actorRole } });
  };

  const lockField = (fieldId: string, actor: string, actorRole: 'preparer' | 'reviewer', reason: string) => {
    dispatch({ type: 'LOCK_FIELD', payload: { fieldId, actor, actorRole, reason } });
  };

  const resetJourneyOne = () => {
    dispatch({ type: 'RESET_JOURNEY_ONE' });
  };

  const clearFeedback = () => {
    dispatch({ type: 'CLEAR_FEEDBACK' });
  };

  // Journey 2 implementations
  const loadJourneyTwo = () => {
    dispatch({ type: 'LOAD_JOURNEY_TWO' });
  };

  const acknowledgeWelcome = () => {
    dispatch({ type: 'ACKNOWLEDGE_WELCOME' });
  };

  const selectOnboardingStep = (stepId: string | null) => {
    dispatch({ type: 'SELECT_ONBOARDING_STEP', payload: stepId });
  };

  const selectRequest = (requestId: string | null) => {
    dispatch({ type: 'SELECT_REQUEST', payload: requestId });
  };

  const stageRequestFile = (requestId: string, file: RequestedFileMetadata) => {
    dispatch({ type: 'STAGE_REQUEST_FILE', payload: { requestId, file } });
  };

  const clearStagedFile = (requestId: string) => {
    dispatch({ type: 'CLEAR_STAGED_FILE', payload: requestId });
  };

  const answerQuestion = (questionId: string, answer: string) => {
    dispatch({ type: 'ANSWER_QUESTION', payload: { questionId, answer } });
  };

  const submitRequest = (requestId: string) => {
    dispatch({ type: 'SUBMIT_REQUEST', payload: requestId });
  };

  const markRequestReceived = (requestId: string) => {
    dispatch({ type: 'MARK_REQUEST_RECEIVED', payload: requestId });
  };

  const requestReplacement = (requestId: string, outcome: string) => {
    dispatch({ type: 'REQUEST_REPLACEMENT', payload: { requestId, outcome } });
  };

  const selectThread = (threadId: string | null) => {
    dispatch({ type: 'SELECT_THREAD', payload: threadId });
  };

  const updateMessageDraft = (body: string) => {
    dispatch({ type: 'UPDATE_MESSAGE_DRAFT', payload: body });
  };

  const sendClientMessage = (threadId: string, authorId: string, authorName: string) => {
    dispatch({ type: 'SEND_CLIENT_MESSAGE', payload: { threadId, authorId, authorName } });
  };

  const retryClientMessage = (threadId: string, messageId: string) => {
    dispatch({ type: 'RETRY_CLIENT_MESSAGE', payload: { threadId, messageId } });
  };

  const resetJourneyTwo = () => {
    dispatch({ type: 'RESET_JOURNEY_TWO' });
  };

  const toggleSimulatedFail = (key: 'simulatedSubmitFail' | 'simulatedSendFail', value: boolean) => {
    dispatch({ type: 'TOGGLE_SIMULATED_FAIL', payload: { key, value } });
  };

  // Journey 3 Implementations
  const loadJourneyThree = () => {
    dispatch({ type: 'LOAD_JOURNEY_THREE' });
  };

  const setReviewQueueScope = (scope: 'mine' | 'team') => {
    dispatch({ type: 'SET_REVIEW_QUEUE_SCOPE', payload: scope });
  };

  const setReviewQueueFilter = (status: string, severity: string) => {
    dispatch({ type: 'SET_REVIEW_QUEUE_FILTER', payload: { status, severity } });
  };

  const setReviewQueueSearch = (query: string) => {
    dispatch({ type: 'SET_REVIEW_QUEUE_SEARCH', payload: query });
  };

  const selectReviewReturn = (returnId: string | null) => {
    dispatch({ type: 'SELECT_REVIEW_RETURN', payload: returnId });
  };

  const startReview = (returnId: string, reviewerId: string) => {
    dispatch({ type: 'START_REVIEW', payload: { returnId, reviewerId } });
  };

  const selectReviewField = (fieldId: string | null) => {
    dispatch({ type: 'SELECT_REVIEW_FIELD', payload: fieldId });
  };

  const updateReviewChecklist = (itemId: string, status: ReviewChecklistStatus) => {
    dispatch({ type: 'UPDATE_REVIEW_CHECKLIST', payload: { itemId, status } });
  };

  const startReviewCorrection = (fieldId: string) => {
    dispatch({ type: 'START_REVIEW_CORRECTION', payload: fieldId });
  };

  const updateReviewCorrection = (value: string, reason: string, evidenceReviewed: boolean) => {
    dispatch({ type: 'UPDATE_REVIEW_CORRECTION', payload: { value, reason, evidenceReviewed } });
  };

  const cancelReviewCorrection = () => {
    dispatch({ type: 'CANCEL_REVIEW_CORRECTION' });
  };

  const saveReviewCorrection = () => {
    dispatch({ type: 'SAVE_REVIEW_CORRECTION' });
  };

  const updateReviewDecisionReason = (reason: string) => {
    dispatch({ type: 'UPDATE_REVIEW_DECISION_REASON', payload: reason });
  };

  const approveReviewUnchanged = (reviewerId: string, actor: string) => {
    dispatch({ type: 'APPROVE_REVIEW_UNCHANGED', payload: { reviewerId, actor } });
  };

  const correctAndApprove = (reviewerId: string, actor: string) => {
    dispatch({ type: 'CORRECT_AND_APPROVE', payload: { reviewerId, actor } });
  };

  const returnToPreparer = (reviewerId: string, actor: string) => {
    dispatch({ type: 'RETURN_TO_PREPARER', payload: { reviewerId, actor } });
  };

  const selectReviewThread = (threadId: string | null) => {
    dispatch({ type: 'SELECT_REVIEW_THREAD', payload: threadId });
  };

  const updateInternalNoteDraft = (body: string) => {
    dispatch({ type: 'UPDATE_INTERNAL_NOTE_DRAFT', payload: body });
  };

  const addInternalNote = (threadId: string, authorId: string, authorName: string) => {
    dispatch({ type: 'ADD_INTERNAL_NOTE', payload: { threadId, authorId, authorName } });
  };

  const resetJourneyThree = () => {
    dispatch({ type: 'RESET_JOURNEY_THREE' });
  };

  const toggleSimulatedDecisionFail = (value: boolean) => {
    dispatch({ type: 'TOGGLE_SIMULATED_DECISION_FAIL', payload: value });
  };

  return (
    <AppContext.Provider
      value={{
        state,
        setRole,
        selectField,
        startCorrection,
        updateCorrectionDraft,
        cancelCorrection,
        saveCorrection,
        verifyField,
        lockField,
        resetJourneyOne,
        clearFeedback,

        // Journey 2
        loadJourneyTwo,
        acknowledgeWelcome,
        selectOnboardingStep,
        selectRequest,
        stageRequestFile,
        clearStagedFile,
        answerQuestion,
        submitRequest,
        markRequestReceived,
        requestReplacement,
        selectThread,
        updateMessageDraft,
        sendClientMessage,
        retryClientMessage,
        resetJourneyTwo,
        toggleSimulatedFail,

        // Journey 3
        loadJourneyThree,
        setReviewQueueScope,
        setReviewQueueFilter,
        setReviewQueueSearch,
        selectReviewReturn,
        startReview,
        selectReviewField,
        updateReviewChecklist,
        startReviewCorrection,
        updateReviewCorrection,
        cancelReviewCorrection,
        saveReviewCorrection,
        updateReviewDecisionReason,
        approveReviewUnchanged,
        correctAndApprove,
        returnToPreparer,
        selectReviewThread,
        updateInternalNoteDraft,
        addInternalNote,
        resetJourneyThree,
        toggleSimulatedDecisionFail,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
export { AppContext };
