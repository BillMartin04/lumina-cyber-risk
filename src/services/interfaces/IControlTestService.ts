import type { ControlTest, ControlTestsData } from '../../models';

export interface IControlTestService {
  getAll(): Promise<ControlTestsData>;
  getByDomain(domain: string): Promise<ControlTest[]>;
}
