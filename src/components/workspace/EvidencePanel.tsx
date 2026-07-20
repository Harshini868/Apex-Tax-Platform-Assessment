import React, { useState } from 'react';
import type { TaxField } from '../../domain/return';
import type { SourceDocument } from '../../domain/document';
import type { AIAnalysis } from '../../domain/ai';
import type { TraceRecord } from '../../domain/traceability';
import { MockDocumentPreview } from './MockDocumentPreview';
import {
  FileText,
  AlertTriangle,
  TrendingUp,
  Brain,
  FileMinus,
  Sparkles,
} from 'lucide-react';

interface EvidencePanelProps {
  field: TaxField;
  document: SourceDocument | null;
  aiAnalysis: AIAnalysis | null;
  traceRecord: TraceRecord | null;
  allDocuments: SourceDocument[];
}

export const EvidencePanel: React.FC<EvidencePanelProps> = ({
  field,
  document,
  aiAnalysis,
  traceRecord,
  allDocuments,
}) => {
  const [activeTab, setActiveTab] = useState<'source' | 'ai'>('source');

  const isMissing = field.verificationState === 'MISSING_EVIDENCE';

  // All evidence documents referenced by the AI analysis for this field, resolved from real
  // records — data-driven through evidenceIds, not a hardcoded branch per return/field. Works for
  // any field with 1 or more evidence sources (John Miller's single-source W-2 trace included).
  // De-duplicated (Array.from(new Set(...))) while preserving the fixture's declared, deterministic
  // order; IDs that don't resolve to a real document are silently dropped and counted below.
  const evidenceDocuments: SourceDocument[] = aiAnalysis
    ? Array.from(new Set(aiAnalysis.evidenceIds))
        .map((id) => allDocuments.find((d) => d.id === id))
        .filter((d): d is SourceDocument => !!d)
    : [];
  const unresolvedEvidenceCount = aiAnalysis ? aiAnalysis.evidenceIds.length - evidenceDocuments.length : 0;
  const hasMultipleSources = evidenceDocuments.length >= 2;

  // Render Missing Evidence view
  if (isMissing) {
    return (
      <div className="bg-[var(--color-surface-bg)] border border-[var(--color-border-custom)] rounded-lg p-6 space-y-4" aria-label="Missing evidence alert">
        <div className="flex items-center gap-3 text-zinc-400">
          <div className="h-10 w-10 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center">
            <FileMinus className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[var(--color-text-primary)]">Missing Source Evidence</h2>
            <p className="text-xs text-[var(--color-text-secondary)]">Required files unavailable</p>
          </div>
        </div>

        <div className="p-4 rounded-md border border-zinc-700 bg-zinc-950/40 text-xs space-y-2">
          <p className="text-[var(--color-text-secondary)]">
            The tax auditor requires a valid K-1 schedule to prepare this line item. No matching document has been uploaded.
          </p>
          <div className="border-t border-zinc-800 pt-2 font-mono text-[var(--color-text-primary)]">
            <strong>Expected File:</strong> K1_John_Miller_Partnership.pdf
          </div>
        </div>

        <div className="rounded-md border border-amber-500/20 bg-amber-950/10 p-3 flex gap-2 text-xs text-amber-200">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          <span>Verification is disabled. You must request this document from the client first.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--color-surface-bg)] border border-[var(--color-border-custom)] rounded-lg p-6 space-y-6">
      {/* Tabs */}
      <div className="flex border-b border-[var(--color-border-custom)]" role="tablist">
        <button
          role="tab"
          aria-selected={activeTab === 'source'}
          aria-controls="panel-source-content"
          onClick={() => setActiveTab('source')}
          className={`flex-1 pb-3 text-sm font-bold border-b-2 text-center transition-colors ${
            activeTab === 'source'
              ? 'border-[var(--color-primary-action-text)] text-[var(--color-primary-action-text)]'
              : 'border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
          }`}
        >
          <span className="flex items-center justify-center gap-2">
            <FileText className="h-4 w-4" />
            Source Document Trace
          </span>
        </button>
        <button
          role="tab"
          aria-selected={activeTab === 'ai'}
          aria-controls="panel-ai-content"
          onClick={() => setActiveTab('ai')}
          className={`flex-1 pb-3 text-sm font-bold border-b-2 text-center transition-colors ${
            activeTab === 'ai'
              ? 'border-[var(--color-primary-action-text)] text-[var(--color-primary-action-text)]'
              : 'border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
          }`}
        >
          <span className="flex items-center justify-center gap-2">
            <Brain className="h-4 w-4" />
            AI Reasoning & Confidence
          </span>
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'source' ? (
        <div id="panel-source-content" role="tabpanel" className="space-y-6">
          {hasMultipleSources ? (
            <div className="space-y-4">
              <p className="text-xs text-[var(--color-text-secondary)]" aria-label="Multiple evidence sources notice">
                {evidenceDocuments.length} independent source documents were matched for this field. Review both before resolving.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {evidenceDocuments.map((doc, idx) => {
                  const region = doc.pages[0]?.highlightedRegions[0] ?? null;
                  return (
                    <div
                      key={doc.id}
                      className="space-y-3 p-3 rounded-md border border-[var(--color-border-custom)] bg-[var(--color-surface-elevated-bg)]/10"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold uppercase text-[var(--color-text-secondary)]">
                          Source {idx + 1} of {evidenceDocuments.length}
                        </span>
                        {region && (
                          <span className="text-sm font-bold text-[var(--color-text-primary)] font-mono">
                            ${region.extractedText}
                          </span>
                        )}
                      </div>
                      <div className="text-xs">
                        <span className="font-semibold text-[var(--color-text-primary)] block">{doc.fileName}</span>
                        <span className="text-[var(--color-text-secondary)]">
                          {doc.documentType} — Page {doc.pages[0]?.pageNumber ?? 1}
                          {region ? ` · ${region.label}` : ''}
                        </span>
                      </div>
                      <MockDocumentPreview document={doc} highlightedRegionId={region?.id ?? null} />
                    </div>
                  );
                })}
              </div>
              {unresolvedEvidenceCount > 0 && (
                <p className="text-xs text-amber-300 bg-amber-950/10 border border-amber-500/20 rounded-md p-2" role="alert">
                  {unresolvedEvidenceCount} referenced evidence source{unresolvedEvidenceCount > 1 ? 's were' : ' was'} not found.
                </p>
              )}
            </div>
          ) : document && traceRecord ? (
            <>
              <div className="p-4 rounded-md border border-[var(--color-border-custom)] bg-[var(--color-surface-elevated-bg)]/20 space-y-3">
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-[var(--color-text-secondary)] block">Document Type</span>
                    <span className="text-[var(--color-text-primary)] font-semibold">{document.documentType}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-[var(--color-text-secondary)] block">Target Box</span>
                    <span className="text-[var(--color-text-primary)] font-semibold">{traceRecord.sectionLabel} Section</span>
                  </div>
                </div>
              </div>

              {/* Styled Mock Document Preview */}
              <MockDocumentPreview
                document={document}
                highlightedRegionId={traceRecord.highlightedRegionId}
              />

              {/* Transformation Formula Details */}
              <div className="space-y-3 border-t border-[var(--color-border-custom)] pt-6">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
                  <TrendingUp className="h-4 w-4" aria-hidden="true" />
                  <span>Calculation & Mapping Rules</span>
                </div>
                <div className="p-4 rounded-md border border-[var(--color-border-custom)] bg-[var(--color-surface-elevated-bg)]/40 space-y-3 text-xs">
                  <div>
                    <span className="font-semibold text-[var(--color-text-primary)]">Transformation formula:</span>
                    <code className="block mt-1 bg-[var(--color-surface-bg)] border border-[var(--color-border-custom)] p-2 rounded text-[var(--color-primary-emphasis-text)] font-mono">
                      {traceRecord.transformation.formula}
                    </code>
                  </div>
                  <div className="space-y-2">
                    <span className="font-semibold text-[var(--color-text-primary)]">Sequence details:</span>
                    <ol className="list-decimal pl-4 space-y-1.5 text-[var(--color-text-secondary)]">
                      {traceRecord.transformation.steps.map((step, idx) => (
                        <li key={idx}>
                          {step.description}{' '}
                          {step.value && (
                            <span className="text-[var(--color-text-primary)] font-semibold font-mono">
                              ({step.value})
                            </span>
                          )}
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-xs text-[var(--color-text-secondary)]">
              No source document linked to this field.
            </div>
          )}
        </div>
      ) : (
        <div id="panel-ai-content" role="tabpanel" className="space-y-6">
          {aiAnalysis ? (
            <div className="space-y-4">
              {/* Confidence Meter */}
              <div className="flex items-center justify-between p-4 rounded-md border border-[var(--color-border-custom)] bg-[var(--color-surface-elevated-bg)]/20">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-400" aria-hidden="true" />
                  <span className="text-sm font-semibold text-[var(--color-text-primary)]">
                    Confidence Status:
                  </span>
                </div>
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full border ${
                    aiAnalysis.confidenceState === 'HIGH'
                      ? 'bg-emerald-950/45 border-emerald-500/30 text-emerald-200'
                      : 'bg-amber-950/45 border-amber-500/30 text-amber-200'
                  }`}
                >
                  {aiAnalysis.confidenceLabel}
                </span>
              </div>

              {/* Explanations */}
              <div className="space-y-3 text-xs">
                <div>
                  <span className="font-bold text-[var(--color-text-primary)] block mb-1">Extraction Rationale</span>
                  <p className="text-[var(--color-text-secondary)] bg-[var(--color-surface-elevated-bg)]/40 p-3 rounded-md border border-[var(--color-border-custom)]/40">
                    {aiAnalysis.confidenceExplanation}
                  </p>
                </div>

                {aiAnalysis.uncertaintyReason && (
                  <div>
                    <span className="font-bold text-[var(--color-text-primary)] block mb-1">Uncertainty & Risk Flags</span>
                    <p className="text-[var(--color-text-secondary)] bg-amber-950/10 p-3 rounded-md border border-amber-500/20 text-amber-200">
                      {aiAnalysis.uncertaintyReason}
                    </p>
                  </div>
                )}

                <div>
                  <span className="font-bold text-[var(--color-text-primary)] block mb-1">Recommended audit action</span>
                  <p className="text-[var(--color-text-secondary)]">
                    {aiAnalysis.suggestedNextAction}
                  </p>
                </div>
              </div>

              {/* Disclosure */}
              <div className="text-[10px] text-[var(--color-text-secondary)] bg-[var(--color-surface-elevated-bg)]/40 p-3 rounded-md border border-[var(--color-border-custom)] border-dashed">
                <strong>Simulated Data Disclosure:</strong> {aiAnalysis.simulatedDisclosure}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-xs text-[var(--color-text-secondary)]">
              No AI evaluation metadata logs for this field.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
export default EvidencePanel;
