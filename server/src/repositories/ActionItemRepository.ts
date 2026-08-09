import { v4 as uuid } from 'uuid';
import type {
  ActionItem, ActionItemStatus, ActionItemsData, AuditLogEntry,
} from '../models';
import { actionItemsData } from '../data/actionItemsData';

export interface IActionItemRepository {
  findAll(): Promise<ActionItemsData>;
  findById(id: string): Promise<ActionItem | null>;
  transition(
    id: string,
    toStatus: ActionItemStatus,
    actor: string,
    note?: string,
    evidenceId?: string,
    assignee?: string,
  ): Promise<ActionItem>;
}

function buildStats(items: ActionItem[]): ActionItemsData['stats'] {
  const now = new Date();
  return {
    total:            items.length,
    open:             items.filter(i => i.status === 'open').length,
    assigned:         items.filter(i => i.status === 'assigned').length,
    inProgress:       items.filter(i => i.status === 'in-progress').length,
    evidenceProvided: items.filter(i => i.status === 'evidence-provided').length,
    verified:         items.filter(i => i.status === 'verified').length,
    closed:           items.filter(i => i.status === 'closed').length,
    overdue:          items.filter(i =>
      i.dueDate && new Date(i.dueDate) < now && i.status !== 'closed'
    ).length,
  };
}

export class ActionItemRepository implements IActionItemRepository {
  private items: ActionItem[] = actionItemsData.map(i => ({ ...i }));

  async findAll(): Promise<ActionItemsData> {
    return { items: this.items, stats: buildStats(this.items) };
  }

  async findById(id: string): Promise<ActionItem | null> {
    return this.items.find(i => i.id === id) ?? null;
  }

  async transition(
    id: string,
    toStatus: ActionItemStatus,
    actor: string,
    note?: string,
    evidenceId?: string,
    assignee?: string,
  ): Promise<ActionItem> {
    const item = this.items.find(i => i.id === id);
    if (!item) throw new Error(`Action item ${id} not found`);

    const entry: AuditLogEntry = {
      id:         uuid(),
      timestamp:  new Date().toISOString(),
      actor,
      fromStatus: item.status,
      toStatus,
      note,
      evidenceId,
    };

    item.status    = toStatus;
    item.updatedAt = entry.timestamp;
    if (evidenceId) item.evidenceId = evidenceId;
    if (assignee)   item.assignee   = assignee;
    if (toStatus === 'closed') item.resolvedAt = entry.timestamp;
    item.auditLog  = [...item.auditLog, entry];

    return { ...item };
  }
}
