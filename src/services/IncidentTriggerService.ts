import type { IIncidentTriggerService } from './interfaces/IIncidentTriggerService';
import { incidentTriggerRepository } from '../repositories/IncidentTriggerRepository';

class IncidentTriggerServiceImpl implements IIncidentTriggerService {
  getAll        = () => incidentTriggerRepository.fetchAll();
  acknowledge   = (id: string, acknowledgedBy: string) =>
    incidentTriggerRepository.acknowledge(id, acknowledgedBy);
  resolve       = (id: string, resolvedBy: string) =>
    incidentTriggerRepository.resolve(id, resolvedBy);
}

export const IncidentTriggerService: IIncidentTriggerService = new IncidentTriggerServiceImpl();
