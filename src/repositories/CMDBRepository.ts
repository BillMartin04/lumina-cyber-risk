import type { CMDBData } from '../models';

const BASE = import.meta.env.VITE_API_BASE ?? '';

export class CMDBRepository {
  async getCMDBData(): Promise<CMDBData> {
    const res = await fetch(`${BASE}/cmdb`);
    const json = await res.json();
    if (!json.success) throw new Error(json.error ?? 'Failed to fetch CMDB data');
    return json.data as CMDBData;
  }
}
