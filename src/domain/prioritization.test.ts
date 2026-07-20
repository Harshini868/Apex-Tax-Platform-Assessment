import { describe, it, expect } from 'vitest';
import type { ReviewQueueItem } from './dashboard';
import { calculatePriority, sortQueue } from './prioritization';

describe('Prioritization Logic Unit Tests', () => {
  const currentReviewerId = 'reviewer-marcus-vance';

  const mockItem = (overrides: Partial<ReviewQueueItem>): ReviewQueueItem => ({
    id: '1',
    returnId: 'ret-1',
    clientId: 'c-1',
    clientName: 'Client Alpha',
    returnType: '1040',
    taxYear: 2025,
    stage: 'Review',
    status: 'Ready for reviewer',
    assignedPreparer: 'David Chen',
    assignedReviewer: 'Marcus Vance',
    dueDate: '2026-07-22T23:59:59Z',
    reviewRequestedAt: '2026-07-20T09:00:00Z',
    warningSeverity: 'HIGH',
    unresolvedItemCount: 1,
    blockerCount: 0,
    nextActionOwner: 'REVIEWER',
    priorityScore: 0,
    priorityReasons: [],
    ...overrides,
  });

  it('completed returns have a priority score of 0', () => {
    const item = mockItem({ stage: 'Completed', status: 'Filed' });
    const { score, reasons } = calculatePriority(item, currentReviewerId);
    expect(score).toBe(0);
    expect(reasons).toContain('Completed Return');
  });

  it('reviewer-actionable items outrank non-reviewer actionable items', () => {
    // Actionable item with far due date
    const actionable = mockItem({
      id: 'act-1',
      nextActionOwner: 'REVIEWER',
      dueDate: '2026-09-15T23:59:59Z',
    });
    // Non-actionable item with close due date
    const nonActionable = mockItem({
      id: 'non-1',
      nextActionOwner: 'CLIENT',
      dueDate: '2026-07-21T23:59:59Z',
    });

    const scoreAct = calculatePriority(actionable, currentReviewerId).score;
    const scoreNon = calculatePriority(nonActionable, currentReviewerId).score;

    expect(scoreAct).toBeGreaterThan(scoreNon);
  });

  it('de-prioritizes client-blocked items', () => {
    const item = mockItem({ nextActionOwner: 'CLIENT', blockerCount: 1 });
    const { score, reasons } = calculatePriority(item, currentReviewerId);
    expect(score).toBeLessThan(45);
    expect(reasons).toContain('Blocked — client owns the next action');
  });

  it('deterministic tie-breaking handles equal scores correctly', () => {
    const itemA = mockItem({ id: 'item-a', clientName: 'Zebra Corp', priorityScore: 90 });
    const itemB = mockItem({ id: 'item-b', clientName: 'Apple Inc', priorityScore: 90 });

    const sorted = sortQueue([itemA, itemB], currentReviewerId);
    expect(sorted[0].id).toBe('item-b'); // 'Apple Inc' comes first alphabetically
  });

  it('does not label a teammate\'s actionable item as "yours" (another-reviewer assignment)', () => {
    const mine = mockItem({ id: 'mine', assignedReviewer: 'Marcus Vance', nextActionOwner: 'REVIEWER' });
    const theirs = mockItem({ id: 'theirs', assignedReviewer: 'Priya Shah', nextActionOwner: 'REVIEWER' });

    const mineResult = calculatePriority(mine, currentReviewerId);
    const theirsResult = calculatePriority(theirs, currentReviewerId);

    expect(mineResult.reasons).toContain('Ready for your review');
    expect(theirsResult.reasons).not.toContain('Ready for your review');
    expect(theirsResult.reasons.some((r) => r.includes('Priya Shah'))).toBe(true);
    expect(theirsResult.reasons).not.toContain('Assigned to you');
    // My own actionable item still outranks a teammate's equally-actionable item
    expect(mineResult.score).toBeGreaterThan(theirsResult.score);
  });
});
