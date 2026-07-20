import React, { useEffect } from 'react';
import { useSearchParams, Link } from 'react-router';
import { useApp } from '../context/AppContext';
import { OnboardingStepList } from '../components/onboarding/OnboardingStepList';
import { DocumentRequestPanel } from '../components/onboarding/DocumentRequestPanel';
import { ContextualThread } from '../components/collaboration/ContextualThread';
import { ClientProgress } from '../components/onboarding/ClientProgress';
import { ArrowLeft, RefreshCw, AlertOctagon, HelpCircle } from 'lucide-react';

export const OnboardingPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { state, selectOnboardingStep, selectRequest, selectThread } = useApp();
  
  const {
    onboardingProfile,
    documentRequests,
    questionnaireItems,
    conversationThreads,
    selectedOnboardingStepId,
    selectedRequestId,
    selectedThreadId,
    progressStages,
    currentRole,
  } = state;

  const stepParam = searchParams.get('step');
  const requestParam = searchParams.get('request');
  const threadParam = searchParams.get('thread');

  // Synchronize URL parameters with React Context state
  useEffect(() => {
    // 1. Resolve step parameter
    if (!stepParam) {
      setSearchParams({ step: 'required-information', request: 'req-john-w2' }, { replace: true });
      return;
    }

    const matchedStepId = stepParam === 'required-information' ? 'step-required-info' : null;
    if (matchedStepId && selectedOnboardingStepId !== matchedStepId) {
      selectOnboardingStep(matchedStepId);
    }

    // 2. Resolve request parameter
    if (requestParam && selectedRequestId !== requestParam) {
      // Validate request exists in documentRequests
      if (documentRequests[requestParam]) {
        selectRequest(requestParam);
      }
    }

    // 3. Resolve thread parameter
    if (threadParam && selectedThreadId !== threadParam) {
      // Validate thread exists and visibility allows client view
      const thread = conversationThreads[threadParam];
      if (thread) {
        if (!(thread.visibility === 'FIRM_INTERNAL' && currentRole === 'client')) {
          selectThread(threadParam);
        }
      }
    } else if (!threadParam && selectedThreadId) {
      selectThread(null);
    }
  }, [
    stepParam,
    requestParam,
    threadParam,
    selectedOnboardingStepId,
    selectedRequestId,
    selectedThreadId,
    documentRequests,
    conversationThreads,
    currentRole,
    setSearchParams,
    selectOnboardingStep,
    selectRequest,
    selectThread,
  ]);

  // Navigate when step is clicked
  const handleSelectStep = (stepId: string) => {
    if (stepId === 'step-required-info') {
      setSearchParams({ step: 'required-information', request: 'req-john-w2' });
    }
  };

  const handleNavigateToThread = (threadId: string) => {
    setSearchParams({
      step: 'required-information',
      request: selectedRequestId || 'req-john-w2',
      thread: threadId,
    });
  };

  const handleBackToRequest = () => {
    setSearchParams({
      step: 'required-information',
      request: selectedRequestId || 'req-john-w2',
    });
  };

  const handleResetParameters = () => {
    setSearchParams({ step: 'required-information', request: 'req-john-w2' });
  };

  // Validation checks for URL params
  const isStepInvalid = stepParam && stepParam !== 'required-information';
  const isRequestInvalid = requestParam && !documentRequests[requestParam];
  const isThreadInternal = threadParam && conversationThreads[threadParam]?.visibility === 'FIRM_INTERNAL' && currentRole === 'client';
  const isThreadInvalid = threadParam && !conversationThreads[threadParam];

  const hasParamError = isStepInvalid || isRequestInvalid || isThreadInternal || isThreadInvalid;

  // Active items lookup
  const activeRequest = selectedRequestId ? documentRequests[selectedRequestId] : null;
  const activeQuestion = activeRequest?.linkedQuestionId ? questionnaireItems[activeRequest.linkedQuestionId] : null;
  const activeThread = selectedThreadId ? conversationThreads[selectedThreadId] : null;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <header className="space-y-4" aria-label="Onboarding workspace orientation header">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <nav className="text-xs text-[var(--color-text-secondary)] font-medium" aria-label="Breadcrumb navigation">
            <ol className="flex items-center gap-1.5 list-none p-0 m-0">
              <li>
                <Link to="/dashboard" className="hover:text-[var(--color-text-primary)] hover:underline">
                  Dashboard
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <span className="text-[var(--color-text-primary)] font-semibold">
                  Onboarding Checklist
                </span>
              </li>
            </ol>
          </nav>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
          >
            <ArrowLeft className="h-3 w-3" />
            Back to Client Home
          </Link>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--color-border-custom)] pb-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-extrabold tracking-tight text-[var(--color-text-primary)]">
              Client Onboarding Workspace
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--color-text-secondary)]">
              <span>Client: <strong>John Miller</strong></span>
              <span aria-hidden="true">•</span>
              <span>Onboarding Progress: <strong>{onboardingProfile.percentComplete}% Complete</strong></span>
            </div>
          </div>
        </div>
      </header>

      {/* URL Parameter Error Recovery View */}
      {hasParamError ? (
        <div className="rounded-lg border border-rose-500/30 bg-rose-950/20 p-8 text-center max-w-2xl mx-auto my-12" role="alert">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-900/40 text-rose-200 mx-auto mb-4 border border-rose-500/40">
            <AlertOctagon className="h-6 w-6" aria-hidden="true" />
          </div>
          
          <h2 className="text-xl font-bold tracking-tight mb-2">
            {isThreadInternal ? 'Conversation is Unavailable' : 'Invalid Portal Reference'}
          </h2>
          
          <p className="text-sm text-[var(--color-text-secondary)] mb-6">
            {isThreadInternal
              ? 'This conversation is unavailable.'
              : 'The requested onboarding stage, document checklist item, or message thread reference does not exist.'}
          </p>

          <button
            onClick={handleResetParameters}
            className="inline-flex items-center gap-2 rounded-md bg-[var(--color-primary-action)] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[var(--color-primary-action)]/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 cursor-pointer"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Reset to Checklist Actions
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Column 1: Onboarding steps checklist (span 3) */}
          <aside className="lg:col-span-3 space-y-4" aria-label="Onboarding Checklist Navigation">
            <OnboardingStepList
              steps={onboardingProfile.steps}
              selectedStepId={selectedOnboardingStepId}
              onSelectStep={handleSelectStep}
            />
          </aside>

          {/* Column 2: Selected action request workspace (span 5) */}
          <main className="lg:col-span-5" aria-label="Onboarding action details">
            {activeRequest ? (
              <DocumentRequestPanel
                request={activeRequest}
                question={activeQuestion}
                onNavigateToThread={handleNavigateToThread}
              />
            ) : (
              <div className="bg-[var(--color-surface-bg)] border border-[var(--color-border-custom)] rounded-lg p-8 text-center text-xs text-[var(--color-text-secondary)] italic">
                Select a step on the checklist to view actions.
              </div>
            )}
          </main>

          {/* Column 3: Context Panel (span 4) */}
          <section className="lg:col-span-4 space-y-6" aria-label="Context information details">
            {activeThread ? (
              <ContextualThread
                thread={activeThread}
                onBackToRequest={handleBackToRequest}
              />
            ) : (
              <div className="space-y-6">
                {/* Client Progress stages visual summary */}
                <ClientProgress stages={progressStages} />
                
                {/* FAQ Help card */}
                <div className="bg-[var(--color-surface-bg)] border border-[var(--color-border-custom)] rounded-lg p-5 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
                    <HelpCircle className="h-4 w-4 text-[var(--color-primary-action)]" />
                    <span>Need Portal Assistance?</span>
                  </div>
                  <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                    If you have questions about which boxes to check, or are missing required documents, use the "Ask preparer a question" chat panel to send a message directly to David Chen.
                  </p>
                </div>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
};
export default OnboardingPage;
