// Fictional platform roles system

// The three primary interactive preview roles for evaluator walkthroughs
export type PreviewRole = 'preparer' | 'reviewer' | 'client';

// The six full domain roles defined in the tax platform specification
export type DomainRole =
  | 'individualTaxpayer'
  | 'businessOwner'
  | 'preparer'
  | 'reviewer'
  | 'firmAdministrator'
  | 'seasonalStaff';

export interface UserProfile {
  id: string;
  name: string;
  avatarUrl?: string;
  domainRole: DomainRole;
  isFirmEmployee: boolean;
  hasPersonalReturn: boolean;
}
