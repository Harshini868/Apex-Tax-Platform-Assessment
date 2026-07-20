import React, { useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router';
import { useApp } from '../context/AppContext';
import { ClientWelcome } from '../components/onboarding/ClientWelcome';
import { calculatePriority, sortQueue } from '../domain/prioritization';
import { scaleDataset } from '../mock/scaleDataset';
import type { GeneratedReturn } from '../domain/scale';
import {
  Search,
  AlertOctagon,
  SlidersHorizontal,
  ChevronRight,
  ChevronLeft,
  LayoutDashboard,
  Database,
} from 'lucide-react';

const PAGE_SIZE = 25;

const getSeverityBadge = (sev: string) => {
  if (sev === 'CRITICAL') return 'bg-rose-950/40 text-rose-300 border-rose-500/30';
  if (sev === 'HIGH') return 'bg-red-950/30 text-red-300 border-red-500/20';
  if (sev === 'MEDIUM') return 'bg-amber-950/20 text-amber-300 border-amber-500/20';
  return 'bg-zinc-950/40 text-zinc-400 border-zinc-700/30';
};

export const DashboardPage: React.FC = () => {
  const { state, selectReviewReturn, startReview, setReviewQueueScope, setReviewQueueFilter, setReviewQueueSearch } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const currentRole = state.currentRole;

  // Parse URL query state
  const rawDataset = searchParams.get('dataset') || 'guided';
  const dataset = rawDataset === 'scale' ? 'scale' : 'guided';
  const scope = searchParams.get('scope') || 'mine';
  const status = searchParams.get('status') || 'all';
  const severity = searchParams.get('severity') || 'all';
  const owner = searchParams.get('owner') || 'all';
  const search = searchParams.get('search') || '';
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);

  // Canonicalize invalid dataset values (must be before hooks — but useEffect IS a hook, runs after render)
  useEffect(() => {
    if (rawDataset !== 'guided' && rawDataset !== 'scale') {
      const params = new URLSearchParams(searchParams);
      params.delete('dataset');
      setSearchParams(params, { replace: true });
    }
  }, [rawDataset]);

  // Synchronize URL parameters with Context State (guided mode, reviewer only)
  useEffect(() => {
    if (currentRole === 'reviewer' && dataset === 'guided') {
      if (state.reviewQueueScope !== scope) {
        setReviewQueueScope(scope as 'mine' | 'team');
      }
      if (state.reviewQueueFilterStatus !== status || state.reviewQueueFilterSeverity !== severity) {
        setReviewQueueFilter(status, severity);
      }
      if (state.reviewQueueSearch !== search) {
        setReviewQueueSearch(search);
      }
    }
  }, [scope, status, severity, search, currentRole, dataset, state.reviewQueueScope, state.reviewQueueFilterStatus, state.reviewQueueFilterSeverity, state.reviewQueueSearch]);

  // ─── SCALE MODE FILTERING (ALL HOOKS MUST RUN BEFORE EARLY RETURNS) ────────
  const filteredScaleQueue: GeneratedReturn[] = useMemo(() => {
    if (dataset !== 'scale') return [];
    return scaleDataset.returns.filter((item) => {
      if (scope === 'mine' && item.assignedReviewer !== 'Marcus Vance') return false;
      if (status !== 'all') {
        const s = item.status.toLowerCase();
        if (status === 'ready-for-review' && !s.includes('ready for reviewer') && !s.includes('review in progress')) return false;
        if (status === 'blocked' && item.blockerCount === 0 && item.nextActionOwner !== 'CLIENT') return false;
        if (status === 'approved' && !s.includes('approved') && s !== 'filed') return false;
        if (status === 'returned' && s !== 'changes requested') return false;
      }
      if (severity !== 'all') {
        const sev = item.warningSeverity;
        if (severity === 'high' && sev !== 'HIGH' && sev !== 'CRITICAL') return false;
        if (severity === 'medium' && sev !== 'MEDIUM') return false;
        if (severity === 'low' && sev !== 'LOW') return false;
      }
      if (owner !== 'all' && item.nextActionOwner !== owner) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        if (!item.clientName.toLowerCase().includes(q) && !item.returnType.toLowerCase().includes(q) &&
            !item.assignedPreparer.toLowerCase().includes(q) && !item.assignedReviewer.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [dataset, scope, status, severity, owner, search]);

  // ─── GUIDED MODE FILTERING ─────────────────────────────────────────────────
  const filteredGuidedQueue = useMemo(() => {
    if (dataset !== 'guided') return [];
    return state.reviewQueue.filter((item) => {
      if (scope === 'mine' && !item.assignedReviewer.toLowerCase().includes('marcus')) return false;
      if (status !== 'all') {
        const s = item.status.toLowerCase();
        if (status === 'ready-for-review' && s !== 'ready for reviewer' && s !== 'review in progress') return false;
        if (status === 'blocked' && item.blockerCount === 0 && !s.includes('blocked')) return false;
        if (status === 'approved' && s !== 'filed' && s !== 'reviewer approved') return false;
        if (status === 'returned' && s !== 'changes requested') return false;
      }
      if (severity !== 'all') {
        const sev = item.warningSeverity.toLowerCase();
        if (severity === 'high' && sev !== 'high' && sev !== 'critical') return false;
        if (severity === 'medium' && sev !== 'medium') return false;
        if (severity === 'low' && sev !== 'low') return false;
      }
      if (owner !== 'all' && item.nextActionOwner.toUpperCase() !== owner) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        if (!item.clientName.toLowerCase().includes(q) && !item.returnType.toLowerCase().includes(q) &&
            !item.assignedPreparer.toLowerCase().includes(q) && !item.assignedReviewer.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [dataset, scope, status, severity, owner, search, state.reviewQueue]);

  // Score and sort guided queue
  const sortedGuidedQueue = useMemo(() =>
    sortQueue(filteredGuidedQueue.map((item) => {
      const { score, reasons } = calculatePriority(item, 'reviewer-marcus-vance');
      return { ...item, priorityScore: score, priorityReasons: reasons };
    }), 'reviewer-marcus-vance'),
    [filteredGuidedQueue]
  );

  // Score and sort the scale queue using the SAME prioritization logic as the guided queue —
  // a separate ad-hoc comparator previously ignored due-date/blocker factors that the displayed
  // priority reasons claimed to use, and separately mislabeled a teammate's actionable item as
  // "yours" (see domain/prioritization.ts, and the Journey 3 audit's J3-05 for the original fix).
  const sortedScaleQueue = useMemo(() =>
    sortQueue(filteredScaleQueue.map((item) => {
      const { score, reasons } = calculatePriority(item, 'reviewer-marcus-vance');
      return { ...item, priorityScore: score, priorityReasons: reasons };
    }), 'reviewer-marcus-vance'),
    [filteredScaleQueue]
  );

  // Scale metrics (always from full dataset)
  const myScaleItems = useMemo(() =>
    scaleDataset.returns.filter((r) => r.assignedReviewer === 'Marcus Vance'),
    []
  );
  const scaleActionableCount = useMemo(() =>
    myScaleItems.filter((r) => r.nextActionOwner === 'REVIEWER' && r.stage !== 'Completed').length,
    [myScaleItems]
  );
  const scaleBlockedCount = useMemo(() =>
    myScaleItems.filter((r) => r.nextActionOwner === 'CLIENT').length,
    [myScaleItems]
  );

  // Guided metrics
  const myQueue = useMemo(() =>
    state.reviewQueue.filter((item) => item.assignedReviewer.toLowerCase().includes('marcus')),
    [state.reviewQueue]
  );
  const totalActionableCount = useMemo(() =>
    myQueue.filter((item) => item.nextActionOwner.toUpperCase() === 'REVIEWER' && item.stage.toLowerCase() !== 'completed').length,
    [myQueue]
  );
  const totalBlockedCount = useMemo(() =>
    myQueue.filter((item) => item.nextActionOwner.toUpperCase() === 'CLIENT' && item.stage.toLowerCase() !== 'completed').length,
    [myQueue]
  );

  // Pagination
  const activeQueue = dataset === 'scale' ? sortedScaleQueue : sortedGuidedQueue;
  const totalResults = activeQueue.length;
  const totalPages = dataset === 'scale' ? Math.max(1, Math.ceil(totalResults / PAGE_SIZE)) : 1;
  const safePage = Math.min(Math.max(1, page), totalPages);
  const pagedQueue = dataset === 'scale'
    ? activeQueue.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)
    : activeQueue;
  const hasActiveFilters = status !== 'all' || severity !== 'all' || owner !== 'all' || search.trim() !== '';

  // ─── EARLY RETURNS (after all hooks) ──────────────────────────────────────
  if (currentRole === 'client') {
    return <ClientWelcome />;
  }

  if (currentRole !== 'reviewer') {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <LayoutDashboard className="h-8 w-8 text-[var(--color-primary-action)]" />
          <h1 className="text-3xl font-bold tracking-tight">Preparer Action Dashboard</h1>
        </div>
        <div className="rounded-lg border border-[var(--color-border-custom)] bg-[var(--color-surface-bg)] p-6">
          <h2 className="text-lg font-semibold mb-2">Workspace Overview</h2>
          <p className="text-[var(--color-text-secondary)] text-sm mb-4">
            Queue of active returns, pending client documents, and urgent tasks sorted by filing priority. Feature placeholder.
          </p>
          <div className="border-t border-[var(--color-border-custom)] pt-4 mt-4">
            <p className="text-xs text-[var(--color-text-secondary)] italic">
              Note: Select "Reviewer" context switcher to view the prioritized senior auditor dashboard.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ─── URL HELPERS ────────────────────────────────────────────────────────────
  const updateQueryParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value && value !== 'all' && value !== '') params.set(key, value);
    else params.delete(key);
    if (key !== 'page') params.delete('page');
    setSearchParams(params);
  };

  const handleDatasetChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value === 'scale') params.set('dataset', 'scale');
    else params.delete('dataset');
    params.delete('page');
    setSearchParams(params);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    if (newPage === 1) params.delete('page');
    else params.set('page', String(newPage));
    setSearchParams(params);
  };

  const handleClearFilters = () => {
    const params = new URLSearchParams();
    if (dataset === 'scale') params.set('dataset', 'scale');
    setSearchParams(params);
  };

  const handleGuidedStartOrContinue = (item: typeof sortedGuidedQueue[0]) => {
    selectReviewReturn(item.returnId);
    if (item.status === 'Ready for reviewer') {
      startReview(item.returnId, 'reviewer-marcus-vance');
    }
    navigate(`/return/${item.returnId}?panel=review`);
  };

  // ─── RENDER ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Dashboard Heading */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between border-b border-[var(--color-border-custom)] pb-4">
        <div>
          <span className="text-xs font-semibold text-[var(--color-primary-action-text)] uppercase tracking-wider">
            Apex Tax Solutions — CPA Portal
          </span>
          <h1 className="text-2xl font-extrabold tracking-tight text-[var(--color-text-primary)]">
            Reviewer Workstation
          </h1>
          <h2 className="sr-only">Review queue</h2>
          <p className="text-xs text-[var(--color-text-secondary)] mt-1">
            Auditor: <strong className="text-[var(--color-text-primary)]">Marcus Vance</strong> | Scope: {scope === 'mine' ? 'My Assigned Reviews' : 'All Team Reviews'}
          </p>
        </div>

        <div className="text-right space-y-1.5">
          <div className="flex items-center justify-end gap-2">
            <label htmlFor="dataset-select" className="text-xs font-semibold text-[var(--color-text-secondary)] flex items-center gap-1">
              <Database className="h-3.5 w-3.5" aria-hidden="true" />
              Dataset:
            </label>
            <select
              id="dataset-select"
              value={dataset}
              onChange={(e) => handleDatasetChange(e.target.value)}
              className="bg-[var(--color-surface-elevated-bg)] border border-[var(--color-border-custom)] rounded px-2 py-1 text-xs font-semibold text-[var(--color-text-primary)] cursor-pointer"
            >
              <option value="guided">Guided demo</option>
              <option value="scale">Scale test — 300 returns</option>
            </select>
          </div>
          <div className="text-[10px] text-amber-500 font-semibold bg-amber-950/20 px-2 py-0.5 rounded border border-amber-500/20 inline-block">
            Simulation disclosure: Mock data view. No real taxpayer data is stored or transmitted.
          </div>
        </div>
      </div>

      {/* Scale mode banner */}
      {dataset === 'scale' && (
        <div className="p-3 rounded-lg border border-sky-500/30 bg-sky-950/20 text-sky-200 text-xs space-y-1" role="note">
          <p className="font-bold">Scale-test mode — {scaleDataset.metadata.returnCount} fictional returns represented</p>
          <p className="text-sky-300/80">Scale-test records are deterministically generated for this prototype. Seed: {scaleDataset.seed} | Generator v{scaleDataset.metadata.generatorVersion}</p>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-lg bg-[var(--color-surface-bg)] border border-[var(--color-border-custom)]">
          <span className="text-xs text-[var(--color-text-secondary)] block font-medium uppercase">Actionable Reviews</span>
          <span className="text-3xl font-black text-[var(--color-primary-emphasis-text)]">
            {dataset === 'scale' ? scaleActionableCount : totalActionableCount}
          </span>
          <span className="text-[10px] text-[var(--color-text-secondary)] block mt-1">Assigned return items waiting senior review</span>
        </div>
        <div className="p-4 rounded-lg bg-[var(--color-surface-bg)] border border-[var(--color-border-custom)]">
          <span className="text-xs text-[var(--color-text-secondary)] block font-medium uppercase">Client Blocked</span>
          <span className="text-3xl font-black text-amber-400">
            {dataset === 'scale' ? scaleBlockedCount : totalBlockedCount}
          </span>
          <span className="text-[10px] text-[var(--color-text-secondary)] block mt-1">Returns waiting for client upload or signature</span>
        </div>
        <div className="p-4 rounded-lg bg-[var(--color-surface-bg)] border border-[var(--color-border-custom)] flex items-center justify-between">
          <div>
            <span className="text-xs text-[var(--color-text-secondary)] block font-medium uppercase">Filter Match Count</span>
            <span className="text-3xl font-black text-[var(--color-text-primary)]">{totalResults}</span>
            <span className="text-[10px] text-[var(--color-text-secondary)] block mt-1">
              {dataset === 'scale' ? `of ${scaleDataset.metadata.returnCount} total scale returns` : 'Items matching current filter criteria'}
            </span>
          </div>
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="text-xs text-[var(--color-primary-emphasis-text)] font-bold hover:underline bg-[var(--color-surface-elevated-bg)] px-2.5 py-1.5 rounded border border-[var(--color-border-custom)]"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="p-4 rounded-lg bg-[var(--color-surface-bg)] border border-[var(--color-border-custom)] flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--color-border-custom)]/40 pb-3">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-[var(--color-text-secondary)]" />
            <h2 className="text-sm font-bold text-[var(--color-text-primary)]">Filter Controls</h2>
          </div>
          <div className="flex bg-[var(--color-surface-elevated-bg)] p-0.5 rounded border border-[var(--color-border-custom)] text-xs font-semibold" role="group" aria-label="Queue scope">
            <button
              onClick={() => updateQueryParam('scope', 'mine')}
              aria-pressed={scope === 'mine'}
              className={`px-3 py-1 rounded-sm transition-colors ${scope === 'mine' ? 'bg-[var(--color-primary-action-btn)] text-white shadow-sm' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'}`}
            >
              My Assigned
            </button>
            <button
              onClick={() => updateQueryParam('scope', 'team')}
              aria-pressed={scope === 'team'}
              className={`px-3 py-1 rounded-sm transition-colors ${scope === 'team' ? 'bg-[var(--color-primary-action-btn)] text-white shadow-sm' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'}`}
            >
              Team Queue
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          <div className="md:col-span-4 space-y-1.5">
            <label htmlFor="search-input" className="block text-xs font-semibold text-[var(--color-text-secondary)]">
              Search returns
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" aria-hidden="true" />
              <input
                id="search-input"
                type="text"
                value={search}
                onChange={(e) => updateQueryParam('search', e.target.value)}
                placeholder="Search Client, Return Type, Auditor..."
                className="w-full bg-[var(--color-surface-elevated-bg)] border border-[var(--color-border-custom)] rounded-md pl-9 pr-4 py-2 text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary-action)]"
              />
            </div>
          </div>

          <div className="md:col-span-4 space-y-1.5">
            <label htmlFor="status-select" className="block text-xs font-semibold text-[var(--color-text-secondary)]">
              Workflow Status
            </label>
            <select
              id="status-select"
              value={status}
              onChange={(e) => updateQueryParam('status', e.target.value)}
              className="w-full bg-[var(--color-surface-elevated-bg)] border border-[var(--color-border-custom)] rounded-md px-3 py-2 text-sm text-[var(--color-text-primary)] cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="ready-for-review">Ready for review</option>
              <option value="blocked">Blocked / On hold</option>
              <option value="returned">Changes requested</option>
              <option value="approved">Approved &amp; Filed</option>
            </select>
          </div>

          <div className="md:col-span-4 space-y-1.5">
            <label htmlFor="severity-select" className="block text-xs font-semibold text-[var(--color-text-secondary)]">
              Warning Severity Filter
            </label>
            <select
              id="severity-select"
              value={severity}
              onChange={(e) => updateQueryParam('severity', e.target.value)}
              className="w-full bg-[var(--color-surface-elevated-bg)] border border-[var(--color-border-custom)] rounded-md px-3 py-2 text-sm text-[var(--color-text-primary)] cursor-pointer"
            >
              <option value="all">All Severities</option>
              <option value="high">Critical &amp; High Warnings</option>
              <option value="medium">Medium Warnings</option>
              <option value="low">Low Warnings</option>
            </select>
          </div>

          <div className="md:col-span-4 space-y-1.5">
            <label htmlFor="owner-select" className="block text-xs font-semibold text-[var(--color-text-secondary)]">
              Next Action Owner
            </label>
            <select
              id="owner-select"
              value={owner}
              onChange={(e) => updateQueryParam('owner', e.target.value)}
              className="w-full bg-[var(--color-surface-elevated-bg)] border border-[var(--color-border-custom)] rounded-md px-3 py-2 text-sm text-[var(--color-text-primary)] cursor-pointer"
            >
              <option value="all">All Owners</option>
              <option value="REVIEWER">Reviewer</option>
              <option value="PREPARER">Preparer</option>
              <option value="CLIENT">Client</option>
              <option value="FIRM">Firm</option>
            </select>
          </div>
        </div>
      </div>

      {/* Pagination header (scale mode only) */}
      {dataset === 'scale' && totalResults > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-[var(--color-text-secondary)]">
          <span>
            Showing {((safePage - 1) * PAGE_SIZE) + 1}–{Math.min(safePage * PAGE_SIZE, totalResults)} of{' '}
            <strong className="text-[var(--color-text-primary)]">{totalResults}</strong> returns
            {hasActiveFilters && ` (filtered from ${scaleDataset.metadata.returnCount})`}
          </span>
          <nav aria-label="Queue pagination" className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(safePage - 1)}
              disabled={safePage <= 1}
              aria-label="Previous page"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded border border-[var(--color-border-custom)] bg-[var(--color-surface-bg)] text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[var(--color-surface-elevated-bg)] transition-colors"
            >
              <ChevronLeft className="h-3 w-3" aria-hidden="true" />
              Previous
            </button>
            <span className="px-2 font-mono" aria-live="polite" aria-atomic="true">
              Page {safePage} of {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(safePage + 1)}
              disabled={safePage >= totalPages}
              aria-label="Next page"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded border border-[var(--color-border-custom)] bg-[var(--color-surface-bg)] text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[var(--color-surface-elevated-bg)] transition-colors"
            >
              Next
              <ChevronRight className="h-3 w-3" aria-hidden="true" />
            </button>
          </nav>
        </div>
      )}

      {/* Queue Results */}
      <div className="space-y-4">
        {pagedQueue.length === 0 ? (
          <div className="rounded-lg border border-[var(--color-border-custom)] bg-[var(--color-surface-bg)] p-12 text-center text-sm" role="alert">
            <AlertOctagon className="h-10 w-10 text-amber-500 mx-auto mb-4" aria-hidden="true" />
            <h3 className="text-base font-bold text-[var(--color-text-primary)] mb-2">No Matching Returns Found</h3>
            <p className="text-[var(--color-text-secondary)] mb-6">
              There are no tax returns in the current queue scope that match your search filters.
            </p>
            <button
              onClick={handleClearFilters}
              className="inline-flex items-center gap-2 rounded-md bg-[var(--color-primary-action)] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[var(--color-primary-action)]/90"
            >
              Clear Search Filters
            </button>
          </div>
        ) : (
          <div className="divide-y divide-[var(--color-border-custom)] rounded-lg border border-[var(--color-border-custom)] bg-[var(--color-surface-bg)] overflow-hidden">
            {dataset === 'scale' ? (
              (pagedQueue as GeneratedReturn[]).map((item) => {
                const isActionable = item.nextActionOwner === 'REVIEWER';
                const isCompleted = item.stage === 'Completed';
                const isBlocked = item.blockerCount > 0 || item.nextActionOwner === 'CLIENT';
                const isTeammate = item.assignedReviewer !== 'Marcus Vance';

                return (
                  <div
                    key={item.id}
                    className={`p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 transition-colors ${
                      isActionable && !isCompleted ? 'hover:bg-[var(--color-surface-elevated-bg)]/20' : 'hover:bg-[var(--color-surface-elevated-bg)]/10'
                    }`}
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-base font-extrabold text-[var(--color-text-primary)]">{item.clientName}</span>
                        <span className="text-xs text-[var(--color-text-secondary)] border border-[var(--color-border-custom)] bg-[var(--color-surface-elevated-bg)]/50 px-2 py-0.5 rounded">
                          {item.returnType} ({item.taxYear})
                        </span>
                        {item.warningSeverity !== 'NONE' && (
                          <span className={`text-[10px] font-bold border px-2 py-0.5 rounded ${getSeverityBadge(item.warningSeverity)}`}>
                            {item.warningSeverity} WARNING
                          </span>
                        )}
                        {isTeammate && (
                          <span className="text-[10px] font-bold border px-2 py-0.5 rounded bg-violet-950/30 text-violet-300 border-violet-500/20">
                            {item.assignedReviewer}'s return
                          </span>
                        )}
                        {isBlocked && (
                          <span className="text-[10px] font-bold border px-2 py-0.5 rounded bg-amber-950/30 text-amber-300 border-amber-500/20">
                            Awaiting client
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-1 text-xs text-[var(--color-text-secondary)]">
                        <div>Status: <strong className="text-[var(--color-text-primary)]">{item.status}</strong></div>
                        <div>Next Owner: <strong className="text-[var(--color-text-primary)]">{item.nextActionOwner}</strong></div>
                        <div>Preparer: <span className="font-medium text-[var(--color-text-primary)]">{item.assignedPreparer}</span></div>
                        <div>Due: <span className="font-medium text-[var(--color-text-primary)]">{new Date(item.dueDate).toLocaleDateString()}</span></div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 mt-2 pt-1 border-t border-[var(--color-border-custom)]/20">
                        <span className="text-[10px] font-bold text-[var(--color-text-secondary)] uppercase">Priority Factors:</span>
                        {item.priorityReasons.map((reason, idx) => (
                          <span key={idx} className="text-[10px] bg-zinc-900 border border-zinc-800 text-[var(--color-text-primary)] px-2 py-0.5 rounded font-mono">
                            {reason}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      {isActionable && !isCompleted && (
                        <span className="text-xs font-bold text-blue-200 bg-blue-950 border border-blue-400 px-2 py-0.5 rounded">
                          Action Required
                        </span>
                      )}
                      <Link
                        to={`/return/${item.returnId}?dataset=scale`}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md transition-colors bg-[var(--color-surface-elevated-bg)] border border-[var(--color-border-custom)] text-[var(--color-text-primary)] hover:bg-[var(--color-border-custom)]"
                      >
                        View scale detail
                        <ChevronRight className="h-4 w-4" aria-hidden="true" />
                      </Link>
                    </div>
                  </div>
                );
              })
            ) : (
              sortedGuidedQueue.map((item) => {
                const isActionable = item.nextActionOwner.toUpperCase() === 'REVIEWER';
                const isCompleted = item.status === 'Filed' || item.status === 'Reviewer approved';
                const isBlocked = item.blockerCount > 0 || item.nextActionOwner.toUpperCase() === 'CLIENT';

                let btnLabel = 'Start review';
                if (item.status === 'Review in progress') btnLabel = 'Continue review';
                else if (isBlocked) btnLabel = 'View blocker';
                else if (isCompleted) btnLabel = 'View approved return';
                else if (item.status === 'Changes requested') btnLabel = 'View status';

                return (
                  <div
                    key={item.id}
                    className={`p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 transition-colors ${
                      isActionable && !isCompleted ? 'bg-[var(--color-surface-elevated-bg)]/10 hover:bg-[var(--color-surface-elevated-bg)]/20' : 'hover:bg-[var(--color-surface-elevated-bg)]/10'
                    }`}
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-base font-extrabold text-[var(--color-text-primary)]">{item.clientName}</span>
                        <span className="text-xs text-[var(--color-text-secondary)] border border-[var(--color-border-custom)] bg-[var(--color-surface-elevated-bg)]/50 px-2 py-0.5 rounded">
                          {item.returnType} ({item.taxYear})
                        </span>
                        {item.warningSeverity !== 'NONE' && (
                          <span className={`text-[10px] font-bold border px-2 py-0.5 rounded ${getSeverityBadge(item.warningSeverity)}`}>
                            {item.warningSeverity} WARNING
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-1 text-xs text-[var(--color-text-secondary)]">
                        <div>Status: <strong className="text-[var(--color-text-primary)]">{item.status}</strong></div>
                        <div>Next Owner: <strong className="text-[var(--color-text-primary)]">{item.nextActionOwner}</strong></div>
                        <div>Preparer: <span className="font-medium text-[var(--color-text-primary)]">{item.assignedPreparer}</span></div>
                        <div>Due: <span className="font-medium text-[var(--color-text-primary)]">{new Date(item.dueDate).toLocaleDateString()}</span></div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 mt-2 pt-1 border-t border-[var(--color-border-custom)]/20">
                        <span className="text-[10px] font-bold text-[var(--color-text-secondary)] uppercase">Priority Factors:</span>
                        {item.priorityReasons.map((reason, idx) => (
                          <span key={idx} className="text-[10px] bg-zinc-900 border border-zinc-800 text-[var(--color-text-primary)] px-2 py-0.5 rounded font-mono">
                            {reason}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {isActionable && !isCompleted && (
                        <span className="text-xs font-bold text-blue-200 bg-blue-950 border border-blue-400 px-2 py-0.5 rounded">
                          Action Required
                        </span>
                      )}
                      <button
                        onClick={() => handleGuidedStartOrContinue(item)}
                        className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
                          isActionable && !isCompleted
                            ? 'bg-[var(--color-primary-action-btn)] text-white hover:opacity-90 shadow-sm'
                            : 'bg-[var(--color-surface-elevated-bg)] border border-[var(--color-border-custom)] text-[var(--color-text-primary)] hover:bg-[var(--color-border-custom)]'
                        }`}
                      >
                        {btnLabel}
                        <ChevronRight className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Bottom pagination (scale mode) */}
      {dataset === 'scale' && totalPages > 1 && (
        <nav aria-label="Queue pagination bottom" className="flex items-center justify-center gap-2 pt-2 text-xs">
          <button
            onClick={() => handlePageChange(safePage - 1)}
            disabled={safePage <= 1}
            aria-label="Previous page"
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded border border-[var(--color-border-custom)] bg-[var(--color-surface-bg)] text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[var(--color-surface-elevated-bg)] transition-colors"
          >
            <ChevronLeft className="h-3 w-3" aria-hidden="true" />
            Previous
          </button>
          <span className="px-4 font-mono text-[var(--color-text-secondary)]">
            {safePage} / {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(safePage + 1)}
            disabled={safePage >= totalPages}
            aria-label="Next page"
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded border border-[var(--color-border-custom)] bg-[var(--color-surface-bg)] text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[var(--color-surface-elevated-bg)] transition-colors"
          >
            Next
            <ChevronRight className="h-3 w-3" aria-hidden="true" />
          </button>
        </nav>
      )}
    </div>
  );
};
export default DashboardPage;
