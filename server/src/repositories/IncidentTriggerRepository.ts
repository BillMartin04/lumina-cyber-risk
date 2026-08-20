import type { IncidentTrigger, IncidentTriggersData, IncidentTriggerStats, IncidentTriggerStatus } from '../models';
import { incidentTriggerData } from '../data/incidentTriggerData';

export interface IIncidentTriggerRepository {
  findAll(): Promise<IncidentTriggersData>;
  findById(id: string): Promise<IncidentTrigger | null>;
  acknowledge(id: string, acknowledgedBy: string): Promise<IncidentTrigger>;
  resolve(id: string, resolvedBy: string): Promise<IncidentTrigger>;
}

function buildStats(triggers: IncidentTrigger[]): IncidentTriggerStats {
  return {
    total:        triggers.length,
    active:       triggers.filter(t => t.status === 'active').length,
    acknowledged: triggers.filter(t => t.status === 'acknowledged').length,
    resolved:     triggers.filter(t => t.status === 'resolved').length,
    critical:     triggers.filter(t => t.severity === 'critical').length,
  };
}

export class IncidentTriggerRepository implements IIncidentTriggerRepository {
  private triggers: IncidentTrigger[] = incidentTriggerData.map(t => ({ ...t }));

  async findAll(): Promise<IncidentTriggersData> {
    return { triggers: this.triggers, stats: buildStats(this.triggers) };
  }

  async findById(id: string): Promise<IncidentTrigger | null> {
    return this.triggers.find(t => t.id === id) ?? null;
  }

  async acknowledge(id: string, acknowledgedBy: string): Promise<IncidentTrigger> {
    const trigger = this.triggers.find(t => t.id === id);
    if (!trigger) throw new Error(`Trigger ${id} not found`);
    if (trigger.status !== 'active') throw new Error(`Trigger is already ${trigger.status}`);
    trigger.status          = 'acknowledged';
    trigger.acknowledgedBy  = acknowledgedBy;
    trigger.acknowledgedAt  = new Date().toISOString();
    return { ...trigger };
  }

  async resolve(id: string, resolvedBy: string): Promise<IncidentTrigger> {
    const trigger = this.triggers.find(t => t.id === id);
    if (!trigger) throw new Error(`Trigger ${id} not found`);
    if (trigger.status === 'resolved') throw new Error('Trigger is already resolved');
    trigger.status      = 'resolved';
    trigger.resolvedBy  = resolvedBy;
    trigger.resolvedAt  = new Date().toISOString();
    return { ...trigger };
  }
}
