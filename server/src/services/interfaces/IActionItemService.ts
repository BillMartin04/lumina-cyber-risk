import type { ActionItem, ActionItemsData } from '../../models';

export interface IActionItemService {
  getAll(): Promise<ActionItemsData>;
  getById(id: string): Promise<ActionItem>;
  assign(id: string, assignee: string, actor: string, note?: string): Promise<ActionItem>;
  startProgress(id: string, actor: string, note?: string): Promise<ActionItem>;
  provideEvidence(id: string, actor: string, evidenceId: string, note?: string): Promise<ActionItem>;
  verify(id: string, actor: string, note?: string): Promise<ActionItem>;
  close(id: string, actor: string, note?: string): Promise<ActionItem>;
}
