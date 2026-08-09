import { useMemo } from 'react';
import { DomainService }  from '../services/DomainService';
import { StatsService }   from '../services/StatsService';
import type { Domain, OverallStats, KRIWithDomain, RiskActionItem } from '../models';

export interface DashboardViewModel {
  domains:     Domain[];
  stats:       OverallStats;
  topKRIs:     KRIWithDomain[];
  actionItems: RiskActionItem[];
}

export function useDashboard(): DashboardViewModel {
  const domains     = useMemo(() => DomainService.getAll(),                []);
  const stats       = useMemo(() => StatsService.getOverallStats(),        []);
  const topKRIs     = useMemo(() => StatsService.getTopBreachingKRIs(),    []);
  const actionItems = useMemo(() => StatsService.getActionItems(),         []);

  return { domains, stats, topKRIs, actionItems };
}
