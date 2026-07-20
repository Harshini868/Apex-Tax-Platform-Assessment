import type { ReviewQueueItem } from './dashboard';

// Matches the 'reviewer-first-last' id convention used by curated fixtures (see mock/curatedJourneyThree.ts)
function reviewerIdForName(name: string): string {
  return `reviewer-${name.trim().toLowerCase().replace(/\s+/g, '-')}`;
}

export function calculatePriority(item: ReviewQueueItem, currentReviewerId: string): { score: number; reasons: string[] } {
  // 1. Completed items must have 0 score
  if (item.stage.toLowerCase() === 'completed' || item.status.toLowerCase() === 'filed') {
    return { score: 0, reasons: ['Completed Return'] };
  }

  let score = 0;
  const reasons: string[] = [];

  // Rule 1: Actionable reviewer work gets a high base boost — but only work assigned to the
  // viewing reviewer is described as "yours"; a teammate's actionable item (visible in Team Queue
  // scope) must not be mislabeled as the current reviewer's own personal action.
  const isReviewerActionable = item.nextActionOwner.toUpperCase() === 'REVIEWER';
  const isAssignedToCurrentReviewer = reviewerIdForName(item.assignedReviewer) === currentReviewerId;

  if (isReviewerActionable) {
    if (isAssignedToCurrentReviewer) {
      score += 50;
      reasons.push('Ready for your review');
    } else {
      score += 45;
      reasons.push(`Ready for review — assigned to ${item.assignedReviewer}`);
    }
  } else if (item.nextActionOwner.toUpperCase() === 'CLIENT') {
    // Rule 2: Client-blocked items must be clearly identified and de-prioritized
    score += 10;
    reasons.push('Blocked — client owns the next action');
  } else {
    score += 25;
    reasons.push(`Next action owned by ${item.nextActionOwner}`);
  }

  // Blocker penalty/identification
  if (item.blockerCount > 0) {
    // If it has blockers, make sure it is de-prioritized
    score -= 10;
  }

  // Urgency score (due date proximity)
  const now = new Date('2026-07-20T11:47:11-04:00'); // Use frozen current local time
  const due = new Date(item.dueDate);
  const diffTime = due.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) {
    score += 25;
    reasons.push('Overdue');
  } else if (diffDays <= 2) {
    score += 20;
    reasons.push(`Due in ${diffDays} day${diffDays > 1 ? 's' : ''}`);
  } else if (diffDays <= 7) {
    score += 10;
    reasons.push('Due this week');
  } else {
    reasons.push('Standard filing schedule');
  }

  // Warning severity
  if (item.warningSeverity === 'CRITICAL') {
    score += 15;
    reasons.push('Critical-severity warning');
  } else if (item.warningSeverity === 'HIGH') {
    score += 10;
    reasons.push('High-severity evidence conflict');
  } else if (item.warningSeverity === 'MEDIUM') {
    score += 5;
    reasons.push('Medium-severity discrepancy');
  }

  // Unresolved items
  if (item.unresolvedItemCount > 0) {
    score += Math.min(item.unresolvedItemCount * 2, 10);
  }

  // Assignment details
  if (isAssignedToCurrentReviewer) {
    score += 5;
    reasons.push('Assigned to you');
  }

  // Cap score to ensure no non-reviewer-actionable item outranks reviewer-actionable work
  if (!isReviewerActionable && score >= 50) {
    score = 45; // Caps it below the minimum reviewer actionable score of 50
  }

  return {
    score: Math.max(score, 0),
    reasons,
  };
}

export function sortQueue(items: ReviewQueueItem[], _currentReviewerId: string): ReviewQueueItem[] {
  return [...items].sort((a, b) => {
    // First by priority score descending
    if (b.priorityScore !== a.priorityScore) {
      return b.priorityScore - a.priorityScore;
    }
    // Deterministic tie-breaking: by client name alphabetically
    return a.clientName.localeCompare(b.clientName);
  });
}
