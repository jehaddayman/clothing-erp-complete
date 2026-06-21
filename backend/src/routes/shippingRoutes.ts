import { Router } from 'express';
import * as shippingController from '../controllers/shippingController';
import {
  createShipmentValidator,
  updateShipmentStatusValidator,
} from '../validators/shippingValidators';
import { validate } from '../middleware/validate';
import { protect, authorize } from '../middleware/auth';

const router = Router();

router.use(protect);

router.get('/performance', authorize('admin', 'accountant'), shippingController.getPerformance);
router.get('/order/:orderId', shippingController.getByOrder);
router.get('/', shippingController.listShipments);

router.post(
  '/',
  authorize('admin', 'sales_employee', 'inventory_manager'),
  createShipmentValidator,
  validate,
  shippingController.createShipment
);

router.patch(
  '/:id/status',
  authorize('admin', 'sales_employee', 'inventory_manager'),
  updateShipmentStatusValidator,
  validate,
  shippingController.updateStatus
);

export default router;
