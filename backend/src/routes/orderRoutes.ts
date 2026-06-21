import { Router } from 'express';
import * as orderController from '../controllers/orderController';
import {
  createOrderValidator,
  updateOrderStatusValidator,
  updatePaymentStatusValidator,
} from '../validators/orderValidators';
import { validate } from '../middleware/validate';
import { protect, authorize } from '../middleware/auth';

const router = Router();

router.use(protect);

router.get('/stats/revenue', authorize('admin', 'accountant'), orderController.getRevenueStats);
router.get('/stats/monthly', authorize('admin', 'accountant'), orderController.getMonthlySales);

router.get('/', orderController.listOrders);
router.get('/:id', orderController.getOrder);
router.get('/:id/invoice', orderController.downloadInvoice);

router.post(
  '/',
  authorize('admin', 'sales_employee'),
  createOrderValidator,
  validate,
  orderController.createOrder
);

router.patch(
  '/:id/status',
  authorize('admin', 'sales_employee', 'inventory_manager'),
  updateOrderStatusValidator,
  validate,
  orderController.updateStatus
);

router.patch(
  '/:id/payment-status',
  authorize('admin', 'accountant'),
  updatePaymentStatusValidator,
  validate,
  orderController.updatePaymentStatus
);

export default router;
