import { Router } from 'express';
import { CMDBRepository } from '../repositories/CMDBRepository';
import { CMDBService } from '../services/CMDBService';

const repo    = new CMDBRepository();
const service = new CMDBService(repo);

export const cmdbRouter = Router();

cmdbRouter.get('/', (_req, res) => {
  try {
    const data = service.getCMDBData();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to load CMDB data' });
  }
});

cmdbRouter.get('/items/:id', (req, res) => {
  const item = service.getItem(req.params.id);
  if (!item) return res.status(404).json({ success: false, error: 'Configuration item not found' });
  const relationships = service.getRelationshipsFor(req.params.id);
  res.json({ success: true, data: { item, relationships } });
});
