import { CMDBRepository } from '../repositories/CMDBRepository';
import type { ICMDBService } from './interfaces/ICMDBService';
import type { CMDBData } from '../models';

const repo = new CMDBRepository();

class CMDBServiceImpl implements ICMDBService {
  async getCMDBData(): Promise<CMDBData> {
    return repo.getCMDBData();
  }
}

export const CMDBService = new CMDBServiceImpl();
