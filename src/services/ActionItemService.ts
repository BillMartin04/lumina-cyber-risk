import type { IActionItemService } from './interfaces/IActionItemService';
import type { IActionItemRepository } from '../repositories/ActionItemRepository';
import { actionItemRepository } from '../repositories/ActionItemRepository';

class ActionItemServiceImpl implements IActionItemService {
  constructor(private readonly repo: IActionItemRepository) {}

  getAll          = () => this.repo.fetchAll();
  assign          = (id: string, assignee: string, actor: string, note?: string) =>
    this.repo.assign(id, assignee, actor, note);
  startProgress   = (id: string, actor: string, note?: string) =>
    this.repo.startProgress(id, actor, note);
  provideEvidence = (id: string, actor: string, evidenceId: string, note?: string) =>
    this.repo.provideEvidence(id, actor, evidenceId, note);
  verify          = (id: string, actor: string, note?: string) =>
    this.repo.verify(id, actor, note);
  close           = (id: string, actor: string, note?: string) =>
    this.repo.close(id, actor, note);
}

export const ActionItemService: IActionItemService = new ActionItemServiceImpl(actionItemRepository);
