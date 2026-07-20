export interface TransformationStep {
  description: string;
  value: number | string;
}

export interface Transformation {
  type: 'DIRECT_MAPPING' | 'SUM' | 'DIFFERENCE' | 'COMPLEX';
  plainLanguageSummary: string;
  formula: string;
  steps: TransformationStep[];
}

export interface TraceRecord {
  fieldId: string;
  sourceDocumentId: string;
  pageNumber: number;
  sectionLabel: string;
  highlightedRegionId: string;
  transformation: Transformation;
  evidenceStatus: 'COMPLETE' | 'UNCERTAIN' | 'CONFLICT' | 'MISSING';
}
