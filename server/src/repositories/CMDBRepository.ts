import { configurationItems, ciRelationships } from '../data/cmdbData';
import type { ConfigurationItem, CIRelationship } from '../models';

export class CMDBRepository {
  getAll(): ConfigurationItem[] {
    return configurationItems;
  }

  getById(id: string): ConfigurationItem | undefined {
    return configurationItems.find(ci => ci.id === id);
  }

  getByCriticality(criticality: string): ConfigurationItem[] {
    return configurationItems.filter(ci => ci.businessCriticality === criticality);
  }

  getByClass(ciClass: string): ConfigurationItem[] {
    return configurationItems.filter(ci => ci.ciClass === ciClass);
  }

  getByEnvironment(environment: string): ConfigurationItem[] {
    return configurationItems.filter(ci => ci.environment === environment);
  }

  getByRegulatoryScope(scope: string): ConfigurationItem[] {
    return configurationItems.filter(ci => ci.regulatoryScope.includes(scope));
  }

  getAllRelationships(): CIRelationship[] {
    return ciRelationships;
  }

  getRelationshipsFor(id: string): CIRelationship[] {
    return ciRelationships.filter(r => r.sourceId === id || r.targetId === id);
  }
}
