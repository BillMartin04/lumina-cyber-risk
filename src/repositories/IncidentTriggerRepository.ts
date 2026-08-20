import type { IncidentTrigger, IncidentTriggersData } from '../models';

const BASE = import.meta.env.VITE_API_BASE ?? '';

async function apiFetch<T>(path: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}/api/incident-triggers${path}`, opts);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Request failed: ${res.status}`);
  }
  const json = await res.json();
  return json.data as T;
}

function post<T>(path: string, body: Record<string, string>): Promise<T> {
  return apiFetch<T>(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

export interface IIncidentTriggerRepository {
  fetchAll(): Promise<IncidentTriggersData>;
  acknowledge(id: string, acknowledgedBy: string): Promise<IncidentTrigger>;
  resolve(id: string, resolvedBy: string): Promise<IncidentTrigger>;
}

class IncidentTriggerRepositoryImpl implements IIncidentTriggerRepository {
  fetchAll = () => apiFetch<IncidentTriggersData>('/');
  acknowledge = (id: string, acknowledgedBy: string) =>
    post<IncidentTrigger>(`/${id}/acknowledge`, { acknowledgedBy });
  resolve = (id: string, resolvedBy: string) =>
    post<IncidentTrigger>(`/${id}/resolve`, { resolvedBy });
}

export const incidentTriggerRepository: IIncidentTriggerRepository =
  new IncidentTriggerRepositoryImpl();
