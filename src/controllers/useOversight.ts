import { useMemo } from 'react';
import { DomainService } from '../services/DomainService';
import { StatsService } from '../services/StatsService';
import type { Domain, OverallStats, KRIWithDomain, RiskActionItem } from '../models';

export interface RegulatoryFramework {
  id: string;
  name: string;
  fullName: string;
  coverage: number;  // % of controls mapped
  compliant: number; // % compliant of mapped
  gaps: number;
  nextReview: string;
  status: 'on-track' | 'at-risk' | 'breach';
}

export interface DomainOversightRow {
  domain: Domain;
  score: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  controlPct: number;
  kriBreaches: number;
  openIssues: number;
}

export interface OversightViewModel {
  stats: OverallStats;
  domains: Domain[];
  domainRows: DomainOversightRow[];
  topKRIs: KRIWithDomain[];
  escalatedIssues: RiskActionItem[];
  frameworks: RegulatoryFramework[];
  controlBreakdown: { implemented: number; partial: number; notImplemented: number; total: number };
}

const FRAMEWORKS: RegulatoryFramework[] = [
  { id: 'sox',         name: 'SOX',          fullName: 'Sarbanes-Oxley Act',                  coverage: 88, compliant: 91, gaps: 4,  nextReview: 'Dec 2026', status: 'on-track' },
  { id: 'nist-csf',   name: 'NIST CSF',      fullName: 'NIST Cybersecurity Framework 2.0',    coverage: 74, compliant: 78, gaps: 12, nextReview: 'Oct 2026', status: 'at-risk'  },
  { id: 'iso27001',   name: 'ISO 27001',      fullName: 'ISO/IEC 27001:2022',                  coverage: 81, compliant: 84, gaps: 8,  nextReview: 'Jan 2027', status: 'on-track' },
  { id: 'gdpr',       name: 'GDPR',           fullName: 'General Data Protection Regulation',  coverage: 92, compliant: 89, gaps: 5,  nextReview: 'Nov 2026', status: 'at-risk'  },
  { id: 'ccpa',       name: 'CCPA',           fullName: 'CA Consumer Privacy Act',             coverage: 85, compliant: 93, gaps: 3,  nextReview: 'Feb 2027', status: 'on-track' },
  { id: 'glba',       name: 'GLBA',           fullName: 'Gramm-Leach-Bliley Act',             coverage: 95, compliant: 96, gaps: 2,  nextReview: 'Mar 2027', status: 'on-track' },
  { id: 'aml',        name: 'AML',            fullName: 'Anti-Money Laundering (FinCEN)',      coverage: 79, compliant: 82, gaps: 9,  nextReview: 'Sep 2026', status: 'at-risk'  },
  { id: 'pci-dss',   name: 'PCI-DSS',         fullName: 'PCI Data Security Standard v4.0',    coverage: 68, compliant: 71, gaps: 18, nextReview: 'Sep 2026', status: 'breach'   },
  { id: 'nist-ai',   name: 'NIST AI RMF',     fullName: 'NIST AI Risk Management Framework',  coverage: 55, compliant: 62, gaps: 14, nextReview: 'Oct 2026', status: 'at-risk'  },
  { id: 'fincen',    name: 'FinCEN',           fullName: 'FinCEN Reporting Requirements',      coverage: 88, compliant: 90, gaps: 4,  nextReview: 'Dec 2026', status: 'on-track' },
];

export function useOversight(): OversightViewModel {
  const domains = useMemo(() => DomainService.getAll(), []);
  const stats   = useMemo(() => StatsService.getOverallStats(), []);
  const topKRIs = useMemo(() => StatsService.getTopBreachingKRIs(8), []);
  const allItems = useMemo(() => StatsService.getActionItems(50), []);

  const domainRows = useMemo<DomainOversightRow[]>(() =>
    domains.map(d => {
      const controls = d.risks.flatMap(r => r.controls);
      const implemented = controls.filter(c => c.status === 'implemented').length;
      const controlPct = controls.length > 0 ? Math.round((implemented / controls.length) * 100) : 0;
      const kriBreaches = d.kris.filter(k => k.status === 'breach').length;
      const issues = d.risks.flatMap(r => r.issues).filter(i => i.status !== 'closed');
      return {
        domain: d,
        score: d.riskScore,
        critical: d.risks.filter(r => r.residualRisk === 'critical').length,
        high:     d.risks.filter(r => r.residualRisk === 'high').length,
        medium:   d.risks.filter(r => r.residualRisk === 'medium').length,
        low:      d.risks.filter(r => r.residualRisk === 'low').length,
        controlPct,
        kriBreaches,
        openIssues: issues.length,
      };
    }), [domains]);

  const escalatedIssues = useMemo(() =>
    allItems.filter(i => i.severity === 'critical' || i.severity === 'high' || (i.daysOverdue ?? 0) > 0)
      .slice(0, 10),
    [allItems]);

  const controlBreakdown = useMemo(() => {
    const all = domains.flatMap(d => d.risks.flatMap(r => r.controls));
    return {
      total:          all.length,
      implemented:    all.filter(c => c.status === 'implemented').length,
      partial:        all.filter(c => c.status === 'partial').length,
      notImplemented: all.filter(c => c.status === 'not-implemented').length,
    };
  }, [domains]);

  return { stats, domains, domainRows, topKRIs, escalatedIssues, frameworks: FRAMEWORKS, controlBreakdown };
}
