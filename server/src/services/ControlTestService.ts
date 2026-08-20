import type { ControlTest, ControlTestsData } from '../models';
import type { IControlTestService } from './interfaces/IControlTestService';
import type { IControlTestRepository } from '../repositories/ControlTestRepository';
import { ControlTestRepository } from '../repositories/ControlTestRepository';

class ControlTestServiceImpl implements IControlTestService {
  constructor(private readonly repo: IControlTestRepository) {}

  async getAll(): Promise<ControlTestsData> {
    return this.repo.findAll();
  }

  async getById(id: string): Promise<ControlTest> {
    const test = await this.repo.findById(id);
    if (!test) throw new Error(`Control test ${id} not found`);
    return test;
  }

  async getByDomain(domain: string): Promise<ControlTest[]> {
    return this.repo.findByDomain(domain);
  }
}

export const ControlTestService: IControlTestService =
  new ControlTestServiceImpl(new ControlTestRepository());
