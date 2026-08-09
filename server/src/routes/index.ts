import { Router }           from 'express';
import { domainsRouter }     from './domains.routes';
import { risksRouter }       from './risks.routes';
import { governanceRouter }  from './governance.routes';
import { aiGovernanceRouter } from './ai-governance.routes';
import { resilienceRouter }  from './resilience.routes';
import { evidenceRouter }    from './evidence.routes';
import { workflowRouter }    from './workflow.routes';
import { queueRouter }       from './queue.routes';
import { aiRouter }          from './ai.routes';
import { identityRouter }    from './identity.routes';
import { aiRegistryRouter }        from './ai-registry.routes';
import { dataSovereigntyRouter }   from './data-sovereignty.routes';
import { scoringRouter }           from './scoring.routes';
import { aiFinOpsRouter }          from './ai-finops.routes';
import { architectureRouter }      from './architecture.routes';
import actionItemsRouter            from './action-items.routes';

export const router = Router();

router.get('/health', (_req, res) =>
  res.json({ success: true, data: { status: 'ok', timestamp: new Date().toISOString() } }));

router.use('/domains',       domainsRouter);
router.use('/risks',         risksRouter);
router.use('/governance',    governanceRouter);
router.use('/ai-governance', aiGovernanceRouter);
router.use('/resilience',    resilienceRouter);
router.use('/evidence',      evidenceRouter);
router.use('/workflow',      workflowRouter);
router.use('/queue',         queueRouter);
router.use('/ai',            aiRouter);
router.use('/identities',    identityRouter);
router.use('/ai-registry',        aiRegistryRouter);
router.use('/data-sovereignty',   dataSovereigntyRouter);
router.use('/scoring',            scoringRouter);
router.use('/ai-finops',          aiFinOpsRouter);
router.use('/architecture',       architectureRouter);
router.use('/action-items',       actionItemsRouter);
