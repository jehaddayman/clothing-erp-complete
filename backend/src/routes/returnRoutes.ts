import { Router } from 'express';
import * as returnController from '../controllers/returnController';
import {
  createReturnValidator,
  updateReturnStatusValidator,
} from '../validators/returnValidators';
import { validate } from '../middleware/validate';
import { protect, authorize } from '../middleware/auth';

const router = Router();

router.use(protect);

router.get('/statistics', authorize('admin', 'accountant'), returnController.getStatistics);
router.get('/', returnController.listReturns);
router.get('/:id', returnController.getReturn);

router.post(
  '/',
  authorize('admin', 'sales_employee', 'inventory_manager'),
  createReturnValidator,
  validate,
  returnController.createReturn
);

router.patch(
  '/:id/status',
  authorize('admin', 'accountant', 'inventory_manager'),
  updateReturnStatusValidator,
  validate,
  returnController.updateStatus
);

export default router;
