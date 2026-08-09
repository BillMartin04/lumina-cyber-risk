import { Router, Request, Response, NextFunction } from 'express';
import { ActionItemService } from '../services/ActionItemService';
import { ActionItemRepository } from '../repositories/ActionItemRepository';

const router = Router();
const service = new ActionItemService(new ActionItemRepository());

function wrap(fn: (req: Request, res: Response) => Promise<unknown>) {
  return (req: Request, res: Response, next: NextFunction) =>
    fn(req, res).catch(next);
}

router.get('/', wrap(async (_req, res) => {
  const data = await service.getAll();
  res.json({ success: true, data });
}));

router.get('/:id', wrap(async (req, res) => {
  const item = await service.getById(req.params.id);
  res.json({ success: true, data: item });
}));

router.post('/:id/assign', wrap(async (req, res) => {
  const { assignee, actor, note } = req.body;
  if (!assignee || !actor) {
    res.status(400).json({ success: false, error: 'assignee and actor are required' });
    return;
  }
  const item = await service.assign(req.params.id, assignee, actor, note);
  res.json({ success: true, data: item });
}));

router.post('/:id/start-progress', wrap(async (req, res) => {
  const { actor, note } = req.body;
  if (!actor) { res.status(400).json({ success: false, error: 'actor is required' }); return; }
  const item = await service.startProgress(req.params.id, actor, note);
  res.json({ success: true, data: item });
}));

router.post('/:id/provide-evidence', wrap(async (req, res) => {
  const { actor, evidenceId, note } = req.body;
  if (!actor || !evidenceId) {
    res.status(400).json({ success: false, error: 'actor and evidenceId are required' });
    return;
  }
  const item = await service.provideEvidence(req.params.id, actor, evidenceId, note);
  res.json({ success: true, data: item });
}));

router.post('/:id/verify', wrap(async (req, res) => {
  const { actor, note } = req.body;
  if (!actor) { res.status(400).json({ success: false, error: 'actor is required' }); return; }
  const item = await service.verify(req.params.id, actor, note);
  res.json({ success: true, data: item });
}));

router.post('/:id/close', wrap(async (req, res) => {
  const { actor, note } = req.body;
  if (!actor) { res.status(400).json({ success: false, error: 'actor is required' }); return; }
  const item = await service.close(req.params.id, actor, note);
  res.json({ success: true, data: item });
}));

router.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.message.includes('not found') ? 404
    : err.message.startsWith('Invalid transition') || err.message.startsWith('Cannot') ? 422
    : 500;
  res.status(status).json({ error: err.message });
});

export default router;
