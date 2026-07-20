import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  MessageSquare,
  Lock,
  Send,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';

export const CollaborationPanel: React.FC = () => {
  const {
    state,
    selectReviewThread,
    updateMessageDraft,
    updateInternalNoteDraft,
    sendClientMessage,
    addInternalNote,
    retryClientMessage,
  } = useApp();

  const {
    currentRole,
    conversationThreads,
    selectedThreadId,
    messageDraft,
    internalNoteDraft,
    selectedReviewReturnId,
  } = state;

  const isClient = currentRole === 'client';
  const isPreparer = currentRole === 'preparer';
  const activeReturnId = selectedReviewReturnId || 'ret-rostova-tech-1120s';

  // Determine active threads for this return
  const clientThreadId = activeReturnId === 'ret-rostova-tech-1120s' ? 'thread-rostova-client' : 'thread-john-w2';
  const internalThreadId = activeReturnId === 'ret-rostova-tech-1120s' ? 'thread-rostova-internal' : null;

  const internalThread = internalThreadId ? conversationThreads[internalThreadId] : null;

  // Enforce client role constraint: Client cannot access internal thread. The reducer already
  // refuses to ever set selectedThreadId to an internal thread for a client (SELECT_REVIEW_THREAD/
  // SELECT_THREAD), so selectedThreadId is safe to trust directly here — no internal thread can
  // reach this component for a client role.
  const activeThreadId = isClient ? clientThreadId : selectedThreadId || clientThreadId;
  const activeThread = conversationThreads[activeThreadId];

  const currentActorId = isClient ? 'client-rostova-tech' : isPreparer ? 'preparer-david-chen' : 'reviewer-marcus-vance';
  const currentActorName = isClient ? 'Elena Rostova' : isPreparer ? 'David Chen' : 'Marcus Vance';

  const handleThreadSelect = (threadId: string) => {
    if (isClient && threadId === 'thread-rostova-internal') return;
    selectReviewThread(threadId);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeThreadId === 'thread-rostova-internal') {
      if (!internalNoteDraft.trim()) return;
      addInternalNote('thread-rostova-internal', currentActorId, currentActorName);
    } else {
      if (!messageDraft.trim()) return;
      sendClientMessage(activeThreadId, currentActorId, currentActorName);
    }
  };

  const handleComposerChange = (text: string) => {
    if (activeThreadId === 'thread-rostova-internal') {
      updateInternalNoteDraft(text);
    } else {
      updateMessageDraft(text);
    }
  };

  const getAuthorDisplayLabel = (role: string) => {
    if (role === 'client') return 'Client';
    if (role === 'preparer') return 'Preparer';
    if (role === 'reviewer') return 'Reviewer';
    return role;
  };

  return (
    <div className="bg-[var(--color-surface-bg)] border border-[var(--color-border-custom)] rounded-lg p-5 flex flex-col h-[500px]" aria-label="Collaboration hub">
      {/* Thread Tab Switcher */}
      {!isClient && internalThread && (
        <div className="flex bg-[var(--color-surface-elevated-bg)] p-1 rounded-md border border-[var(--color-border-custom)] mb-4 text-xs font-semibold">
          <button
            onClick={() => handleThreadSelect(clientThreadId)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md transition-colors ${
              activeThreadId === clientThreadId
                ? 'bg-[var(--color-surface-bg)] text-[var(--color-primary-action-text)] shadow-sm'
                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            Client Portal Chat
          </button>
          <button
            onClick={() => handleThreadSelect('thread-rostova-internal')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md transition-colors ${
              activeThreadId === 'thread-rostova-internal'
                ? 'bg-[var(--color-surface-bg)] text-amber-500 shadow-sm'
                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
            }`}
          >
            <Lock className="h-4 w-4" />
            Firm-Internal Notes
          </button>
        </div>
      )}

      {isClient && (
        <div className="border-b border-[var(--color-border-custom)] pb-3 mb-4 flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-[var(--color-primary-action)]" />
          <h2 className="text-sm font-bold text-[var(--color-text-primary)]">Preparer Chat Channel</h2>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 mb-4">
        {activeThread?.messages.length === 0 ? (
          <div className="text-center text-xs text-[var(--color-text-secondary)] italic py-12">
            No messages exchanged in this thread yet.
          </div>
        ) : (
          activeThread?.messages.map((msg) => {
            const isMe = msg.authorId === currentActorId;
            const isNote = msg.visibility === 'FIRM_INTERNAL';
            const isFailed = msg.deliveryState === 'FAILED';

            return (
              <div
                key={msg.id}
                className={`flex flex-col max-w-[85%] text-xs ${
                  isMe ? 'ml-auto items-end' : 'mr-auto items-start'
                }`}
              >
                <span className="text-[10px] text-[var(--color-text-secondary)] font-medium mb-1">
                  {msg.authorName} ({getAuthorDisplayLabel(msg.authorRole)})
                </span>
                <div
                  className={`p-3 rounded-lg border leading-relaxed break-words whitespace-pre-wrap ${
                    isNote
                      ? 'bg-amber-950/20 border-amber-500/20 text-amber-100'
                      : isMe
                      ? 'bg-[var(--color-primary-action)]/10 border-[var(--color-primary-action)]/20 text-[var(--color-text-primary)]'
                      : 'bg-zinc-800 border-zinc-700 text-[var(--color-text-primary)]'
                  }`}
                >
                  {msg.body}
                </div>

                <div className="flex items-center gap-1.5 mt-1 text-[9px] text-[var(--color-text-secondary)]">
                  <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  {isFailed && (
                    <div className="flex items-center gap-1 text-rose-400 font-bold">
                      <AlertTriangle className="h-2.5 w-2.5" />
                      <span>Failed</span>
                      <button
                        onClick={() => retryClientMessage(activeThreadId, msg.id)}
                        className="hover:underline font-bold text-[var(--color-primary-emphasis-text)] flex items-center gap-0.5 ml-1"
                      >
                        <RefreshCw className="h-2.5 w-2.5" />
                        Retry
                      </button>
                    </div>
                  )}
                  {msg.deliveryState === 'SENT' && !isFailed && (
                    <span className="text-emerald-400">✓ Sent</span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Composer Input Area */}
      <form onSubmit={handleSend} className="border-t border-[var(--color-border-custom)] pt-3 flex gap-2">
        <input
          type="text"
          value={activeThreadId === 'thread-rostova-internal' ? internalNoteDraft : messageDraft}
          onChange={(e) => handleComposerChange(e.target.value)}
          placeholder={
            activeThreadId === 'thread-rostova-internal'
              ? 'Add internal audit note...'
              : 'Send message to client...'
          }
          className="flex-1 bg-[var(--color-surface-elevated-bg)] border border-[var(--color-border-custom)] rounded-md px-3 py-2 text-xs text-[var(--color-text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary-action)]"
        />
        <button
          type="submit"
          className="bg-[var(--color-primary-action)] hover:bg-[var(--color-primary-action)]/90 text-white p-2 rounded-md transition-colors"
          aria-label="Send message"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
};
