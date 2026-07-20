import type { TaxReturn } from '../domain/return';
import type { SourceDocument } from '../domain/document';
import type { AIAnalysis } from '../domain/ai';
import type { TraceRecord } from '../domain/traceability';

export const curatedReturn: TaxReturn = {
  id: 'ret-john-miller-1040',
  clientId: 'c-john-miller',
  clientName: 'John Miller',
  taxYear: 2025,
  returnType: 'Form 1040',
  status: 'Preparation',
  nextActionOwner: 'David Chen, Preparer',
  sections: [
    {
      id: 'sec-income',
      title: 'Income',
      description: 'Review wages, interest, and capital gains from source documents.',
      fields: [
        {
          id: 'f1040-line1z',
          lineReference: 'Line 1z',
          label: 'Wages, salaries, tips',
          formattedValue: '$152,500.00',
          rawValue: 152500.00,
          dataType: 'currency',
          interactionState: 'editable',
          aiAnalysisId: 'ai-wages',
          traceId: 'tr-wages',
          auditEntries: [],
          editableRoles: ['preparer', 'reviewer'],
          verificationState: 'AI_GENERATED_UNVERIFIED'
        },
        {
          id: 'f1040-line2a',
          lineReference: 'Line 2b',
          label: 'Taxable interest',
          formattedValue: '$1,200.00',
          rawValue: 1200.00,
          dataType: 'currency',
          interactionState: 'editable',
          aiAnalysisId: 'ai-interest',
          traceId: 'tr-interest',
          auditEntries: [],
          editableRoles: ['preparer', 'reviewer'],
          verificationState: 'CONFLICTING_EVIDENCE'
        },
        {
          id: 'f1040-line8',
          lineReference: 'Schedule E, Line 28',
          label: 'Partnership income',
          formattedValue: 'Missing',
          rawValue: null,
          dataType: 'currency',
          interactionState: 'editable',
          aiAnalysisId: 'ai-partnership',
          traceId: 'tr-partnership',
          auditEntries: [],
          editableRoles: ['preparer', 'reviewer'],
          verificationState: 'MISSING_EVIDENCE'
        },
        {
          id: 'f8949-proceeds',
          lineReference: 'Form 8949, Part I',
          label: 'Brokerage proceeds',
          formattedValue: '$84,750.00',
          rawValue: 84750.00,
          dataType: 'currency',
          interactionState: 'editable',
          aiAnalysisId: 'ai-brokerage',
          traceId: 'tr-brokerage',
          auditEntries: [],
          editableRoles: ['preparer', 'reviewer'],
          verificationState: 'AI_GENERATED_UNVERIFIED'
        }
      ]
    },
    {
      id: 'sec-tax-withheld',
      title: 'Payments & Withholding',
      description: 'Review federal withholding from W-2 and 1099 statements.',
      fields: [
        {
          id: 'f1040-line25a',
          lineReference: 'Line 25a',
          label: 'Federal income tax withheld',
          formattedValue: '$31,250.00',
          rawValue: 31250.00,
          dataType: 'currency',
          interactionState: 'editable',
          aiAnalysisId: 'ai-withholding',
          traceId: 'tr-withholding',
          auditEntries: [
            {
              id: 'a-init-withholding',
              action: 'INITIAL_EXTRACTION',
              actor: 'AI System',
              actorRole: 'preparer',
              timestamp: '2026-07-17T10:00:00-04:00',
              previousValue: null,
              newValue: '$31,250.00',
              reason: 'Extracted from W2 Box 2'
            },
            {
              id: 'a-prep-verify',
              action: 'VERIFY_VALUE',
              actor: 'David Chen',
              actorRole: 'preparer',
              timestamp: '2026-07-17T11:20:00-04:00',
              previousValue: '$31,250.00',
              newValue: '$31,250.00',
              reason: 'Source match verified with complete evidence.'
            }
          ],
          editableRoles: ['preparer', 'reviewer'],
          verificationState: 'PREPARER_VERIFIED'
        }
      ]
    },
    {
      id: 'sec-locked-schedules',
      title: 'Reviewer Finalized items',
      description: 'Items fully verified and signed off by reviewing CPA.',
      fields: [
        {
          id: 'f1040-sched-c-income',
          lineReference: 'Schedule C, Line 3',
          label: 'Gross receipts or sales',
          formattedValue: '$45,000.00',
          rawValue: 45000.00,
          dataType: 'currency',
          interactionState: 'locked',
          aiAnalysisId: 'ai-gross-sales',
          traceId: 'tr-gross-sales',
          auditEntries: [
            {
              id: 'a-sales-extract',
              action: 'INITIAL_EXTRACTION',
              actor: 'AI System',
              actorRole: 'preparer',
              timestamp: '2026-07-17T10:05:00-04:00',
              previousValue: null,
              newValue: '$45,000.00',
              reason: 'Extracted from Schedule C ledger scan.'
            },
            {
              id: 'a-sales-lock',
              action: 'LOCK_VALUE',
              actor: 'Marcus Vance',
              actorRole: 'reviewer',
              timestamp: '2026-07-17T14:32:00-04:00',
              previousValue: '$45,000.00',
              newValue: '$45,000.00',
              reason: 'Cross-referenced with business account ledger. Locked for review compliance.'
            }
          ],
          editableRoles: ['reviewer'],
          verificationState: 'REVIEWER_VERIFIED_LOCKED'
        }
      ]
    }
  ]
};

export const sourceDocuments: SourceDocument[] = [
  {
    id: 'doc-w2-john',
    fileName: 'W2_John_Miller_2025.pdf',
    documentType: 'Form W-2 Wage Statement',
    uploadedAt: '2026-07-16T14:30:00-04:00',
    pageCount: 1,
    simulated: true,
    pages: [
      {
        pageNumber: 1,
        sectionLabel: 'Front Page',
        previewType: 'W2',
        highlightedRegions: [
          {
            id: 'reg-w2-box1',
            label: 'Box 1: Wages, tips, other comp.',
            xPercent: 62,
            yPercent: 28,
            widthPercent: 25,
            heightPercent: 7,
            extractedText: '152,500.00'
          },
          {
            id: 'reg-w2-box2',
            label: 'Box 2: Federal income tax withheld',
            xPercent: 62,
            yPercent: 37,
            widthPercent: 25,
            heightPercent: 7,
            extractedText: '31,250.00'
          }
        ]
      }
    ]
  },
  {
    id: 'doc-1099b-john',
    fileName: '1099B_John_Miller_Brokerage.pdf',
    documentType: 'Form 1099-B Broker Proceeds',
    uploadedAt: '2026-07-16T14:35:00-04:00',
    pageCount: 1,
    simulated: true,
    pages: [
      {
        pageNumber: 1,
        sectionLabel: 'Trades Schedule',
        previewType: '1099B',
        highlightedRegions: [
          {
            id: 'reg-1099b-box1d',
            label: 'Box 1d: Stock Proceeds',
            xPercent: 50,
            yPercent: 42,
            widthPercent: 28,
            heightPercent: 8,
            extractedText: '84,750.00'
          }
        ]
      }
    ]
  },
  {
    id: 'doc-1099int-john-chase',
    fileName: '1099INT_John_Chase.pdf',
    documentType: 'Form 1099-INT Interest Income',
    uploadedAt: '2026-07-16T14:32:00-04:00',
    pageCount: 1,
    simulated: true,
    pages: [
      {
        pageNumber: 1,
        sectionLabel: 'Statement summary',
        previewType: '1099INT',
        highlightedRegions: [
          {
            id: 'reg-chase-box1',
            label: 'Box 1: Interest income',
            xPercent: 55,
            yPercent: 22,
            widthPercent: 25,
            heightPercent: 6,
            extractedText: '1,200.00'
          }
        ]
      }
    ]
  },
  {
    id: 'doc-1099int-john-wells',
    fileName: '1099INT_John_Wells.pdf',
    documentType: 'Form 1099-INT Interest Income',
    uploadedAt: '2026-07-16T15:02:00-04:00',
    pageCount: 1,
    simulated: true,
    pages: [
      {
        pageNumber: 1,
        sectionLabel: 'Statement summary',
        previewType: '1099INT',
        highlightedRegions: [
          {
            id: 'reg-wells-box1',
            label: 'Box 1: Interest income',
            xPercent: 55,
            yPercent: 22,
            widthPercent: 25,
            heightPercent: 6,
            extractedText: '1,800.00'
          }
        ]
      }
    ]
  }
];

export const aiAnalyses: Record<string, AIAnalysis> = {
  'ai-wages': {
    id: 'ai-wages',
    confidenceState: 'HIGH',
    confidenceLabel: 'High Confidence',
    confidenceExplanation: 'W-2 Form matched standardized template. OCR character readability above 99%. EIN and SSN cross-verified successfully.',
    uncertaintyReason: null,
    suggestedNextAction: 'Verify Wages match Box 1 on W2 scan.',
    evidenceIds: ['doc-w2-john'],
    simulatedDisclosure: 'This is a simulation representing mock OCR output for research purposes.'
  },
  'ai-withholding': {
    id: 'ai-withholding',
    confidenceState: 'HIGH',
    confidenceLabel: 'High Confidence',
    confidenceExplanation: 'OCR reading matches Box 2 on Form W-2.',
    uncertaintyReason: null,
    suggestedNextAction: 'No actions required. Already verified by preparer.',
    evidenceIds: ['doc-w2-john'],
    simulatedDisclosure: 'This is a simulation representing mock OCR output.'
  },
  'ai-brokerage': {
    id: 'ai-brokerage',
    confidenceState: 'UNCERTAIN',
    confidenceLabel: 'Uncertain Extraction',
    confidenceExplanation: 'Document page contains slight blur and compression noise in Box 1d. Low OCR certainty score (72%).',
    uncertaintyReason: 'Document scan blurry. Digits "84,750" might be read as "81,750" or "84,150".',
    suggestedNextAction: 'Manually inspect Form 1099-B and correct if mismatch found.',
    evidenceIds: ['doc-1099b-john'],
    simulatedDisclosure: 'This is a simulation representing low-confidence OCR output.'
  },
  'ai-partnership': {
    id: 'ai-partnership',
    confidenceState: 'MISSING',
    confidenceLabel: 'Missing Evidence',
    confidenceExplanation: 'No Schedule K-1 document found in client upload repository matching John Miller.',
    uncertaintyReason: 'No matching file found with keyword "K-1" or "K1".',
    suggestedNextAction: 'Initiate a client document request for Schedule K-1.',
    evidenceIds: [],
    simulatedDisclosure: 'This is a simulation representing missing-document audits.'
  },
  'ai-interest': {
    id: 'ai-interest',
    confidenceState: 'CONFLICT',
    confidenceLabel: 'Conflicting Evidence',
    confidenceExplanation: 'Found two separate Form 1099-INT documents showing conflicting taxable interest totals for this taxpayer.',
    uncertaintyReason: 'Chase bank statement reports $1,200.00 while Wells Fargo reports $1,800.00. Sum of interest is $3,000.00, but form defaults to Chase only.',
    suggestedNextAction: 'Contact client to clarify interest sources or combine schedules.',
    evidenceIds: ['doc-1099int-john-chase', 'doc-1099int-john-wells'],
    simulatedDisclosure: 'This is a simulation representing document mapping conflicts.'
  },
  'ai-gross-sales': {
    id: 'ai-gross-sales',
    confidenceState: 'HIGH',
    confidenceLabel: 'High Confidence',
    confidenceExplanation: 'Matched client Schedule C ledger details.',
    uncertaintyReason: null,
    suggestedNextAction: 'No action. Locked by Marcus Vance.',
    evidenceIds: [],
    simulatedDisclosure: 'This is a simulation.'
  }
};

export const traceRecords: Record<string, TraceRecord> = {
  'f1040-line1z': {
    fieldId: 'f1040-line1z',
    sourceDocumentId: 'doc-w2-john',
    pageNumber: 1,
    sectionLabel: 'Wages',
    highlightedRegionId: 'reg-w2-box1',
    transformation: {
      type: 'DIRECT_MAPPING',
      plainLanguageSummary: 'Direct mapping from Employer W-2 wage statement Box 1.',
      formula: 'W-2 Box 1',
      steps: [
        {
          description: 'Locate W-2 Box 1 (Wages, tips, other comp.) on scan.',
          value: '$152,500.00'
        },
        {
          description: 'Map value directly to Form 1040 Wages field.',
          value: '$152,500.00'
        }
      ]
    },
    evidenceStatus: 'COMPLETE'
  },
  'f1040-line25a': {
    fieldId: 'f1040-line25a',
    sourceDocumentId: 'doc-w2-john',
    pageNumber: 1,
    sectionLabel: 'Withholding',
    highlightedRegionId: 'reg-w2-box2',
    transformation: {
      type: 'DIRECT_MAPPING',
      plainLanguageSummary: 'Direct mapping from W-2 statement Box 2.',
      formula: 'W-2 Box 2',
      steps: [
        {
          description: 'Read Box 2 value.',
          value: '$31,250.00'
        }
      ]
    },
    evidenceStatus: 'COMPLETE'
  },
  'f8949-proceeds': {
    fieldId: 'f8949-proceeds',
    sourceDocumentId: 'doc-1099b-john',
    pageNumber: 1,
    sectionLabel: 'Capital Gains',
    highlightedRegionId: 'reg-1099b-box1d',
    transformation: {
      type: 'DIRECT_MAPPING',
      plainLanguageSummary: 'Direct mapping from Form 1099-B Box 1d.',
      formula: '1099-B Box 1d',
      steps: [
        {
          description: 'Read Box 1d value (blurred scan).',
          value: '$84,750.00'
        }
      ]
    },
    evidenceStatus: 'UNCERTAIN'
  }
};
