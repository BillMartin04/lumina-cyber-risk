import type { IncidentTrigger, IncidentTriggersData } from '../../models';

export interface IIncidentTriggerService {
  getAll(): Promise<IncidentTriggersData>;
  acknowledge(id: string, acknowledgedBy: string): Promise<IncidentTrigger>;
  resolve(id: string, resolvedBy: string): Promise<IncidentTrigger>;
}
