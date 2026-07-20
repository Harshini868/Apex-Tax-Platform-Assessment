export type ConfidenceState = 'HIGH' | 'UNCERTAIN' | 'CONFLICT' | 'MISSING';

export interface AIAnalysis {
  id: string;
  confidenceState: ConfidenceState;
  confidenceLabel: string;
  confidenceExplanation: string;
  uncertaintyReason: string | null;
  suggestedNextAction: string;
  evidenceIds: string[];
  simulatedDisclosure: string;
}
