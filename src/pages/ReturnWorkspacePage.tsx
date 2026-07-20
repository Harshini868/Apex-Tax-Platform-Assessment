import React, { useEffect, useState } from 'react';
import { useSearchParams, useParams } from 'react-router';
import { useApp } from '../context/AppContext';
import { ReturnHeader } from '../components/workspace/ReturnHeader';
import { ReturnOutline } from '../components/workspace/ReturnOutline';
import { FieldReviewPanel } from '../components/workspace/FieldReviewPanel';
import { EvidencePanel } from '../components/workspace/EvidencePanel';
import { ReviewPanel } from '../components/workspace/ReviewPanel';
import { CollaborationPanel } from '../components/workspace/CollaborationPanel';
import { HistoryPanel } from '../components/workspace/HistoryPanel';
import { sourceDocuments, aiAnalyses, traceRecords } from '../mock/curatedJourneyOne';
import {
  curatedRostovaDocs,
  curatedRostovaAIAnalyses,
  curatedRostovaTraces,
  curatedRostovaReturn,
} from '../mock/curatedJourneyThree';
import { AlertOctagon, RefreshCw, FileText, CheckSquare } from 'lucide-react';

export const ReturnWorkspacePage: React.FC = () => {
  const { returnId } = useParams<{ returnId?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const { state, selectField, clearFeedback, selectReviewField, selectReviewThread, selectThread, selectReviewReturn } = useApp();
  const { curatedReturn, selectedFieldId, feedbackMessage } = state;

  const [liveAnnouncement, setLiveAnnouncement] = useState('');

  // Synchronize returnId from URL with context
  useEffect(() => {
    if (returnId && state.selectedReviewReturnId !== returnId) {
      selectReviewReturn(returnId);
    }
  }, [returnId, state.selectedReviewReturnId, selectReviewReturn]);

  const VALID_PANELS = ['evidence', 'review', 'collaboration', 'history'];

  const fieldParam = searchParams.get('field');
  const rawPanel = searchParams.get('panel');
  // An unrecognized panel value must fall back to a real panel, never render a blank column
  const activePanel = rawPanel && VALID_PANELS.includes(rawPanel) ? rawPanel : 'evidence';
  const threadParam = searchParams.get('thread');

  const isRostova = returnId === 'ret-rostova-tech-1120s' || window.location.pathname.includes('ret-rostova-tech-1120s');
  const activeDocsList = isRostova ? curatedRostovaDocs : sourceDocuments;
  const activeTracesMap = isRostova ? curatedRostovaTraces : traceRecords;
  const activeAIAnalysesMap = isRostova ? curatedRostovaAIAnalyses : aiAnalyses;

  // URL query synchronizer for field selection
  useEffect(() => {
    if (!fieldParam) {
      // Default based on return
      const defaultField = isRostova ? 'rostova-interest-expense' : 'f1040-line1z';
      const params = new URLSearchParams(searchParams);
      params.set('field', defaultField);
      setSearchParams(params, { replace: true });
    } else {
      // Validate field param exists in active return outline
      const activeReturn = isRostova ? curatedRostovaReturn : curatedReturn;
      let valid = false;
      activeReturn?.sections?.forEach((sec) => {
        if (sec.fields.some((f) => f.id === fieldParam)) {
          valid = true;
        }
      });
      if (valid && selectedFieldId !== fieldParam) {
        if (isRostova) {
          selectReviewField(fieldParam);
        } else {
          selectField(fieldParam);
        }
      }
    }
  }, [fieldParam, setSearchParams, selectField, selectReviewField, curatedReturn, selectedFieldId, isRostova]);

  // URL query synchronizer for thread selection — only dispatch for a thread that actually
  // exists; an unknown ID must recover visibly instead of silently rendering a blank panel
  useEffect(() => {
    if (threadParam && state.conversationThreads[threadParam] && threadParam !== state.selectedThreadId) {
      if (isRostova) {
        selectReviewThread(threadParam);
      } else {
        selectThread(threadParam);
      }
    }
  }, [threadParam, state.selectedThreadId, state.conversationThreads, isRostova, selectReviewThread, selectThread]);

  // Handle active feedback live region announcements
  useEffect(() => {
    if (feedbackMessage) {
      setLiveAnnouncement(feedbackMessage);
      const timer = setTimeout(() => {
        setLiveAnnouncement('');
        clearFeedback();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [feedbackMessage, clearFeedback]);

  // Find currently selected field object based on URL parameter if present, otherwise fallback to context state
  const activeFieldId = fieldParam || (isRostova ? 'rostova-interest-expense' : selectedFieldId);
  const activeReturn = (curatedReturn && curatedReturn.id === returnId) ? curatedReturn : (isRostova ? curatedRostovaReturn : curatedReturn);
  const activeField = activeReturn?.sections
    ? activeReturn.sections.flatMap((sec) => sec.fields).find((f) => f.id === activeFieldId) || null
    : null;

  // Find linked documents and AI metadata
  const activeTrace = activeField ? (activeTracesMap as any)[activeField.id] : null;
  const activeDoc = activeTrace?.sourceDocumentId
    ? activeDocsList.find((d) => d.id === activeTrace.sourceDocumentId)
    : null;
  const activeAI = activeField && activeField.aiAnalysisId ? (activeAIAnalysesMap as any)[activeField.aiAnalysisId] : null;

  // Handle click on left outline items
  const handleSelectField = (id: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('field', id);
    setSearchParams(params);
  };

  // Handle right panel switcher click
  const handlePanelChange = (panelName: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('panel', panelName);
    setSearchParams(params);
  };

  // Recover from invalid URL parameter
  const handleResetField = () => {
    const defaultField = isRostova ? 'rostova-interest-expense' : 'f1040-line1z';
    setSearchParams({ field: defaultField });
  };

  const handleResetThread = () => {
    const params = new URLSearchParams(searchParams);
    params.delete('thread');
    setSearchParams(params);
  };

  // A thread param that doesn't exist, or that points at a firm-internal thread the client role
  // cannot read, must recover to a visible state — never a blank collaboration panel, and never
  // reveal the internal thread's subject/participants/classification to a client.
  const requestedThread = threadParam ? state.conversationThreads[threadParam] : null;
  const isThreadParamUnknown = !!threadParam && !requestedThread;
  const isThreadParamInternalBlocked =
    !!requestedThread && requestedThread.visibility === 'FIRM_INTERNAL' && state.currentRole === 'client';

  // If a field parameter is specified but is invalid, display unknown-field recovery view
  const isParamInvalid = fieldParam && !activeField;

  return (
    <div className="space-y-6">
      {/* Dynamic Screen Reader Announcement Region */}
      <div className="sr-only" aria-live="polite" role="status">
        {liveAnnouncement}
      </div>

      <ReturnHeader curatedReturn={activeReturn} />

      {isParamInvalid ? (
        <div className="rounded-lg border border-rose-500/30 bg-rose-950/20 p-8 text-center max-w-2xl mx-auto my-12" role="alert">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-900/40 text-rose-200 mx-auto mb-4 border border-rose-500/40">
            <AlertOctagon className="h-6 w-6" aria-hidden="true" />
          </div>
          <h2 className="text-xl font-bold tracking-tight mb-2">Unknown Tax Field Reference</h2>
          <p className="text-sm text-[var(--color-text-secondary)] mb-6">
            The field query parameter <code className="bg-rose-950 px-1.5 py-0.5 rounded font-mono text-rose-300">"{fieldParam}"</code> does not match any valid lines in the current return.
          </p>
          <button
            onClick={handleResetField}
            className="inline-flex items-center gap-2 rounded-md bg-[var(--color-primary-action)] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[var(--color-primary-action)]/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            {isRostova ? 'Reset to Interest Expense' : 'Reset to Wages Field (Line 1z)'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Column A: Outline Selector (4 spans) */}
          <section className="lg:col-span-4 h-[calc(100vh-280px)] min-h-[500px]" aria-label="Return Forms Checklist Outline">
            <ReturnOutline
              curatedReturn={activeReturn}
              selectedFieldId={selectedFieldId}
              onSelectField={handleSelectField}
            />
          </section>

          {/* Column B: Active Field Review (4 spans) */}
          <section className="lg:col-span-4 space-y-6" aria-label="Active Line Review Controls">
            {activeField ? (
              <FieldReviewPanel field={activeField} />
            ) : (
              <div className="bg-[var(--color-surface-bg)] border border-[var(--color-border-custom)] rounded-lg p-6 text-center text-xs text-[var(--color-text-secondary)] italic">
                Select a field from the outline checklist.
              </div>
            )}
          </section>

          {/* Column C: Tabbed Multi-Panel Container (4 spans) */}
          <section className="lg:col-span-4 space-y-4" aria-label="Details and Action Panels">
            {/* Panel Tabs */}
            <div className="flex bg-[var(--color-surface-elevated-bg)] p-1 rounded-md border border-[var(--color-border-custom)] text-xs font-semibold">
              <button
                onClick={() => handlePanelChange('evidence')}
                aria-label="Trace Scan"
                className={`flex-1 py-2 text-center rounded-md transition-colors ${
                  activePanel === 'evidence'
                    ? 'bg-[var(--color-primary-action)] text-white shadow-sm font-bold'
                    : 'text-zinc-400 hover:text-[var(--color-text-primary)]'
                }`}
              >
                <span className="flex items-center justify-center gap-1.5">
                  <FileText className="h-3.5 w-3.5" />
                  Evidence
                </span>
              </button>
              {state.currentRole !== 'client' && (
                <button
                  onClick={() => handlePanelChange('review')}
                  aria-label="CPA Review"
                  className={`flex-1 py-2 text-center rounded-md transition-colors ${
                    activePanel === 'review'
                      ? 'bg-[var(--color-primary-action)] text-white shadow-sm font-bold'
                      : 'text-zinc-400 hover:text-[var(--color-text-primary)]'
                  }`}
                >
                  <span className="flex items-center justify-center gap-1.5">
                    <CheckSquare className="h-3.5 w-3.5" />
                    Review
                  </span>
                </button>
              )}
              <button
                onClick={() => handlePanelChange('collaboration')}
                className={`flex-1 py-2 text-center rounded-md transition-colors ${
                  activePanel === 'collaboration'
                    ? 'bg-[var(--color-primary-action)] text-white shadow-sm font-bold'
                    : 'text-zinc-400 hover:text-[var(--color-text-primary)]'
                }`}
              >
                Chat Notes
              </button>
              <button
                onClick={() => handlePanelChange('history')}
                className={`flex-1 py-2 text-center rounded-md transition-colors ${
                  activePanel === 'history'
                    ? 'bg-[var(--color-primary-action)] text-white shadow-sm font-bold'
                    : 'text-zinc-400 hover:text-[var(--color-text-primary)]'
                }`}
              >
                Timeline Logs
              </button>
            </div>

            {/* Panel Content Switcher */}
            {activePanel === 'evidence' && activeField && (
              <EvidencePanel
                field={activeField}
                document={activeDoc || null}
                aiAnalysis={activeAI || null}
                traceRecord={activeTrace || null}
                allDocuments={activeDocsList}
              />
            )}

            {activePanel === 'review' && (
              <ReviewPanel />
            )}

            {activePanel === 'collaboration' && (
              isThreadParamInternalBlocked ? (
                <div
                  className="bg-[var(--color-surface-bg)] border border-[var(--color-border-custom)] rounded-lg p-6 text-center text-xs text-rose-400 font-medium"
                  role="alert"
                >
                  This conversation is unavailable.
                </div>
              ) : isThreadParamUnknown ? (
                <div className="bg-[var(--color-surface-bg)] border border-[var(--color-border-custom)] rounded-lg p-6 text-center text-xs space-y-3" role="alert">
                  <p className="text-[var(--color-text-secondary)]">Unknown conversation reference.</p>
                  <button
                    onClick={handleResetThread}
                    className="inline-flex items-center gap-2 rounded-md bg-[var(--color-primary-action)] px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-[var(--color-primary-action)]/80"
                  >
                    <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                    Reset conversation
                  </button>
                </div>
              ) : (
                <CollaborationPanel />
              )
            )}

            {activePanel === 'history' && (
              <HistoryPanel />
            )}
          </section>
        </div>
      )}
    </div>
  );
};
export default ReturnWorkspacePage;
