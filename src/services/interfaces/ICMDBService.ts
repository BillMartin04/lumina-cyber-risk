import type { CMDBData } from '../../models';

export interface ICMDBService {
  getCMDBData(): Promise<CMDBData>;
}
