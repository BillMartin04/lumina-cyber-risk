import { Router, Request, Response, NextFunction } from 'express';
import { ControlTestService } from '../services/ControlTestService';

const router = Router();

function wrap(fn: (req: Request, res: Response) => Promise<unknown>) {
  return (req: Request, res: Response, next: NextFunction) =>
    fn(req, res).catch(next);
}

router.get('/', wrap(async (_req, res) => {
  const data = await ControlTestService.getAll();
  res.json({ success: true, data });
}));

router.get('/:id', wrap(async (req, res) => {
  const test = await ControlTestService.getById(req.params.id);
  res.json({ success: true, data: test });
}));

router.get('/domain/:domain', wrap(async (req, res) => {
  const tests = await ControlTestService.getByDomain(req.params.domain);
  res.json({ success: true, data: tests });
}));

router.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.message.includes('not found') ? 404 : 500;
  res.status(status).json({ success: false, error: err.message });
});

export default router;
