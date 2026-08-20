import type { ControlTest, ControlTestsData } from '../models';

const BASE = import.meta.env.VITE_API_BASE ?? '';

async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}/api/control-tests${path}`);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Request failed: ${res.status}`);
  }
  const json = await res.json();
  return json.data as T;
}

export interface IControlTestRepository {
  fetchAll(): Promise<ControlTestsData>;
  fetchByDomain(domain: string): Promise<ControlTest[]>;
}

class ControlTestRepositoryImpl implements IControlTestRepository {
  fetchAll      = () => apiFetch<ControlTestsData>('/');
  fetchByDomain = (domain: string) =>
    apiFetch<ControlTest[]>(`/domain/${encodeURIComponent(domain)}`);
}

export const controlTestRepository: IControlTestRepository = new ControlTestRepositoryImpl();
