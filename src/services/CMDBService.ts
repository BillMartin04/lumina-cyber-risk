import { CMDBRepository } from '../repositories/CMDBRepository';
import type { CMDBData } from '../models';

const repo = new CMDBRepository();

class CMDBServiceImpl {
  getCMDBData(): CMDBData {
    return repo.getCMDBData();
  }
}

export const CMDBService = new CMDBServiceImpl();
