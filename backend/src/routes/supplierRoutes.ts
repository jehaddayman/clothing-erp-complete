import { Router } from 'express';
import * as supplierController from '../controllers/supplierController';
import {
  createSupplierValidator,
  createPurchaseOrderValidator,
  supplierPaymentValidator,
} from '../validators/supplierValidators';
import { validate } from '../middleware/validate';
import { protect, authorize } from '../middleware/auth';

const router = Router();

router.use(protect);

router.get('/purchase-orders/all', supplierController.listPurchaseOrders);
router.get('/purchase-orders/:id', supplierController.getPurchaseOrder);
router.post(
  '/purchase-orders',
  authorize('admin', 'inventory_manager'),
  createPurchaseOrderValidator,
  validate,
  supplierController.createPurchaseOrder
);
router.post(
  '/purchase-orders/:id/receive',
  authorize('admin', 'inventory_manager'),
  supplierController.receivePurchaseOrder
);

router.get('/', supplierController.listSuppliers);
router.get('/:id', supplierController.getSupplier);
router.post(
  '/',
  authorize('admin', 'inventory_manager'),
  createSupplierValidator,
  validate,
  supplierController.createSupplier
);
router.put('/:id', authorize('admin', 'inventory_manager'), supplierController.updateSupplier);
router.delete('/:id', authorize('admin'), supplierController.deactivateSupplier);
router.post(
  '/:id/payments',
  authorize('admin', 'accountant'),
  supplierPaymentValidator,
  validate,
  supplierController.recordPayment
);

export default router;
