export type OnboardingStepStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'BLOCKED';

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  status: OnboardingStepStatus;
  required: boolean;
  urgency: 'HIGH' | 'MEDIUM' | 'LOW';
  linkedRequestId?: string;
  linkedQuestionId?: string;
  completedAt?: string;
}

export interface OnboardingProfile {
  clientId: string;
  firstLogin: boolean;
  welcomeAcknowledged: boolean;
  startedAt?: string;
  completedAt?: string;
  steps: OnboardingStep[];
  percentComplete: number;
}
