import type { IncidentTrigger, IncidentTriggersData } from '../models';
import type { IIncidentTriggerService } from './interfaces/IIncidentTriggerService';
import { IncidentTriggerRepository } from '../repositories/IncidentTriggerRepository';

class IncidentTriggerServiceImpl implements IIncidentTriggerService {
  constructor(private readonly repo = new IncidentTriggerRepository()) {}

  getAll(): Promise<IncidentTriggersData> {
    return this.repo.findAll();
  }

  acknowledge(id: string, acknowledgedBy: string): Promise<IncidentTrigger> {
    return this.repo.acknowledge(id, acknowledgedBy);
  }

  resolve(id: string, resolvedBy: string): Promise<IncidentTrigger> {
    return this.repo.resolve(id, resolvedBy);
  }
}

export const IncidentTriggerService: IIncidentTriggerService = new IncidentTriggerServiceImpl();
