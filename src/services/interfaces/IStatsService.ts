import type { OverallStats, KRIWithDomain, RiskActionItem } from '../../models';

export interface IStatsService {
  getOverallStats(): OverallStats;
  getTopBreachingKRIs(limit?: number): KRIWithDomain[];
  getActionItems(limit?: number): RiskActionItem[];
}
