import React, { useRef, useState } from 'react';
import { useApp } from '../../context/AppContext';
import type { DocumentRequest, RequestedFileMetadata } from '../../domain/request';
import type { QuestionnaireItem } from '../../domain/collaboration';
import { FileUp, File, Trash2, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

interface DocumentRequestPanelProps {
  request: DocumentRequest;
  question: QuestionnaireItem | null;
  onNavigateToThread: (threadId: string) => void;
}

export const DocumentRequestPanel: React.FC<DocumentRequestPanelProps> = ({
  request,
  question,
  onNavigateToThread,
}) => {
  const {
    state,
    stageRequestFile,
    clearStagedFile,
    answerQuestion,
    submitRequest,
  } = useApp();

  const stagedFile = state.stagedFileMetadata[request.id];
  const isSubmitted = request.status === 'SUBMITTED' || request.status === 'APPROVED';

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cryptoFieldsetRef = useRef<HTMLFieldSetElement>(null);
  
  const [fileError, setFileError] = useState<string | null>(null);
  const [questionError, setQuestionError] = useState<string | null>(null);
  const [isSubmitError, setIsSubmitError] = useState(false);

  // Supported validation settings
  const ALLOWED_MIMES = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
  const ALLOWED_EXTS = ['.pdf', '.png', '.jpg', '.jpeg'];
  const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    setIsSubmitError(false);
    
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // Validate type: trust the browser-detected MIME type when present (an extension alone is
    // spoofable — e.g. a renamed .exe with a ".pdf" filename must not pass just because the name
    // looks right). Only fall back to the extension when the browser reports no MIME type at all.
    const fileExt = '.' + file.name.split('.').pop()?.toLowerCase();
    const mimeIsAllowed = ALLOWED_MIMES.includes(file.type);
    const mimeIsBlank = file.type === '';
    const isValidType = mimeIsAllowed || (mimeIsBlank && ALLOWED_EXTS.includes(fileExt));
    if (!isValidType) {
      setFileError(`Unsupported file type. Please upload one of: ${ALLOWED_EXTS.join(', ')}.`);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // Validate size
    if (file.size > MAX_SIZE_BYTES) {
      setFileError('File size exceeds the 10 MB limit for this prototype.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // Stage metadata
    const metadata: RequestedFileMetadata = {
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type || 'application/octet-stream',
      selectedAt: new Date().toISOString(),
      simulated: true,
      storageDisclosure: 'Prototype simulation: The selected file is not uploaded or stored. Only its filename, size and type are used in this demonstration.',
    };

    stageRequestFile(request.id, metadata);
  };

  const handleRemoveFile = () => {
    setFileError(null);
    setIsSubmitError(false);
    clearStagedFile(request.id);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRadioChange = (val: string) => {
    setQuestionError(null);
    setIsSubmitError(false);
    if (question) {
      answerQuestion(question.id, val);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFileError(null);
    setQuestionError(null);
    setIsSubmitError(false);

    let hasValidationError = false;

    // Validate W-2 File selection
    const activeFile = stagedFile || request.receivedFileMetadata;
    if (!activeFile) {
      setFileError('Please select a file to upload before submitting.');
      hasValidationError = true;
    }

    // Validate questionnaire answer
    if (question && question.required && !question.answer) {
      setQuestionError('Please select an answer for this required question.');
      hasValidationError = true;
    }

    if (hasValidationError) {
      // Focus the first invalid control
      if (!activeFile) {
        fileInputRef.current?.focus();
      } else if (question && question.required && !question.answer) {
        const firstRadio = cryptoFieldsetRef.current?.querySelector('input[type="radio"]') as HTMLInputElement;
        firstRadio?.focus();
      }
      return;
    }

    // Call submit
    submitRequest(request.id);

    // If simulated fail is enabled, trigger submit error state
    if (state.simulatedSubmitFail) {
      setIsSubmitError(true);
    }
  };

  // Human readable file size formatter
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const activeMetadata = stagedFile || request.receivedFileMetadata;

  return (
    <div className="bg-[var(--color-surface-bg)] border border-[var(--color-border-custom)] rounded-lg p-6 space-y-6" aria-label="Document request details panel">
      {/* Title & Metadata */}
      <div className="space-y-2 border-b border-[var(--color-border-custom)] pb-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold border ${
            isSubmitted
              ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
              : request.status === 'NEEDS_REPLACEMENT'
              ? 'bg-rose-500/10 text-rose-300 border-rose-500/20'
              : 'bg-amber-500/10 text-amber-300 border-amber-500/20'
          }`}>
            {request.status.replace('_', ' ')}
          </span>
          <span className="text-[10px] text-[var(--color-text-secondary)] font-medium">
            Requested by: <strong className="text-[var(--color-text-primary)]">{request.requestedBy}</strong>
          </span>
        </div>
        <h2 className="text-xl font-bold tracking-tight text-[var(--color-text-primary)]">
          {request.title}
        </h2>
        <p className="text-xs text-[var(--color-text-secondary)]">
          {request.description}
        </p>

        {/* Needs Replacement Feedback Banner */}
        {request.status === 'NEEDS_REPLACEMENT' && request.reviewOutcome && (
          <div className="flex items-start gap-2 bg-rose-500/10 border border-rose-500/20 text-rose-200 p-3 rounded text-xs mt-2" role="alert">
            <AlertTriangle className="h-4 w-4 text-rose-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <strong>Action Required (Reviewer Feedback):</strong> {request.reviewOutcome}
            </div>
          </div>
        )}
      </div>

      {/* Submission Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* A. Simulated File Selection */}
        <div className="space-y-2">
          <label id="file-picker-label" className="block text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
            Simulated Document Upload
          </label>
          <span className="block text-[10px] text-[var(--color-text-secondary)]">
            Accepted file formats: <strong>PDF, PNG, JPG</strong>. Max file size: <strong>10 MB</strong>.
          </span>

          {!activeMetadata ? (
            <div className="border-2 border-dashed border-[var(--color-border-custom)] rounded-lg p-6 text-center hover:bg-[var(--color-surface-elevated-bg)]/20 transition-colors">
              <FileUp className="h-8 w-8 text-[var(--color-text-secondary)] mx-auto mb-2" aria-hidden="true" />
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center rounded border border-[var(--color-border-custom)] bg-[var(--color-surface-bg)] px-3 py-1.5 text-xs font-semibold text-[var(--color-text-primary)] hover:bg-[var(--color-surface-elevated-bg)] transition-colors cursor-pointer"
                >
                  Select File
                </button>
                <input
                  ref={fileInputRef}
                  id="simulated-file-input"
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={handleFileChange}
                  className="sr-only"
                  aria-labelledby="file-picker-label"
                  aria-describedby={fileError ? "file-input-error" : undefined}
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between p-3 rounded border border-[var(--color-border-custom)] bg-[var(--color-surface-elevated-bg)]/30">
              <div className="flex items-center gap-3">
                <File className="h-8 w-8 text-[var(--color-primary-action)]" />
                <div className="text-xs">
                  <span className="block font-semibold text-[var(--color-text-primary)] truncate max-w-[200px]">
                    {activeMetadata.fileName}
                  </span>
                  <span className="block text-[10px] text-[var(--color-text-secondary)]">
                    {formatBytes(activeMetadata.fileSize)} • {activeMetadata.mimeType}
                  </span>
                </div>
              </div>
              {!isSubmitted && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-1.5 rounded hover:bg-[var(--color-surface-elevated-bg)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] cursor-pointer"
                    aria-label="Replace W-2 file"
                  >
                    <FileUp className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="p-1.5 rounded hover:bg-rose-500/10 text-rose-400 cursor-pointer"
                    aria-label="Remove W-2 file"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={handleFileChange}
                    className="sr-only"
                  />
                </div>
              )}
            </div>
          )}

          {/* Staged File Validation Error */}
          {fileError && (
            <p id="file-input-error" className="text-xs text-rose-400 flex items-center gap-1.5 mt-1" role="alert">
              <AlertTriangle className="h-4 w-4 flex-shrink-0" />
              {fileError}
            </p>
          )}

          {/* Simulated storage disclosure */}
          <span className="block text-[9px] text-[var(--color-text-secondary)] italic leading-relaxed">
            Prototype simulation: The selected file is not uploaded or stored. Only its filename, size and type are used in this demonstration.
          </span>
        </div>

        {/* B. Linked Tax Question Form */}
        {question && (
          <div className="space-y-2 border-t border-[var(--color-border-custom)] pt-4">
            <fieldset
              ref={cryptoFieldsetRef}
              disabled={isSubmitted}
              className="border-0 p-0 m-0 space-y-3"
              aria-describedby={questionError ? "question-input-error" : undefined}
            >
              <legend className="block text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)] mb-1">
                Linked Tax Questionnaire Item {question.required && <span className="text-amber-400">*</span>}
              </legend>
              <p className="text-xs font-bold text-[var(--color-text-primary)] leading-normal">
                {question.prompt}
              </p>
              {question.helperText && (
                <p className="text-[10px] text-[var(--color-text-secondary)] leading-relaxed bg-[var(--color-surface-elevated-bg)]/20 p-2 rounded border border-[var(--color-border-custom)]/40">
                  {question.helperText}
                </p>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                {question.options?.map((opt) => {
                  const isChecked = question.answer === opt;
                  return (
                    <label
                      key={opt}
                      className={`flex items-center gap-2.5 p-3 rounded border text-xs font-semibold cursor-pointer transition-colors ${
                        isChecked
                          ? 'bg-[var(--color-primary-action)]/10 border-[var(--color-primary-action)] text-[var(--color-text-primary)]'
                          : isSubmitted
                          ? 'bg-[var(--color-surface-elevated-bg)]/20 border-[var(--color-border-custom)]/30 text-[var(--color-text-secondary)] cursor-not-allowed'
                          : 'border-[var(--color-border-custom)] bg-transparent text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-elevated-bg)] hover:text-[var(--color-text-primary)]'
                      }`}
                    >
                      <input
                        type="radio"
                        name={question.id}
                        value={opt}
                        checked={isChecked}
                        disabled={isSubmitted}
                        onChange={() => handleRadioChange(opt)}
                        className="h-4 w-4 border-[var(--color-border-custom)] text-[var(--color-primary-action)] focus:ring-[var(--color-primary-action)] accent-[var(--color-primary-action)] cursor-pointer"
                      />
                      {opt}
                    </label>
                  );
                })}
              </div>
            </fieldset>

            {/* Answer Validation Error */}
            {questionError && (
              <p id="question-input-error" className="text-xs text-rose-400 flex items-center gap-1.5 mt-1" role="alert">
                <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                {questionError}
              </p>
            )}
          </div>
        )}

        {/* C. Submission Actions / Confirmation Panel */}
        <div className="border-t border-[var(--color-border-custom)] pt-5 space-y-4">
          {isSubmitted ? (
            <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-4 space-y-3" role="status" aria-live="polite">
              <div className="flex items-start gap-3 text-xs text-emerald-200">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0" aria-hidden="true" />
                <div className="space-y-1">
                  <span className="font-bold block">
                    Submitted to David Chen. Your preparer owns the next action.
                  </span>
                  <p className="text-[10px] text-emerald-300">
                    Submission simulated in this prototype. Files have been logged in mock state.
                  </p>
                </div>
              </div>
              {request.linkedThreadId && (
                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => onNavigateToThread(request.linkedThreadId!)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 hover:text-emerald-300 cursor-pointer"
                  >
                    View messaging thread
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Submission Summary Preview */}
              <div className="bg-[var(--color-surface-elevated-bg)]/20 p-4 rounded-md border border-[var(--color-border-custom)] text-xs space-y-3">
                <h4 className="font-bold uppercase text-[var(--color-text-secondary)] tracking-wider">
                  Submission Preview Summary
                </h4>
                <ul className="space-y-2 list-none p-0 m-0">
                  <li className="flex justify-between">
                    <span className="text-[var(--color-text-secondary)]">Staged Document:</span>
                    <span className="font-semibold text-[var(--color-text-primary)] truncate max-w-[180px]">
                      {activeMetadata ? activeMetadata.fileName : 'None selected'}
                    </span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-[var(--color-text-secondary)]">Crypto Answer:</span>
                    <span className="font-semibold text-[var(--color-text-primary)]">
                      {question?.answer || 'Unanswered'}
                    </span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-[var(--color-text-secondary)]">Target Reviewer:</span>
                    <span className="font-semibold text-[var(--color-text-primary)]">
                      David Chen (CPA)
                    </span>
                  </li>
                </ul>
              </div>

              {/* Submit Error */}
              {isSubmitError && (
                <div className="flex items-start gap-2 bg-rose-500/10 border border-rose-500/20 text-rose-200 p-3 rounded text-xs" role="alert">
                  <AlertTriangle className="h-4 w-4 text-rose-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <strong>Simulation Error:</strong> Document transmission failed. Please retry submission.
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3">
                {request.linkedThreadId && (
                  <button
                    type="button"
                    onClick={() => onNavigateToThread(request.linkedThreadId!)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 border border-[var(--color-border-custom)] text-xs font-bold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] rounded-md transition-colors cursor-pointer"
                  >
                    Ask preparer a question
                  </button>
                )}
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-md bg-[var(--color-primary-action)] px-5 py-2 text-xs font-extrabold text-white shadow-sm hover:bg-[var(--color-primary-action)]/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 transition-colors cursor-pointer"
                >
                  Submit to David
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </form>
    </div>
  );
};
export default DocumentRequestPanel;
