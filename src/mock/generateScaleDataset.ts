import type {
    ScaleDataset,
    GeneratedReturn,
    GeneratedDocument,
    GeneratedTask,
    GeneratedRequest,
    GeneratedMessage,
    DocumentCategory,
    DocumentEvidenceState,
  } from '../domain/scale';
  import type { QueueWarningSeverity } from '../domain/dashboard';
  
  // Deterministic LCG helper
  export function createRandom(seed: number) {
    let s = seed;
    return function () {
      s = (s * 1664525 + 1013904223) % 4294967296;
      return s / 4294967296;
    };
  }
  
  const firstNames = ['James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis', 'Garcia', 'Rodriguez', 'Wilson'];
  const companyNames = ['Apex', 'Zenith', 'Quantum', 'Nexus', 'Starlight', 'Vanguard', 'Horizon', 'Summit', 'Equinox', 'Nova'];
  const companySuffixes = ['Tech Inc.', 'Ventures', 'Holdings', 'Consulting', 'Solutions', 'Capital', 'Partners', 'Enterprises'];

  const preparers = ['David Chen', 'Sarah Jenkins', 'Michael Chang', 'Emily Taylor', 'Robert Patel'];
  
  const docCategories: DocumentCategory[] = ['income', 'deductions', 'compliance', 'credits', 'other'];
  const evidenceStates: DocumentEvidenceState[] = ['complete', 'uncertain', 'conflict', 'missing'];
  const docTypes = ['W-2 Statement', '1099-INT Form', '1099-B Summary', 'Schedule K-1', 'Bank Statement', 'Receipt Log', 'Tax Credit Certificate'];
  
  export function generateScaleDataset(seed: number): ScaleDataset {
    const random = createRandom(seed);
  
    const choose = <T>(arr: T[]): T => {
      const idx = Math.floor(random() * arr.length);
      return arr[idx];
    };
  
    const returns: GeneratedReturn[] = [];
    const documents: GeneratedDocument[] = [];
    const tasks: GeneratedTask[] = [];
    const requests: GeneratedRequest[] = [];
    const messages: GeneratedMessage[] = [];
  
    // 1. Generate 300 returns
    for (let i = 1; i <= 300; i++) {
      const returnId = `scale-ret-${i.toString().padStart(4, '0')}`;
      const clientId = `scale-client-${i.toString().padStart(4, '0')}`;
  
      // Determine type: Individual or Corporate
      const isCorp = i % 2 === 0;
      let clientName = '';
      let returnType = '';
      if (isCorp) {
        clientName = `${choose(companyNames)} ${choose(companySuffixes)}`;
        returnType = choose(['Form 1120-S', 'Form 1065', 'Form 1120']);
      } else {
        clientName = `${choose(firstNames)} ${choose(lastNames)}`;
        returnType = 'Form 1040';
      }
  
      // Ensure all warning severities exist
      // Force a specific warning severity based on index to meet distribution checks
      let warningSeverity: QueueWarningSeverity = 'NONE';
      if (i % 5 === 1) warningSeverity = 'CRITICAL';
      else if (i % 5 === 2) warningSeverity = 'HIGH';
      else if (i % 5 === 3) warningSeverity = 'MEDIUM';
      else if (i % 5 === 4) warningSeverity = 'LOW';
  
      // Stages: "Preparation", "Review", "Completed"
      let stage = 'Preparation';
      if (i % 3 === 0) stage = 'Review';
      else if (i % 3 === 1) stage = 'Completed';
  
      // Status mapping:
      let status = 'Preparation';
      if (stage === 'Review') {
        status = i % 2 === 0 ? 'Ready for reviewer' : 'Review in progress';
      } else if (stage === 'Completed') {
        status = i % 2 === 0 ? 'Reviewer approved' : 'Filed';
      }
  
      // Owner mapping to fulfill distribution requirement:
      // "CLIENT", "PREPARER", "REVIEWER", "FIRM"
      let nextActionOwner = 'PREPARER';
      if (stage === 'Completed') {
        nextActionOwner = 'FIRM';
      } else if (stage === 'Review') {
        nextActionOwner = 'REVIEWER';
      }
  
      // Force at least 105 reviewer-actionable returns
      if (i > 45 && i <= 150) {
        stage = 'Review';
        nextActionOwner = 'REVIEWER';
        status = 'Ready for reviewer';
      }
  
      // Force at least 45 client blocked returns
      if (i <= 45) {
        stage = 'Review';
        status = 'Blocked by Client Action';
        nextActionOwner = 'CLIENT';
      }

      // Force at least 35 completed returns
      if (i > 150 && i <= 185) {
        stage = 'Completed';
        nextActionOwner = 'FIRM';
        status = 'Reviewer approved';
      }
  
      // Force at least 20 returns to belong to another reviewer. This range (1-25) fully overlaps
      // the client-blocked range above, so on its own it can never demonstrate a teammate's
      // *actionable* work — the exact scenario the reviewer queue needs to prove it labels
      // accurately (see the second override below, which adds actionable another-reviewer work
      // in a non-overlapping range).
      let assignedReviewer = 'Marcus Vance';
      if (i <= 25) {
        assignedReviewer = choose(['Elena Rostova', 'Jonathan Wu']);
      }

      // Force at least 20 *actionable* returns assigned to another reviewer, in a range that
      // doesn't overlap the client-blocked (1-45), Marcus-actionable (46-150), or completed
      // (151-185) overrides above — so scale mode has real teammate work to distinguish from "mine".
      if (i > 270 && i <= 290) {
        stage = 'Review';
        nextActionOwner = 'REVIEWER';
        status = 'Ready for reviewer';
        assignedReviewer = choose(['Elena Rostova', 'Jonathan Wu']);
      }
  
      const assignedPreparer = choose(preparers);
  
      // Build dates
      const dueDay = 15 + (i % 15);
      const dueDate = `2026-07-${dueDay.toString().padStart(2, '0')}T23:59:59Z`;
      const reviewRequestedAt = stage !== 'Preparation' ? `2026-07-${(dueDay - 5).toString().padStart(2, '0')}T09:00:00Z` : null;
  
      // Blocker counts
      const blockerCount = nextActionOwner === 'CLIENT' ? 1 + (i % 2) : 0;
      const unresolvedItemCount = stage === 'Completed' ? 0 : 1 + (i % 3);
  
      // Priority score and reasons are intentionally NOT computed here — they're derived downstream
      // by the same `calculatePriority`/`sortQueue` functions the curated (guided) queue uses, so
      // both datasets share one source of truth for ranking and for the wording of "assigned to you"
      // vs. a teammate's work (see domain/prioritization.ts).
      returns.push({
        id: returnId,
        returnId,
        clientId,
        clientName,
        returnType,
        taxYear: 2025,
        stage,
        status,
        assignedPreparer,
        assignedReviewer,
        dueDate,
        reviewRequestedAt,
        warningSeverity,
        unresolvedItemCount,
        blockerCount,
        nextActionOwner,
        priorityScore: 0,
        priorityReasons: [],
        serviceTarget: i % 3 === 0 ? 'Gold' : i % 3 === 1 ? 'Silver' : 'Standard',
        linkedDocumentIds: [],
        linkedTaskIds: [],
        linkedRequestIds: [],
        linkedMessageIds: [],
      });
    }
  
    // 2. Generate exactly 500 documents
    // Primary Return: 'ret-rostova-tech-1120s' needs at least 250 documents linked.
    // The rest (250 docs) will be linked among generated returns
    for (let j = 1; j <= 500; j++) {
      const docId = `scale-doc-${j.toString().padStart(4, '0')}`;
      
      // Determine Return ID allocation
      const isPrimary = j <= 260; // 260 documents linked to Rostova Tech
      const returnId = isPrimary ? 'ret-rostova-tech-1120s' : returns[(j % 300)].returnId;
  
      const category = choose(docCategories);
      const evidenceState = choose(evidenceStates);
      const reviewStatus = j % 2 === 0 ? ('reviewed' as const) : ('unreviewed' as const);
  
      const docType = choose(docTypes);
      const fileName = `${category.charAt(0).toUpperCase() + category.slice(1)}_${docType.replace(' ', '_')}_2025_${j}.pdf`;
  
      documents.push({
        id: docId,
        returnId,
        fileName,
        documentType: docType,
        category,
        taxYear: 2025,
        pageCount: 1 + (j % 5),
        uploadStatus: j % 15 === 0 ? 'failed' : j % 12 === 0 ? 'pending' : 'uploaded',
        reviewStatus,
        evidenceState,
        uploadedBy: j % 2 === 0 ? 'Client' : 'Preparer',
        uploadedAt: `2026-07-15T14:${(j % 60).toString().padStart(2, '0')}:00Z`,
        // Only the curated Rostova return has a real tax-field model to link into; the 300
        // generated returns don't, so falsely pointing them at John Miller's curated field ID
        // would be a fabricated cross-reference into unrelated curated data.
        linkedFieldIds: isPrimary ? ['rostova-interest-expense'] : [],
        linkedTaskIds: [],
        linkedRequestIds: [],
        linkedMessageIds: [],
        simulated: true,
      });
    }
  
    // 3. Generate exactly 300 tasks, 200 requests, and 300 messages (totaling 800 activities)
    // Ensure referential integrity and valid owners.
    
    // A. Generate Tasks (300)
    for (let t = 1; t <= 300; t++) {
      const taskId = `scale-task-${t.toString().padStart(4, '0')}`;
      const linkedDoc = documents[t % 500];
      const returnId = linkedDoc.returnId;
  
      const task: GeneratedTask = {
        id: taskId,
        returnId,
        documentId: linkedDoc.id,
        title: `Verify ${linkedDoc.documentType} values`,
        status: t % 3 === 0 ? 'completed' : t % 3 === 1 ? 'in_progress' : 'pending',
        owner: t % 3 === 0 ? 'reviewer' : t % 3 === 1 ? 'preparer' : 'client',
        dueDate: `2026-07-${(15 + (t % 10)).toString().padStart(2, '0')}T12:00:00Z`,
        urgency: t % 4 === 0 ? 'critical' : t % 4 === 1 ? 'high' : t % 4 === 2 ? 'medium' : 'low',
      };
  
      tasks.push(task);
  
      // Link back to document and return
      linkedDoc.linkedTaskIds.push(taskId);
      const ret = returns.find((r) => r.returnId === returnId);
      if (ret) {
        ret.linkedTaskIds.push(taskId);
        if (!ret.linkedDocumentIds.includes(linkedDoc.id)) {
          ret.linkedDocumentIds.push(linkedDoc.id);
        }
      }
    }
  
    // B. Generate Requests (200)
    for (let rIdx = 1; rIdx <= 200; rIdx++) {
      const requestId = `scale-req-${rIdx.toString().padStart(4, '0')}`;
      const linkedDoc = documents[(rIdx + 50) % 500];
      const returnId = linkedDoc.returnId;
  
      const req: GeneratedRequest = {
        id: requestId,
        returnId,
        documentId: linkedDoc.id,
        title: `Request replacement for ${linkedDoc.fileName}`,
        status: rIdx % 4 === 0 ? 'approved' : rIdx % 4 === 1 ? 'submitted' : rIdx % 4 === 2 ? 'rejected' : 'open',
        owner: rIdx % 3 === 0 ? 'client' : rIdx % 3 === 1 ? 'preparer' : 'reviewer',
        requestedAt: `2026-07-10T10:00:00Z`,
        dueDate: `2026-07-${(18 + (rIdx % 10)).toString().padStart(2, '0')}T17:00:00Z`,
      };
  
      requests.push(req);
  
      // Link back to document and return
      linkedDoc.linkedRequestIds.push(requestId);
      const ret = returns.find((r) => r.returnId === returnId);
      if (ret) {
        ret.linkedRequestIds.push(requestId);
        if (!ret.linkedDocumentIds.includes(linkedDoc.id)) {
          ret.linkedDocumentIds.push(linkedDoc.id);
        }
      }
    }
  
    // C. Generate Messages (300)
    for (let m = 1; m <= 300; m++) {
      const msgId = `scale-msg-${m.toString().padStart(4, '0')}`;
      const linkedDoc = documents[(m + 100) % 500];
      const returnId = linkedDoc.returnId;
      const threadId = `scale-thread-${(m % 50).toString().padStart(3, '0')}`;
  
      const msg: GeneratedMessage = {
        id: msgId,
        returnId,
        documentId: linkedDoc.id,
        threadId,
        visibility: m % 2 === 0 ? 'FIRM_INTERNAL' : 'CLIENT_VISIBLE',
        author: m % 3 === 0 ? 'CPA David Chen' : m % 3 === 1 ? 'Marcus Vance' : 'Taxpayer Client',
        authorRole: m % 3 === 0 ? 'preparer' : m % 3 === 1 ? 'reviewer' : 'client',
        createdAt: `2026-07-${(12 + (m % 8)).toString().padStart(2, '0')}T15:30:00Z`,
        subject: `Audit note regarding ${linkedDoc.fileName}`,
        body: `This is a deterministically generated audit note describing validation states for document ID ${linkedDoc.id}.`,
      };
  
      messages.push(msg);
  
      // Link back to document and return
      linkedDoc.linkedMessageIds.push(msgId);
      const ret = returns.find((r) => r.returnId === returnId);
      if (ret) {
        ret.linkedMessageIds.push(msgId);
        if (!ret.linkedDocumentIds.includes(linkedDoc.id)) {
          ret.linkedDocumentIds.push(linkedDoc.id);
        }
      }
    }
  
    // Update return document links
    documents.forEach((doc) => {
      const ret = returns.find((r) => r.returnId === doc.returnId);
      if (ret && !ret.linkedDocumentIds.includes(doc.id)) {
        ret.linkedDocumentIds.push(doc.id);
      }
    });
  
    const metadata = {
      seed,
      returnCount: returns.length,
      documentCount: documents.length,
      taskCount: tasks.length,
      requestCount: requests.length,
      messageCount: messages.length,
      totalActivityCount: tasks.length + requests.length + messages.length,
      generatorVersion: '1.0.0',
    };
  
    return {
      seed,
      generatedAtLabel: '2026-07-20T11:47:00Z',
      returns,
      documents,
      tasks,
      requests,
      messages,
      metadata,
    };
  }
