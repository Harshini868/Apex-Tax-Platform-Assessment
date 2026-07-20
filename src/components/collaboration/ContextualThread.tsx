import React, { useRef, useState } from 'react';
import { useApp } from '../../context/AppContext';
import type { ConversationThread } from '../../domain/collaboration';
import { Send, AlertCircle, RefreshCw, ArrowLeft, Shield, Eye } from 'lucide-react';

interface ContextualThreadProps {
  thread: ConversationThread;
  onBackToRequest: () => void;
}

export const ContextualThread: React.FC<ContextualThreadProps> = ({
  thread,
  onBackToRequest,
}) => {
  const {
    state,
    updateMessageDraft,
    sendClientMessage,
    retryClientMessage,
  } = useApp();

  const isClientRole = state.currentRole === 'client';
  const composerRef = useRef<HTMLTextAreaElement>(null);
  
  const [composerError, setComposerError] = useState<string | null>(null);

  // Validate thread is Client Visible if the active role is client
  if (isClientRole && thread.visibility === 'FIRM_INTERNAL') {
    return (
      <div className="bg-[var(--color-surface-bg)] border border-[var(--color-border-custom)] rounded-lg p-6 text-center text-xs text-rose-400 font-medium" role="alert">
        This conversation is unavailable.
      </div>
    );
  }

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setComposerError(null);
    updateMessageDraft(e.target.value);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    setComposerError(null);

    const trimmed = state.messageDraft.trim();
    if (!trimmed) {
      setComposerError('Message body cannot be empty.');
      composerRef.current?.focus();
      return;
    }

    // Trigger send action
    const authorId = isClientRole ? 'client-john-miller' : 'preparer-david-chen';
    const authorName = isClientRole ? 'John Miller' : 'David Chen';
    sendClientMessage(thread.id, authorId, authorName);
  };

  const handleRetryMessage = (messageId: string) => {
    retryClientMessage(thread.id, messageId);
  };

  const formatMsgTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    }) + ' ' + date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <section className="bg-[var(--color-surface-bg)] border border-[var(--color-border-custom)] rounded-lg p-5 flex flex-col h-[550px]" aria-label="Contextual message thread panel">
      {/* Thread Header */}
      <div className="space-y-2 border-b border-[var(--color-border-custom)] pb-4 flex-shrink-0">
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={onBackToRequest}
            className="inline-flex items-center gap-1 text-[10px] font-bold text-[var(--color-primary-emphasis-text)] hover:underline cursor-pointer"
          >
            <ArrowLeft className="h-3 w-3" />
            Back to Document Request
          </button>
          
          <span className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[9px] font-bold ${
            thread.visibility === 'FIRM_INTERNAL'
              ? 'bg-rose-500/10 text-rose-300 border border-rose-500/20'
              : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
          }`}>
            {thread.visibility === 'FIRM_INTERNAL' ? (
              <>
                <Shield className="h-2.5 w-2.5" />
                Firm Internal
              </>
            ) : (
              <>
                <Eye className="h-2.5 w-2.5" />
                Client Visible
              </>
            )}
          </span>
        </div>

        <h3 className="text-sm font-bold text-[var(--color-text-primary)] tracking-tight">
          Subject: {thread.subject}
        </h3>
        <p className="text-[10px] text-[var(--color-text-secondary)]">
          Participants: {thread.participants.join(', ')}
        </p>
      </div>

      {/* Message History list */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4 min-h-0" role="region" aria-label="Message history log">
        {thread.messages.length === 0 ? (
          <div className="text-xs text-[var(--color-text-secondary)] italic text-center py-8">
            No messages in this thread.
          </div>
        ) : (
          thread.messages
            .filter((m) => !isClientRole || m.visibility === 'CLIENT_VISIBLE')
            .map((msg) => {
              const isMe = isClientRole ? msg.authorRole === 'client' : msg.authorRole !== 'client';
              const isFailed = msg.deliveryState === 'FAILED';

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col max-w-[85%] rounded-lg p-3 space-y-1.5 text-xs ${
                    isMe
                      ? 'ml-auto bg-[var(--color-primary-action)]/10 text-[var(--color-text-primary)] border border-[var(--color-primary-action)]/20'
                      : 'mr-auto bg-[var(--color-surface-elevated-bg)]/40 text-[var(--color-text-primary)] border border-[var(--color-border-custom)]/40'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4 text-[10px] font-bold text-[var(--color-text-secondary)]">
                    <span>
                      {msg.authorName} <span className="font-normal opacity-85">({msg.authorRole})</span>
                    </span>
                    <span>{formatMsgTime(msg.createdAt)}</span>
                  </div>
                  <p className="leading-relaxed break-words">{msg.body}</p>
                  
                  {isFailed && (
                    <div className="flex items-center justify-between gap-3 bg-rose-500/10 border border-rose-500/20 text-rose-300 p-1.5 rounded mt-1">
                      <span className="flex items-center gap-1 text-[9px] font-bold">
                        <AlertCircle className="h-3 w-3 text-rose-400" />
                        Message failed to send.
                      </span>
                      <button
                        onClick={() => handleRetryMessage(msg.id)}
                        className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-rose-500/20 hover:bg-rose-500/35 text-[9px] font-bold rounded text-rose-200 transition-colors cursor-pointer"
                        aria-label="Retry sending message"
                      >
                        <RefreshCw className="h-2.5 w-2.5" />
                        Retry
                      </button>
                    </div>
                  )}
                </div>
              );
            })
        )}
      </div>

      {/* Message Composer Form */}
      <form onSubmit={handleSendMessage} className="space-y-2 border-t border-[var(--color-border-custom)] pt-3 flex-shrink-0">
        <div className="space-y-1">
          <label htmlFor="message-draft-composer" className="sr-only">
            Write a message to your preparer
          </label>
          <textarea
            ref={composerRef}
            id="message-draft-composer"
            rows={2}
            value={state.messageDraft}
            onChange={handleTextareaChange}
            placeholder="Type a message to discuss this request..."
            maxLength={250}
            className="w-full rounded-md border border-[var(--color-border-custom)] bg-[var(--color-surface-bg)] p-2.5 text-xs text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary-action)] focus:border-[var(--color-primary-action)] resize-none"
            aria-describedby={composerError ? "composer-input-error" : undefined}
          />
        </div>

        <div className="flex items-center justify-between gap-4">
          <span className="text-[10px] text-[var(--color-text-secondary)]">
            {state.messageDraft.length} / 250 characters
          </span>
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 rounded bg-[var(--color-primary-action)] px-4.5 py-2 text-xs font-bold text-white hover:bg-[var(--color-primary-action)]/80 transition-colors cursor-pointer"
          >
            <Send className="h-3.5 w-3.5" aria-hidden="true" />
            Send Message
          </button>
        </div>

        {composerError && (
          <p id="composer-input-error" className="text-[10px] text-rose-400 flex items-center gap-1 mt-1" role="alert">
            <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
            {composerError}
          </p>
        )}
      </form>
    </section>
  );
};
export default ContextualThread;
