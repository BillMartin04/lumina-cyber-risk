import type { ControlTest, ControlTestsData, ControlTestStats } from '../models';
import { controlTestData } from '../data/controlTestData';

export interface IControlTestRepository {
  findAll(): Promise<ControlTestsData>;
  findById(id: string): Promise<ControlTest | null>;
  findByDomain(domain: string): Promise<ControlTest[]>;
}

function buildStats(tests: ControlTest[]): ControlTestStats {
  const now = new Date();
  const total   = tests.length;
  const pass    = tests.filter(t => t.result === 'pass').length;
  const partial = tests.filter(t => t.result === 'partial').length;
  const fail    = tests.filter(t => t.result === 'fail').length;
  const avgScore = total > 0
    ? Math.round(tests.reduce((sum, t) => sum + t.score, 0) / total)
    : 0;
  const overdueTests = tests.filter(t => new Date(t.nextTestDue) < now).length;
  return { total, pass, partial, fail, avgScore, overdueTests };
}

export class ControlTestRepository implements IControlTestRepository {
  private tests: ControlTest[] = controlTestData.map(t => ({ ...t }));

  async findAll(): Promise<ControlTestsData> {
    return { tests: this.tests, stats: buildStats(this.tests) };
  }

  async findById(id: string): Promise<ControlTest | null> {
    return this.tests.find(t => t.id === id) ?? null;
  }

  async findByDomain(domain: string): Promise<ControlTest[]> {
    return this.tests.filter(t => t.domain === domain);
  }
}
