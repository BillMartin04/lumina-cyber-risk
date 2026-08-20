import { Router, Request, Response, NextFunction } from 'express';
import { IncidentTriggerService } from '../services/IncidentTriggerService';

const router = Router();

function wrap(fn: (req: Request, res: Response) => Promise<unknown>) {
  return (req: Request, res: Response, next: NextFunction) =>
    fn(req, res).catch(next);
}

router.get('/', wrap(async (_req, res) => {
  const data = await IncidentTriggerService.getAll();
  res.json({ success: true, data });
}));

router.post('/:id/acknowledge', wrap(async (req, res) => {
  const { acknowledgedBy } = req.body;
  if (!acknowledgedBy) {
    res.status(400).json({ success: false, error: 'acknowledgedBy is required' });
    return;
  }
  const trigger = await IncidentTriggerService.acknowledge(req.params.id, acknowledgedBy);
  res.json({ success: true, data: trigger });
}));

router.post('/:id/resolve', wrap(async (req, res) => {
  const { resolvedBy } = req.body;
  if (!resolvedBy) {
    res.status(400).json({ success: false, error: 'resolvedBy is required' });
    return;
  }
  const trigger = await IncidentTriggerService.resolve(req.params.id, resolvedBy);
  res.json({ success: true, data: trigger });
}));

router.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.message.includes('not found') ? 404
    : err.message.includes('already') ? 422 : 500;
  res.status(status).json({ success: false, error: err.message });
});

export default router;
