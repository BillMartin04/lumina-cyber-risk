import type { ActionItem, ActionItemsData } from '../models';

const BASE = import.meta.env.VITE_API_BASE ?? '';

async function apiFetch<T>(path: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}/api/action-items${path}`, opts);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Request failed: ${res.status}`);
  }
  const json = await res.json();
  return json.data as T;
}

function post<T>(path: string, body: Record<string, unknown>): Promise<T> {
  return apiFetch<T>(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

export interface IActionItemRepository {
  fetchAll(): Promise<ActionItemsData>;
  assign(id: string, assignee: string, actor: string, note?: string): Promise<ActionItem>;
  startProgress(id: string, actor: string, note?: string): Promise<ActionItem>;
  provideEvidence(id: string, actor: string, evidenceId: string, note?: string): Promise<ActionItem>;
  verify(id: string, actor: string, note?: string): Promise<ActionItem>;
  close(id: string, actor: string, note?: string): Promise<ActionItem>;
}

class ActionItemRepositoryImpl implements IActionItemRepository {
  fetchAll = () => apiFetch<ActionItemsData>('/');

  assign = (id: string, assignee: string, actor: string, note?: string) =>
    post<ActionItem>(`/${id}/assign`, { assignee, actor, note });

  startProgress = (id: string, actor: string, note?: string) =>
    post<ActionItem>(`/${id}/start-progress`, { actor, note });

  provideEvidence = (id: string, actor: string, evidenceId: string, note?: string) =>
    post<ActionItem>(`/${id}/provide-evidence`, { actor, evidenceId, note });

  verify = (id: string, actor: string, note?: string) =>
    post<ActionItem>(`/${id}/verify`, { actor, note });

  close = (id: string, actor: string, note?: string) =>
    post<ActionItem>(`/${id}/close`, { actor, note });
}

export const actionItemRepository: IActionItemRepository = new ActionItemRepositoryImpl();
