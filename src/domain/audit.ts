export interface AuditEntry {
  id: string;
  action: string;
  actor: string;
  actorRole: 'preparer' | 'reviewer' | 'client';
  timestamp: string;
  previousValue: string | null;
  newValue: string | null;
  reason: string | null;
}
