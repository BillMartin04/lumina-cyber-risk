import type { IControlTestService } from './interfaces/IControlTestService';
import { controlTestRepository } from '../repositories/ControlTestRepository';

class ControlTestServiceImpl implements IControlTestService {
  getAll      = () => controlTestRepository.fetchAll();
  getByDomain = (domain: string) => controlTestRepository.fetchByDomain(domain);
}

export const ControlTestService: IControlTestService = new ControlTestServiceImpl();
