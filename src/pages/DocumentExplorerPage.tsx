import React, { useState, useMemo } from 'react';
import { useParams, useSearchParams, Link } from 'react-router';
import { scaleDataset } from '../mock/scaleDataset';
import { curatedRostovaReturn } from '../mock/curatedJourneyThree';
import type { GeneratedDocument } from '../domain/scale';
import {
  Search,
  ChevronRight,
  ChevronDown,
  ChevronLeft,
  FolderOpen,
  FileText,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  ArrowLeft,
  Tag,
  CheckSquare,
  MessageSquare,
  ExternalLink,
} from 'lucide-react';

const DOC_PAGE_SIZE = 25;

type Category = 'income' | 'deductions' | 'compliance' | 'credits' | 'other' | 'all';
type ReviewStatus = 'reviewed' | 'unreviewed' | 'all';
type EvidenceState = 'complete' | 'uncertain' | 'conflict' | 'missing' | 'all';

const CATEGORY_LABELS: Record<string, string> = {
  income: 'Income Documents',
  deductions: 'Deductions',
  compliance: 'Compliance & Reporting',
  credits: 'Tax Credits',
  other: 'Other Documents',
};

const EvidenceBadge: React.FC<{ state: string }> = ({ state }) => {
  if (state === 'complete') return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded border bg-emerald-950/40 text-emerald-300 border-emerald-500/30">
      <CheckCircle2 className="h-3 w-3" aria-hidden="true" /> Complete
    </span>
  );
  if (state === 'conflict') return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded border bg-rose-950/40 text-rose-300 border-rose-500/30">
      <XCircle className="h-3 w-3" aria-hidden="true" /> Conflict
    </span>
  );
  if (state === 'uncertain') return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded border bg-amber-950/20 text-amber-300 border-amber-500/20">
      <HelpCircle className="h-3 w-3" aria-hidden="true" /> Uncertain
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded border bg-zinc-950/40 text-zinc-400 border-zinc-700/30">
      <AlertTriangle className="h-3 w-3" aria-hidden="true" /> Missing
    </span>
  );
};

const ReviewBadge: React.FC<{ status: string }> = ({ status }) => {
  if (status === 'reviewed') return (
    <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded border bg-sky-950/30 text-sky-300 border-sky-500/20">
      <CheckCircle2 className="h-3 w-3" aria-hidden="true" /> Reviewed
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded border bg-zinc-950/30 text-zinc-400 border-zinc-700/30">
      <HelpCircle className="h-3 w-3" aria-hidden="true" /> Unreviewed
    </span>
  );
};

export const DocumentExplorerPage: React.FC = () => {
  const { returnId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  // URL state
  const rawCategory = (searchParams.get('category') || 'all') as Category;
  const category: Category = ['income', 'deductions', 'compliance', 'credits', 'other', 'all'].includes(rawCategory) ? rawCategory : 'all';
  const rawReviewStatus = (searchParams.get('reviewStatus') || 'all') as ReviewStatus;
  const reviewStatus: ReviewStatus = ['reviewed', 'unreviewed', 'all'].includes(rawReviewStatus) ? rawReviewStatus : 'all';
  const rawEvidence = (searchParams.get('evidence') || 'all') as EvidenceState;
  const evidenceFilter: EvidenceState = ['complete', 'uncertain', 'conflict', 'missing', 'all'].includes(rawEvidence) ? rawEvidence : 'all';
  const docType = searchParams.get('docType') || 'all';
  const docSearch = searchParams.get('search') || '';
  const selectedDocId = searchParams.get('document') || '';
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);

  // Expanded group state (local, not URL-backed — per spec)
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['income']));

  // Fetch all documents for this return from scale dataset
  const returnDocuments = useMemo(() =>
    scaleDataset.documents.filter((d) => d.returnId === returnId),
    [returnId]
  );

  // Resolve a return ID to its display name/type — data-driven, not hardcoded to Rostova, so the
  // explorer shows correct orientation for any generated return that also has linked documents.
  const resolveReturnLabel = (id: string | undefined) => {
    if (id === curatedRostovaReturn.id) {
      return { clientName: curatedRostovaReturn.clientName, returnType: curatedRostovaReturn.returnType, taxYear: curatedRostovaReturn.taxYear as number | null };
    }
    const generated = scaleDataset.returns.find((r) => r.returnId === id);
    if (generated) {
      return { clientName: generated.clientName, returnType: generated.returnType, taxYear: generated.taxYear as number | null };
    }
    return { clientName: id || 'Unknown return', returnType: '', taxYear: null as number | null };
  };
  const returnLabel = useMemo(() => resolveReturnLabel(returnId), [returnId]);

  // Distinct document types actually present for this return, in deterministic (sorted) order
  const availableDocTypes = useMemo(() =>
    Array.from(new Set(returnDocuments.map((d) => d.documentType))).sort(),
    [returnDocuments]
  );

  // Apply filters
  const filteredDocs = useMemo(() => {
    return returnDocuments.filter((doc) => {
      if (category !== 'all' && doc.category !== category) return false;
      if (reviewStatus !== 'all' && doc.reviewStatus !== reviewStatus) return false;
      if (evidenceFilter !== 'all' && doc.evidenceState !== evidenceFilter) return false;
      if (docType !== 'all' && doc.documentType !== docType) return false;
      if (docSearch.trim()) {
        const q = docSearch.toLowerCase();
        if (!doc.fileName.toLowerCase().includes(q) && !doc.documentType.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [returnDocuments, category, reviewStatus, evidenceFilter, docType, docSearch]);

  // Group by category
  const groupedDocs = useMemo(() => {
    const groups: Record<string, GeneratedDocument[]> = {};
    filteredDocs.forEach((doc) => {
      if (!groups[doc.category]) groups[doc.category] = [];
      groups[doc.category].push(doc);
    });
    return groups;
  }, [filteredDocs]);

  // Flattened list for pagination (preserves group order)
  const categoryOrder = ['income', 'deductions', 'compliance', 'credits', 'other'];
  const orderedDocs = useMemo(() => {
    return categoryOrder.flatMap((cat) => groupedDocs[cat] || []);
  }, [groupedDocs]);

  const totalPages = Math.max(1, Math.ceil(orderedDocs.length / DOC_PAGE_SIZE));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const pagedDocs = orderedDocs.slice((safePage - 1) * DOC_PAGE_SIZE, safePage * DOC_PAGE_SIZE);

  // Selected document
  const selectedDoc = selectedDocId ? scaleDataset.documents.find((d) => d.id === selectedDocId) : null;
  const selectedDocInResults = selectedDoc ? filteredDocs.some((d) => d.id === selectedDocId) : true;

  // Linked activities for selected doc
  const linkedTasks = useMemo(() =>
    selectedDoc ? scaleDataset.tasks.filter((t) => selectedDoc.linkedTaskIds.includes(t.id)) : [],
    [selectedDoc]
  );
  const linkedRequests = useMemo(() =>
    selectedDoc ? scaleDataset.requests.filter((r) => selectedDoc.linkedRequestIds.includes(r.id)) : [],
    [selectedDoc]
  );
  const linkedMessages = useMemo(() =>
    selectedDoc ? scaleDataset.messages.filter((m) => selectedDoc.linkedMessageIds.includes(m.id)) : [],
    [selectedDoc]
  );

  // URL helpers
  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value && value !== 'all' && value !== '') params.set(key, value);
    else params.delete(key);
    if (key !== 'page' && key !== 'document') params.delete('page');
    setSearchParams(params);
  };

  const selectDocument = (docId: string) => {
    const params = new URLSearchParams(searchParams);
    if (docId) params.set('document', docId);
    else params.delete('document');
    setSearchParams(params);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    if (newPage === 1) params.delete('page');
    else params.set('page', String(newPage));
    setSearchParams(params);
  };

  const clearFilters = () => {
    const params = new URLSearchParams();
    if (selectedDocId) params.set('document', selectedDocId);
    setSearchParams(params);
  };

  const toggleGroup = (cat: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  const hasActiveFilters = category !== 'all' || reviewStatus !== 'all' || evidenceFilter !== 'all' || docType !== 'all' || docSearch.trim() !== '';

  // Auto-expand selected document's group
  useMemo(() => {
    if (selectedDoc) {
      setExpandedGroups((prev) => {
        if (prev.has(selectedDoc.category)) return prev;
        const next = new Set(prev);
        next.add(selectedDoc.category);
        return next;
      });
    }
  }, [selectedDoc?.id]);

  if (returnDocuments.length === 0) {
    return (
      <div className="p-8 text-center space-y-4" role="alert">
        <h1 className="text-xl font-bold">No documents found</h1>
        <p className="text-[var(--color-text-secondary)] text-sm">
          No documents are linked to return ID <code className="font-mono text-xs bg-zinc-900 px-1.5 py-0.5 rounded">{returnId}</code> in the scale dataset.
        </p>
        <Link to={`/return/${returnId}?dataset=scale`} className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-primary-emphasis-text)] hover:underline">
          <ArrowLeft className="h-4 w-4" />
          Back to return detail
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4 h-full">
      {/* Orientation Header */}
      <div className="border-b border-[var(--color-border-custom)] pb-4 space-y-1">
        <nav className="text-xs text-[var(--color-text-secondary)] flex items-center gap-1.5" aria-label="Breadcrumb">
          <Link to="/dashboard/reviewer?dataset=scale" className="hover:underline">Dashboard</Link>
          <ChevronRight className="h-3 w-3" aria-hidden="true" />
          <Link to={`/return/${returnId}?dataset=scale`} className="hover:underline">{returnLabel.clientName}</Link>
          <ChevronRight className="h-3 w-3" aria-hidden="true" />
          <span className="text-[var(--color-text-primary)] font-semibold">Documents</span>
        </nav>
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-[var(--color-text-primary)]">
              {returnLabel.clientName} — Documents
            </h1>
            <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
              {returnLabel.taxYear ? `${returnLabel.taxYear} ` : ''}{returnLabel.returnType} ·{' '}
              <strong className="text-[var(--color-text-primary)]">{returnDocuments.length}</strong> total linked documents ·{' '}
              <strong className="text-[var(--color-text-primary)]">{filteredDocs.length}</strong> matching filters
            </p>
          </div>
          <span className="text-[10px] text-amber-400 font-semibold bg-amber-950/20 border border-amber-500/20 px-2 py-0.5 rounded">
            Scale-test records are deterministically generated.
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-0">
        {/* Left column: Filters + Hierarchy */}
        <aside className="lg:col-span-3 space-y-4">
          {/* Filters */}
          <div className="bg-[var(--color-surface-bg)] border border-[var(--color-border-custom)] rounded-lg p-4 space-y-3">
            <h2 className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">Filters</h2>

            <div className="space-y-1.5">
              <label htmlFor="doc-search" className="block text-xs font-semibold text-[var(--color-text-secondary)]">Search documents</label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-zinc-400" aria-hidden="true" />
                <input
                  id="doc-search"
                  type="text"
                  value={docSearch}
                  onChange={(e) => updateParam('search', e.target.value)}
                  placeholder="Filename or type…"
                  className="w-full bg-[var(--color-surface-elevated-bg)] border border-[var(--color-border-custom)] rounded pl-8 pr-3 py-1.5 text-xs text-[var(--color-text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary-action)]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="doc-category" className="block text-xs font-semibold text-[var(--color-text-secondary)]">Category</label>
              <select
                id="doc-category"
                value={category}
                onChange={(e) => updateParam('category', e.target.value)}
                className="w-full bg-[var(--color-surface-elevated-bg)] border border-[var(--color-border-custom)] rounded px-2 py-1.5 text-xs text-[var(--color-text-primary)] cursor-pointer"
              >
                <option value="all">All categories</option>
                <option value="income">Income</option>
                <option value="deductions">Deductions</option>
                <option value="compliance">Compliance</option>
                <option value="credits">Credits</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="space-y-1">
              <label htmlFor="doc-review-status" className="block text-xs font-semibold text-[var(--color-text-secondary)]">Review status</label>
              <select
                id="doc-review-status"
                value={reviewStatus}
                onChange={(e) => updateParam('reviewStatus', e.target.value)}
                className="w-full bg-[var(--color-surface-elevated-bg)] border border-[var(--color-border-custom)] rounded px-2 py-1.5 text-xs text-[var(--color-text-primary)] cursor-pointer"
              >
                <option value="all">All review statuses</option>
                <option value="reviewed">Reviewed</option>
                <option value="unreviewed">Unreviewed</option>
              </select>
            </div>

            <div className="space-y-1">
              <label htmlFor="doc-evidence" className="block text-xs font-semibold text-[var(--color-text-secondary)]">Evidence state</label>
              <select
                id="doc-evidence"
                value={evidenceFilter}
                onChange={(e) => updateParam('evidence', e.target.value)}
                className="w-full bg-[var(--color-surface-elevated-bg)] border border-[var(--color-border-custom)] rounded px-2 py-1.5 text-xs text-[var(--color-text-primary)] cursor-pointer"
              >
                <option value="all">All evidence states</option>
                <option value="complete">Complete</option>
                <option value="uncertain">Uncertain</option>
                <option value="conflict">Conflict</option>
                <option value="missing">Missing</option>
              </select>
            </div>

            <div className="space-y-1">
              <label htmlFor="doc-type" className="block text-xs font-semibold text-[var(--color-text-secondary)]">Document type</label>
              <select
                id="doc-type"
                value={docType}
                onChange={(e) => updateParam('docType', e.target.value)}
                className="w-full bg-[var(--color-surface-elevated-bg)] border border-[var(--color-border-custom)] rounded px-2 py-1.5 text-xs text-[var(--color-text-primary)] cursor-pointer"
              >
                <option value="all">All document types</option>
                {availableDocTypes.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="w-full text-xs font-semibold text-[var(--color-primary-emphasis-text)] hover:underline py-1"
              >
                Clear all filters
              </button>
            )}
          </div>

          {/* Category hierarchy */}
          <div className="bg-[var(--color-surface-bg)] border border-[var(--color-border-custom)] rounded-lg overflow-hidden">
            <div className="p-3 border-b border-[var(--color-border-custom)]">
              <h2 className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider flex items-center gap-1.5">
                <FolderOpen className="h-3.5 w-3.5" aria-hidden="true" />
                Document Groups
              </h2>
            </div>
            <div className="divide-y divide-[var(--color-border-custom)]">
              {categoryOrder.map((cat) => {
                const count = (groupedDocs[cat] || []).length;
                const totalCatCount = returnDocuments.filter((d) => d.category === cat).length;
                const isExpanded = expandedGroups.has(cat);
                const hasSelected = selectedDoc?.category === cat;
                return (
                  <div key={cat}>
                    <button
                      onClick={() => toggleGroup(cat)}
                      aria-expanded={isExpanded}
                      className={`w-full flex items-center justify-between p-3 text-left hover:bg-[var(--color-surface-elevated-bg)]/30 transition-colors ${hasSelected ? 'bg-[var(--color-primary-action)]/5' : ''}`}
                    >
                      <span className={`text-xs font-semibold ${hasSelected ? 'text-[var(--color-primary-emphasis-text)]' : 'text-[var(--color-text-primary)]'}`}>
                        {CATEGORY_LABELS[cat]}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-[var(--color-text-secondary)]">{count}/{totalCatCount}</span>
                        {isExpanded ? <ChevronDown className="h-3 w-3" aria-hidden="true" /> : <ChevronRight className="h-3 w-3" aria-hidden="true" />}
                      </div>
                    </button>
                    {isExpanded && count === 0 && (
                      <div className="px-4 py-2 text-[10px] text-[var(--color-text-secondary)] italic">
                        No matches in this category
                      </div>
                    )}
                    {isExpanded && count > 0 && (
                      <ul className="bg-[var(--color-surface-elevated-bg)]/20 max-h-40 overflow-y-auto">
                        {(groupedDocs[cat] || []).slice(0, 10).map((doc) => (
                          <li key={doc.id}>
                            <button
                              onClick={() => selectDocument(doc.id)}
                              aria-current={selectedDocId === doc.id ? 'true' : undefined}
                              className={`w-full text-left px-4 py-1.5 text-[10px] truncate hover:bg-[var(--color-surface-elevated-bg)]/50 transition-colors ${selectedDocId === doc.id ? 'text-[var(--color-primary-emphasis-text)] font-bold bg-[var(--color-primary-action)]/10' : 'text-[var(--color-text-secondary)]'}`}
                            >
                              {selectedDocId === doc.id && <span className="mr-1">▶</span>}
                              {doc.fileName.length > 30 ? doc.fileName.slice(0, 30) + '…' : doc.fileName}
                            </button>
                          </li>
                        ))}
                        {(groupedDocs[cat] || []).length > 10 && (
                          <li className="px-4 py-1 text-[10px] text-[var(--color-text-secondary)] italic">
                            +{(groupedDocs[cat] || []).length - 10} more (use filters to narrow)
                          </li>
                        )}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Middle column: Paginated list */}
        <section className="lg:col-span-5 space-y-3" aria-label="Document list">
          {/* List header */}
          <div className="flex items-center justify-between text-xs text-[var(--color-text-secondary)]">
            <span>
              {filteredDocs.length === 0 ? 'No documents' : `${((safePage - 1) * DOC_PAGE_SIZE) + 1}–${Math.min(safePage * DOC_PAGE_SIZE, filteredDocs.length)} of ${filteredDocs.length}`}
            </span>
            {totalPages > 1 && (
              <nav aria-label="Document list pagination" className="flex items-center gap-1.5">
                <button
                  onClick={() => handlePageChange(safePage - 1)}
                  disabled={safePage <= 1}
                  aria-label="Previous page"
                  className="p-1 rounded border border-[var(--color-border-custom)] disabled:opacity-40 hover:bg-[var(--color-surface-elevated-bg)] transition-colors"
                >
                  <ChevronLeft className="h-3 w-3" aria-hidden="true" />
                </button>
                <span aria-live="polite" aria-atomic="true" className="font-mono text-[10px]">
                  {safePage}/{totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(safePage + 1)}
                  disabled={safePage >= totalPages}
                  aria-label="Next page"
                  className="p-1 rounded border border-[var(--color-border-custom)] disabled:opacity-40 hover:bg-[var(--color-surface-elevated-bg)] transition-colors"
                >
                  <ChevronRight className="h-3 w-3" aria-hidden="true" />
                </button>
              </nav>
            )}
          </div>

          {/* Empty state */}
          {filteredDocs.length === 0 ? (
            <div className="rounded-lg border border-[var(--color-border-custom)] bg-[var(--color-surface-bg)] p-8 text-center" role="alert">
              <FileText className="h-8 w-8 text-zinc-500 mx-auto mb-3" aria-hidden="true" />
              <p className="text-sm font-semibold text-[var(--color-text-primary)] mb-1">No documents match your filters</p>
              <p className="text-xs text-[var(--color-text-secondary)] mb-4">Try adjusting or clearing the active filters.</p>
              <button onClick={clearFilters} className="text-xs font-semibold text-[var(--color-primary-emphasis-text)] hover:underline">
                Clear filters
              </button>
            </div>
          ) : (
            <div className="rounded-lg border border-[var(--color-border-custom)] bg-[var(--color-surface-bg)] divide-y divide-[var(--color-border-custom)] overflow-hidden">
              {pagedDocs.map((doc) => {
                const isSelected = doc.id === selectedDocId;
                const activityCount = doc.linkedTaskIds.length + doc.linkedRequestIds.length + doc.linkedMessageIds.length;
                return (
                  <button
                    key={doc.id}
                    onClick={() => selectDocument(isSelected ? '' : doc.id)}
                    aria-current={isSelected ? 'true' : undefined}
                    className={`w-full text-left p-3 flex items-start gap-3 hover:bg-[var(--color-surface-elevated-bg)]/30 transition-colors ${isSelected ? 'bg-[var(--color-primary-action)]/8 border-l-2 border-[var(--color-primary-action)]' : ''}`}
                  >
                    <FileText className={`h-4 w-4 mt-0.5 flex-shrink-0 ${isSelected ? 'text-[var(--color-primary-emphasis-text)]' : 'text-zinc-500'}`} aria-hidden="true" />
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className={`text-xs font-semibold truncate ${isSelected ? 'text-[var(--color-primary-emphasis-text)]' : 'text-[var(--color-text-primary)]'}`}>
                        {isSelected && <span className="mr-1 text-[var(--color-primary-emphasis-text)]">●</span>}
                        {doc.fileName}
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] text-[var(--color-text-secondary)]">{doc.documentType} · {doc.pageCount}pp</span>
                        <ReviewBadge status={doc.reviewStatus} />
                        <EvidenceBadge state={doc.evidenceState} />
                        {activityCount > 0 && (
                          <span className="text-[10px] text-[var(--color-text-secondary)] bg-zinc-900 border border-zinc-800 px-1.5 rounded">
                            {activityCount} linked
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {/* Right column: Document detail */}
        <aside className="lg:col-span-4 space-y-3" aria-label="Document detail">
          {/* Selected doc filtered out */}
          {selectedDocId && !selectedDocInResults && selectedDoc && (
            <div className="p-4 rounded-lg border border-amber-500/30 bg-amber-950/10 text-xs space-y-2" role="alert">
              <p className="text-amber-300 font-semibold">Selected document is hidden by active filters</p>
              <p className="text-[var(--color-text-secondary)]">
                <strong className="text-[var(--color-text-primary)]">{selectedDoc.fileName}</strong> is a {selectedDoc.category} document but your current filters exclude it.
              </p>
              <button onClick={clearFilters} className="text-[var(--color-primary-emphasis-text)] font-semibold hover:underline">
                Clear filters to show it
              </button>
            </div>
          )}

          {/* Unknown doc ID */}
          {selectedDocId && !selectedDoc && (
            <div className="p-4 rounded-lg border border-rose-500/20 bg-rose-950/10 text-xs space-y-2" role="alert">
              <p className="text-rose-300 font-semibold">Unknown document ID</p>
              <p className="text-[var(--color-text-secondary)]">Document <code className="font-mono bg-rose-950 px-1 rounded">{selectedDocId}</code> was not found.</p>
              <button onClick={() => selectDocument('')} className="text-[var(--color-primary-emphasis-text)] font-semibold hover:underline">
                Dismiss
              </button>
            </div>
          )}

          {/* No selection */}
          {!selectedDocId && (
            <div className="p-6 rounded-lg border border-[var(--color-border-custom)] bg-[var(--color-surface-bg)] text-center text-[var(--color-text-secondary)] text-xs">
              <FileText className="h-8 w-8 mx-auto mb-3 text-zinc-600" aria-hidden="true" />
              <p className="font-semibold">Select a document to view details</p>
              <p className="mt-1">Click any row in the document list.</p>
            </div>
          )}

          {/* Document detail panel */}
          {selectedDoc && selectedDocInResults && (
            <div className="bg-[var(--color-surface-bg)] border border-[var(--color-border-custom)] rounded-lg overflow-hidden">
              <div className="p-4 border-b border-[var(--color-border-custom)] space-y-1">
                <h2 className="text-sm font-bold text-[var(--color-text-primary)] leading-snug">
                  {selectedDoc.fileName}
                </h2>
                <div className="flex flex-wrap gap-1.5">
                  <EvidenceBadge state={selectedDoc.evidenceState} />
                  <ReviewBadge status={selectedDoc.reviewStatus} />
                  <span className="text-[10px] text-[var(--color-text-secondary)] border border-[var(--color-border-custom)] bg-[var(--color-surface-elevated-bg)]/50 px-1.5 py-0.5 rounded">
                    {CATEGORY_LABELS[selectedDoc.category]}
                  </span>
                </div>
              </div>

              {/* Metadata */}
              <div className="p-4 border-b border-[var(--color-border-custom)] space-y-2">
                <h3 className="text-[10px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">Metadata</h3>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                  <div><span className="text-[var(--color-text-secondary)]">Type:</span> <strong>{selectedDoc.documentType}</strong></div>
                  <div><span className="text-[var(--color-text-secondary)]">Pages:</span> <strong>{selectedDoc.pageCount}</strong></div>
                  <div><span className="text-[var(--color-text-secondary)]">Tax Year:</span> <strong>{selectedDoc.taxYear}</strong></div>
                  <div><span className="text-[var(--color-text-secondary)]">Upload status:</span> <strong>{selectedDoc.uploadStatus}</strong></div>
                  <div><span className="text-[var(--color-text-secondary)]">Uploaded by:</span> <strong>{selectedDoc.uploadedBy}</strong></div>
                  <div><span className="text-[var(--color-text-secondary)]">Uploaded at:</span> <strong>{new Date(selectedDoc.uploadedAt).toLocaleDateString()}</strong></div>
                </div>
              </div>

              {/* Connected-object trail */}
              <div className="p-4 border-b border-[var(--color-border-custom)] space-y-2">
                <h3 className="text-[10px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">Connected Object Trail</h3>
                <ol className="space-y-1.5 text-xs">
                  <li className="flex items-center gap-2 text-[var(--color-text-secondary)]">
                    <span className="h-5 w-5 rounded-full bg-[var(--color-primary-action)]/20 text-[var(--color-primary-action)] text-[10px] font-bold flex items-center justify-center">1</span>
                    <Link to={`/return/${selectedDoc.returnId}?dataset=scale`} className="font-semibold text-[var(--color-primary-action)] hover:underline inline-flex items-center gap-1">
                      Return: {resolveReturnLabel(selectedDoc.returnId).clientName} <ExternalLink className="h-3 w-3" aria-hidden="true" />
                    </Link>
                  </li>
                  {selectedDoc.linkedFieldIds.length > 0 && (
                    <li className="flex items-center gap-2 text-[var(--color-text-secondary)]">
                      <span className="h-5 w-5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-bold flex items-center justify-center">2</span>
                      <span>Tax field: <strong className="text-[var(--color-text-primary)]">{selectedDoc.linkedFieldIds[0]}</strong></span>
                    </li>
                  )}
                  <li className="flex items-center gap-2 text-[var(--color-text-secondary)]">
                    <span className="h-5 w-5 rounded-full bg-sky-500/20 text-sky-400 text-[10px] font-bold flex items-center justify-center">3</span>
                    <span>Document: <strong className="text-[var(--color-text-primary)] font-mono text-[10px]">{selectedDoc.id}</strong></span>
                  </li>
                  {linkedTasks.length > 0 && (
                    <li className="flex items-center gap-2 text-[var(--color-text-secondary)]">
                      <span className="h-5 w-5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold flex items-center justify-center">4</span>
                      <span>{linkedTasks.length} linked task{linkedTasks.length > 1 ? 's' : ''}</span>
                    </li>
                  )}
                  {linkedMessages.length > 0 && (
                    <li className="flex items-center gap-2 text-[var(--color-text-secondary)]">
                      <span className="h-5 w-5 rounded-full bg-purple-500/20 text-purple-400 text-[10px] font-bold flex items-center justify-center">5</span>
                      <span>{linkedMessages.length} linked message{linkedMessages.length > 1 ? 's' : ''}</span>
                    </li>
                  )}
                </ol>
              </div>

              {/* Linked Tasks */}
              {linkedTasks.length > 0 && (
                <LinkedSection
                  title={`Tasks (${linkedTasks.length})`}
                  icon={<CheckSquare className="h-3.5 w-3.5" aria-hidden="true" />}
                  items={linkedTasks.map((t) => ({
                    id: t.id,
                    label: t.title,
                    meta: `${t.status} · ${t.urgency} · owner: ${t.owner}`,
                  }))}
                />
              )}

              {/* Linked Requests */}
              {linkedRequests.length > 0 && (
                <LinkedSection
                  title={`Requests (${linkedRequests.length})`}
                  icon={<Tag className="h-3.5 w-3.5" aria-hidden="true" />}
                  items={linkedRequests.map((r) => ({
                    id: r.id,
                    label: r.title.length > 50 ? r.title.slice(0, 50) + '…' : r.title,
                    meta: `${r.status} · owner: ${r.owner}`,
                  }))}
                />
              )}

              {/* Linked Messages */}
              {linkedMessages.length > 0 && (
                <LinkedSection
                  title={`Messages (${linkedMessages.length})`}
                  icon={<MessageSquare className="h-3.5 w-3.5" aria-hidden="true" />}
                  items={linkedMessages.map((m) => ({
                    id: m.id,
                    label: m.subject,
                    meta: `${m.visibility === 'FIRM_INTERNAL' ? 'Internal' : 'Client-visible'} · ${m.authorRole}: ${m.author}`,
                  }))}
                />
              )}

              {linkedTasks.length === 0 && linkedRequests.length === 0 && linkedMessages.length === 0 && (
                <div className="p-4 text-xs text-[var(--color-text-secondary)] italic">
                  No linked tasks, requests, or messages for this document.
                </div>
              )}

              {/* Simulated data disclosure */}
              <div className="p-3 bg-zinc-950/30 border-t border-[var(--color-border-custom)] text-[10px] text-zinc-500">
                Scale-test fixture. Document ID: <code className="font-mono">{selectedDoc.id}</code>. No real tax data.
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};

// ─── LinkedSection sub-component ──────────────────────────────────────────────
const LinkedSection: React.FC<{
  title: string;
  icon: React.ReactNode;
  items: { id: string; label: string; meta: string }[];
}> = ({ title, icon, items }) => {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="border-t border-[var(--color-border-custom)]">
      <button
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        className="w-full flex items-center justify-between p-3 text-xs font-semibold text-[var(--color-text-primary)] hover:bg-[var(--color-surface-elevated-bg)]/20 transition-colors"
      >
        <span className="flex items-center gap-2 text-[var(--color-text-secondary)]">
          {icon}
          {title}
        </span>
        {expanded ? <ChevronDown className="h-3.5 w-3.5 text-zinc-500" aria-hidden="true" /> : <ChevronRight className="h-3.5 w-3.5 text-zinc-500" aria-hidden="true" />}
      </button>
      {expanded && (
        <ul className="divide-y divide-[var(--color-border-custom)]/50 bg-[var(--color-surface-elevated-bg)]/10">
          {items.map((item) => (
            <li key={item.id} className="px-4 py-2 space-y-0.5">
              <div className="text-xs font-medium text-[var(--color-text-primary)] truncate">{item.label}</div>
              <div className="text-[10px] text-[var(--color-text-secondary)]">
                <code className="font-mono">{item.id}</code> · {item.meta}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default DocumentExplorerPage;
