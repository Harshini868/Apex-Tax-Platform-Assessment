import { describe, it, expect } from 'vitest';
import { generateScaleDataset, createRandom } from './generateScaleDataset';
import { initialReviewQueue } from './curatedJourneyThree';
import { curatedReturn as initialCuratedReturn } from './curatedJourneyOne';

describe('Vite/TypeScript Fixed-Seed Deterministic Generator Integrity', () => {
  const seed = 20260720;
  const dataset = generateScaleDataset(seed);

  it('1. Generates exact required item counts', () => {
    expect(dataset.returns.length).toBe(300);
    expect(dataset.documents.length).toBe(500);
    expect(dataset.tasks.length).toBe(300);
    expect(dataset.requests.length).toBe(200);
    expect(dataset.messages.length).toBe(300);
    expect(dataset.metadata.totalActivityCount).toBe(800);
  });

  it('2. Same-seed reproducibility (deeply equivalent structure)', () => {
    const dataset2 = generateScaleDataset(seed);
    expect(dataset).toEqual(dataset2);
  });

  it('3. Different-seed variation', () => {
    const datasetDiff = generateScaleDataset(999999);
    expect(datasetDiff.returns[0].clientName).not.toEqual(dataset.returns[0].clientName);
  });

  it('4. Unique return IDs', () => {
    const ids = dataset.returns.map((r) => r.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(300);
  });

  it('5. Unique document IDs', () => {
    const ids = dataset.documents.map((d) => d.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(500);
  });

  it('6. Unique activity IDs (tasks, requests, messages)', () => {
    const activityIds = [
      ...dataset.tasks.map((t) => t.id),
      ...dataset.requests.map((r) => r.id),
      ...dataset.messages.map((m) => m.id),
    ];
    const uniqueIds = new Set(activityIds);
    expect(uniqueIds.size).toBe(800);
  });

  it('7. Every document returnId is valid', () => {
    const returnIds = new Set([
      'ret-rostova-tech-1120s',
      ...dataset.returns.map((r) => r.returnId),
    ]);
    dataset.documents.forEach((doc) => {
      expect(returnIds.has(doc.returnId)).toBe(true);
    });
  });

  it('8. Every linked document ID exists', () => {
    const docIds = new Set(dataset.documents.map((d) => d.id));
    dataset.returns.forEach((ret) => {
      ret.linkedDocumentIds.forEach((dId) => {
        expect(docIds.has(dId)).toBe(true);
      });
    });
  });

  it('9-11. Referential integrity: linked activity IDs exist', () => {
    const taskIds = new Set(dataset.tasks.map((t) => t.id));
    const requestIds = new Set(dataset.requests.map((r) => r.id));
    const messageIds = new Set(dataset.messages.map((m) => m.id));

    dataset.returns.forEach((ret) => {
      ret.linkedTaskIds.forEach((tId) => expect(taskIds.has(tId)).toBe(true));
      ret.linkedRequestIds.forEach((rId) => expect(requestIds.has(rId)).toBe(true));
      ret.linkedMessageIds.forEach((mId) => expect(messageIds.has(mId)).toBe(true));
    });
  });

  it('12-13. Activity owners are valid', () => {
    const validOwners = new Set(['client', 'preparer', 'reviewer']);
    dataset.tasks.forEach((task) => {
      expect(validOwners.has(task.owner)).toBe(true);
    });
    dataset.requests.forEach((req) => {
      expect(validOwners.has(req.owner)).toBe(true);
    });
  });

  it('14. Message visibility states are valid', () => {
    const validVis = new Set(['FIRM_INTERNAL', 'CLIENT_VISIBLE']);
    dataset.messages.forEach((msg) => {
      expect(validVis.has(msg.visibility)).toBe(true);
    });
  });

  it('15. Required return-stage distribution', () => {
    const stages = dataset.returns.map((r) => r.stage);
    const uniqueStages = new Set(stages);
    expect(uniqueStages.has('Preparation')).toBe(true);
    expect(uniqueStages.has('Review')).toBe(true);
    expect(uniqueStages.has('Completed')).toBe(true);
  });

  it('16. Required ownership and distribution checks', () => {
    const reviewersCount = dataset.returns.filter((r) => r.nextActionOwner === 'REVIEWER').length;
    const clientBlockedCount = dataset.returns.filter((r) => r.nextActionOwner === 'CLIENT').length;
    const completedCount = dataset.returns.filter((r) => r.stage === 'Completed').length;
    const otherReviewerCount = dataset.returns.filter((r) => r.assignedReviewer !== 'Marcus Vance').length;

    expect(reviewersCount).toBeGreaterThanOrEqual(100);
    expect(clientBlockedCount).toBeGreaterThanOrEqual(40);
    expect(completedCount).toBeGreaterThanOrEqual(30);
    expect(otherReviewerCount).toBeGreaterThanOrEqual(20);
  });

  it('17. Required warning-state distribution', () => {
    const severities = new Set(dataset.returns.map((r) => r.warningSeverity));
    expect(severities.has('CRITICAL')).toBe(true);
    expect(severities.has('HIGH')).toBe(true);
    expect(severities.has('MEDIUM')).toBe(true);
    expect(severities.has('LOW')).toBe(true);
    expect(severities.has('NONE')).toBe(true);
  });

  it('18. At least 250 documents are linked to primary complex collection', () => {
    const rostovaDocs = dataset.documents.filter((d) => d.returnId === 'ret-rostova-tech-1120s');
    expect(rostovaDocs.length).toBeGreaterThanOrEqual(250);
  });

  it('19. No Math.random usage (verified via deterministic LCG createRandom export)', () => {
    // The createRandom function uses a Linear Congruential Generator not Math.random.
    // We verify it produces deterministic sequences instead of random ones.
    const rng1 = createRandom(42);
    const rng2 = createRandom(42);
    const seq1 = [rng1(), rng1(), rng1()];
    const seq2 = [rng2(), rng2(), rng2()];
    expect(seq1).toEqual(seq2); // Same seed = same sequence
    expect(seq1[0]).not.toEqual(seq1[1]); // Different outputs each call
  });

  it('20. Curated Journey 1-3 fixtures remain untouched', () => {
    expect(initialReviewQueue.length).toBe(7);
    expect(initialCuratedReturn.clientName).toBe('John Miller');
  });

  it('21. Non-primary generated documents do not fabricate a link into curated Journey 1 field data', () => {
    const nonPrimaryDocs = dataset.documents.filter((d) => d.returnId !== 'ret-rostova-tech-1120s');
    expect(nonPrimaryDocs.length).toBeGreaterThan(0);
    nonPrimaryDocs.forEach((doc) => {
      expect(doc.linkedFieldIds).not.toContain('f1040-line1z');
    });
  });

  it('22. At least 20 returns are both reviewer-actionable and assigned to another reviewer', () => {
    const actionableTeammateReturns = dataset.returns.filter(
      (r) => r.nextActionOwner === 'REVIEWER' && r.assignedReviewer !== 'Marcus Vance'
    );
    expect(actionableTeammateReturns.length).toBeGreaterThanOrEqual(20);
  });
});
