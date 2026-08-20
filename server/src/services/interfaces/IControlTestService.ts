import type { ControlTest, ControlTestsData } from '../../models';

export interface IControlTestService {
  getAll(): Promise<ControlTestsData>;
  getById(id: string): Promise<ControlTest>;
  getByDomain(domain: string): Promise<ControlTest[]>;
}
