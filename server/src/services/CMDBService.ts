import { CMDBRepository } from '../repositories/CMDBRepository';
import type { ICMDBService } from './interfaces/ICMDBService';
import type { CMDBData, ConfigurationItem, CIRelationship, CMDBStats } from '../models';

export class CMDBService implements ICMDBService {
  constructor(private repo: CMDBRepository) {}

  getItem(id: string): ConfigurationItem | undefined {
    return this.repo.getById(id);
  }

  getRelationshipsFor(id: string): CIRelationship[] {
    return this.repo.getRelationshipsFor(id);
  }

  getCMDBData(): CMDBData {
    const items = this.repo.getAll();
    const relationships = this.repo.getAllRelationships();

    const byClass: Record<string, number> = {};
    const byEnvironment: Record<string, number> = {};
    let critical = 0, high = 0, medium = 0, low = 0, operationalIssues = 0, withRegulatoryScope = 0;

    for (const ci of items) {
      switch (ci.businessCriticality) {
        case '1-critical': critical++; break;
        case '2-high':     high++;     break;
        case '3-medium':   medium++;   break;
        case '4-low':      low++;      break;
      }
      if (ci.operationalStatus !== 'operational') operationalIssues++;
      if (ci.regulatoryScope.length > 0) withRegulatoryScope++;

      byClass[ci.ciClass] = (byClass[ci.ciClass] ?? 0) + 1;
      byEnvironment[ci.environment] = (byEnvironment[ci.environment] ?? 0) + 1;
    }

    const stats: CMDBStats = {
      total: items.length,
      critical,
      high,
      medium,
      low,
      operationalIssues,
      withRegulatoryScope,
      byClass,
      byEnvironment,
    };

    return { items, relationships, stats };
  }
}
