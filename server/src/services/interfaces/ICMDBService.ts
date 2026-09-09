import type { CMDBData, ConfigurationItem, CIRelationship } from '../../models';

export interface ICMDBService {
  getCMDBData(): CMDBData;
  getItem(id: string): ConfigurationItem | undefined;
  getRelationshipsFor(id: string): CIRelationship[];
}
