import type { OverallStats, KRIWithDomain, RiskActionItem } from '../models';
import type { IDomainRepository } from '../repositories/DomainRepository';
import { domainRepository } from '../repositories/DomainRepository';
import type { IStatsService } from './interfaces/IStatsService';

const SEVERITY_ORDER: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };

class StatsServiceImpl implements IStatsService {
  constructor(private readonly repo: IDomainRepository) {}

  getOverallStats(): OverallStats {
    const domains    = this.repo.findAll();
    const allRisks   = domains.flatMap(d => d.risks);
    const allIssues  = allRisks.flatMap(r => r.issues);
    const allControls= allRisks.flatMap(r => r.controls);

    return {
      totalRisks:          allRisks.length,
      critical:            allRisks.filter(r => r.residualRisk === 'critical').length,
      high:                allRisks.filter(r => r.residualRisk === 'high').length,
      medium:              allRisks.filter(r => r.residualRisk === 'medium').length,
      low:                 allRisks.filter(r => r.residualRisk === 'low').length,
      openIssues:          allIssues.filter(i => i.status !== 'closed').length,
      overdueIssues:       allIssues.filter(i => (i.daysOverdue ?? 0) > 0).length,
      totalControls:       allControls.length,
      implementedControls: allControls.filter(c => c.status === 'implemented').length,
      partialControls:     allControls.filter(c => c.status === 'partial').length,
      overallScore: domains.length > 0
        ? Math.round(domains.reduce((sum, d) => sum + d.riskScore, 0) / domains.length)
        : 0,
    };
  }

  getTopBreachingKRIs(limit = 6): KRIWithDomain[] {
    return this.repo.findAll()
      .flatMap(d => d.kris.map(k => ({ ...k, domainName: d.name, domainColor: d.color })))
      .filter(k => k.status === 'breach')
      .slice(0, limit);
  }

  getActionItems(limit = 8): RiskActionItem[] {
    return this.repo.findAll()
      .flatMap(d => d.risks.map(r => ({ ...r, domainId: d.id, domainName: d.name })))
      .flatMap(r => r.issues.map(i => ({
        ...i,
        riskName:   r.name,
        domainId:   r.domainId,
        domainName: r.domainName,
        riskId:     r.id,
      })))
      .filter(i => i.status !== 'closed')
      .sort((a, b) => (SEVERITY_ORDER[a.severity] ?? 9) - (SEVERITY_ORDER[b.severity] ?? 9))
      .slice(0, limit);
  }
}

export const StatsService: IStatsService = new StatsServiceImpl(domainRepository);
