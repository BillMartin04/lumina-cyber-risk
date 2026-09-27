import type { CMDBData } from '../models';
import { configurationItems, ciRelationships } from '../data/cmdbData';

export class CMDBRepository {
  getCMDBData(): CMDBData {
    const items = configurationItems;
    const relationships = ciRelationships;

    const critical = items.filter(i => i.businessCriticality === '1-critical').length;
    const high     = items.filter(i => i.businessCriticality === '2-high').length;
    const medium   = items.filter(i => i.businessCriticality === '3-medium').length;
    const low      = items.filter(i => i.businessCriticality === '4-low').length;

    const byClass: Record<string, number> = {};
    for (const item of items) {
      byClass[item.ciClass] = (byClass[item.ciClass] ?? 0) + 1;
    }

    const byEnvironment: Record<string, number> = {};
    for (const item of items) {
      byEnvironment[item.environment] = (byEnvironment[item.environment] ?? 0) + 1;
    }

    const stats = {
      total: items.length,
      critical,
      high,
      medium,
      low,
      operationalIssues: items.filter(i => i.operationalStatus !== 'operational').length,
      withRegulatoryScope: items.filter(i => i.regulatoryScope.length > 0).length,
      byClass,
      byEnvironment,
    };

    return { items, relationships, stats };
  }
}
