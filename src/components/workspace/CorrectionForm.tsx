import React, { useState, useEffect, useRef } from 'react';
import { AlertCircle, Save, X } from 'lucide-react';

interface CorrectionFormProps {
  originalValue: string;
  initialValue: string;
  onSave: (value: string, reason: string, evidenceReviewed?: boolean) => void;
  onCancel: () => void;
  requireEvidenceAcknowledgement?: boolean;
}

export const CorrectionForm: React.FC<CorrectionFormProps> = ({
  originalValue,
  initialValue,
  onSave,
  onCancel,
  requireEvidenceAcknowledgement = false,
}) => {
  const [value, setValue] = useState(initialValue);
  const [reason, setReason] = useState('');
  const [evidenceReviewed, setEvidenceReviewed] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const evidenceCheckboxRef = useRef<HTMLInputElement>(null);

  // Focus the input field on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Reset error
    setValidationError(null);

    // Validation 1: Check if value is valid numeric
    const parsed = parseFloat(value);
    if (isNaN(parsed) || parsed < 0) {
      setValidationError('Please enter a valid positive number value.');
      inputRef.current?.focus();
      return;
    }

    // Validation 2: Check if reason is provided
    if (!reason.trim() || reason.trim().length < 5) {
      setValidationError('Please specify a valid correction reason (at least 5 characters).');
      return;
    }

    // Validation 3 (reviewer correction only): evidence must be explicitly acknowledged
    if (requireEvidenceAcknowledgement && !evidenceReviewed) {
      setValidationError('Please confirm you have reviewed the source evidence before saving.');
      evidenceCheckboxRef.current?.focus();
      return;
    }

    onSave(value, reason, requireEvidenceAcknowledgement ? evidenceReviewed : undefined);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 p-4 rounded-md border border-amber-500/30 bg-amber-950/20"
      aria-label="Correction override form"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-amber-200">Correction Override Mode</h3>
        <span className="text-xs text-[var(--color-text-secondary)]">
          Original AI Value: <span className="font-semibold text-[var(--color-text-primary)]">{originalValue}</span>
        </span>
      </div>

      {/* Validation Error Alert */}
      {validationError && (
        <div
          id="correction-form-error"
          role="alert"
          className="flex items-center gap-2 rounded bg-rose-950/45 border border-rose-500/30 p-2 text-xs text-rose-200"
        >
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="correction-value" className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">
            New Tax Value ($ USD)
          </label>
          <input
            id="correction-value"
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            aria-invalid={validationError ? true : undefined}
            aria-describedby={validationError ? 'correction-form-error' : undefined}
            className="w-full bg-[var(--color-surface-bg)] border border-[var(--color-border-custom)] rounded-md px-3 py-1.5 text-sm text-[var(--color-text-primary)] focus:border-[var(--color-focus-indicator)] font-mono"
            placeholder="e.g. 152500.00"
          />
        </div>

        <div>
          <label htmlFor="correction-reason" className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">
            Reason for Override
          </label>
          <input
            id="correction-reason"
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            aria-invalid={validationError ? true : undefined}
            aria-describedby={validationError ? 'correction-form-error' : undefined}
            className="w-full bg-[var(--color-surface-bg)] border border-[var(--color-border-custom)] rounded-md px-3 py-1.5 text-sm text-[var(--color-text-primary)] focus:border-[var(--color-focus-indicator)]"
            placeholder="e.g. Scan digit read mismatch box 1"
          />
        </div>
      </div>

      {requireEvidenceAcknowledgement && (
        <div className="flex items-start gap-2">
          <input
            id="correction-evidence-reviewed"
            ref={evidenceCheckboxRef}
            type="checkbox"
            checked={evidenceReviewed}
            onChange={(e) => setEvidenceReviewed(e.target.checked)}
            aria-invalid={validationError ? true : undefined}
            aria-describedby={validationError ? 'correction-form-error' : undefined}
            className="mt-0.5 h-4 w-4 accent-[var(--color-primary-action)]"
          />
          <label htmlFor="correction-evidence-reviewed" className="text-xs text-[var(--color-text-secondary)]">
            I have reviewed the source evidence for this value.
          </label>
        </div>
      )}

      <div className="flex justify-end gap-2 border-t border-[var(--color-border-custom)]/30 pt-3">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-[var(--color-surface-elevated-bg)] border border-[var(--color-border-custom)] text-xs font-semibold hover:bg-[var(--color-border-custom)]"
        >
          <X className="h-3.5 w-3.5" aria-hidden="true" />
          Cancel
        </button>
        <button
          type="submit"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-[var(--color-primary-action)] text-white text-xs font-semibold hover:bg-[var(--color-primary-action)]/80"
        >
          <Save className="h-3.5 w-3.5" aria-hidden="true" />
          Save Overwrite
        </button>
      </div>
    </form>
  );
};
export default CorrectionForm;
