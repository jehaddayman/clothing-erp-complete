import { Router } from 'express';
import * as customerController from '../controllers/customerController';
import {
  createCustomerValidator,
  updateCustomerValidator,
  addNoteValidator,
} from '../validators/customerValidators';
import { validate } from '../middleware/validate';
import { protect, authorize } from '../middleware/auth';

const router = Router();

router.use(protect);

router.get('/analytics', customerController.getAnalytics);
router.get('/', customerController.listCustomers);
router.get('/:id', customerController.getCustomer);

router.post(
  '/',
  authorize('admin', 'sales_employee'),
  createCustomerValidator,
  validate,
  customerController.createCustomer
);

router.put(
  '/:id',
  authorize('admin', 'sales_employee'),
  updateCustomerValidator,
  validate,
  customerController.updateCustomer
);

router.post(
  '/:id/notes',
  authorize('admin', 'sales_employee'),
  addNoteValidator,
  validate,
  customerController.addNote
);

router.delete('/:id', authorize('admin'), customerController.deactivateCustomer);

export default router;
