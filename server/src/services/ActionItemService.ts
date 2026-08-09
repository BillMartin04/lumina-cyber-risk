import type { ActionItem, ActionItemsData, ActionItemStatus } from '../models';
import type { IActionItemService } from './interfaces/IActionItemService';
import type { IActionItemRepository } from '../repositories/ActionItemRepository';

const TRANSITIONS: Record<ActionItemStatus, ActionItemStatus[]> = {
  'open':              ['assigned'],
  'assigned':          ['in-progress'],
  'in-progress':       ['evidence-provided'],
  'evidence-provided': ['verified'],
  'verified':          ['closed'],
  'closed':            [],
};

export class ActionItemService implements IActionItemService {
  constructor(private readonly repo: IActionItemRepository) {}

  async getAll(): Promise<ActionItemsData> {
    return this.repo.findAll();
  }

  async getById(id: string): Promise<ActionItem> {
    const item = await this.repo.findById(id);
    if (!item) throw new Error(`Action item ${id} not found`);
    return item;
  }

  private assertTransition(current: ActionItemStatus, next: ActionItemStatus): void {
    if (!TRANSITIONS[current].includes(next)) {
      throw new Error(
        `Invalid transition: cannot move from '${current}' to '${next}'`,
      );
    }
  }

  async assign(id: string, assignee: string, actor: string, note?: string): Promise<ActionItem> {
    const item = await this.getById(id);
    this.assertTransition(item.status, 'assigned');
    return this.repo.transition(id, 'assigned', actor, note, undefined, assignee);
  }

  async startProgress(id: string, actor: string, note?: string): Promise<ActionItem> {
    const item = await this.getById(id);
    this.assertTransition(item.status, 'in-progress');
    return this.repo.transition(id, 'in-progress', actor, note);
  }

  async provideEvidence(id: string, actor: string, evidenceId: string, note?: string): Promise<ActionItem> {
    const item = await this.getById(id);
    this.assertTransition(item.status, 'evidence-provided');
    if (!evidenceId.trim()) throw new Error('evidenceId is required to provide evidence');
    return this.repo.transition(id, 'evidence-provided', actor, note, evidenceId);
  }

  async verify(id: string, actor: string, note?: string): Promise<ActionItem> {
    const item = await this.getById(id);
    this.assertTransition(item.status, 'verified');
    if (!item.evidenceId) throw new Error('Cannot verify: no evidence ID on record');
    return this.repo.transition(id, 'verified', actor, note);
  }

  async close(id: string, actor: string, note?: string): Promise<ActionItem> {
    const item = await this.getById(id);
    this.assertTransition(item.status, 'closed');
    if (!item.evidenceId) throw new Error('Cannot close: evidence must be provided and verified first');
    return this.repo.transition(id, 'closed', actor, note);
  }
}
