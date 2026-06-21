import { Router } from 'express';
import * as planningController from '../controllers/planningController';
import { createPlanValidator } from '../validators/planningValidators';
import { validate } from '../middleware/validate';
import { protect, authorize } from '../middleware/auth';

const router = Router();

router.use(protect);
router.use(authorize('admin', 'accountant'));

router.get('/forecast/sales', planningController.getSalesForecast);
router.get('/kpis', planningController.getKpis);

router.get('/', planningController.listPlans);
router.get('/:id', planningController.getPlan);
router.get('/:id/progress', planningController.getPlanProgress);
router.post('/', createPlanValidator, validate, planningController.createPlan);
router.put('/:id', planningController.updatePlan);

export default router;
