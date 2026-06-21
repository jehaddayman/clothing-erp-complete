import { Router } from 'express';
import * as packagingController from '../controllers/packagingController';
import {
  createMaterialValidator,
  restockMaterialValidator,
  usageValidator,
} from '../validators/packagingValidators';
import { validate } from '../middleware/validate';
import { protect, authorize } from '../middleware/auth';

const router = Router();

router.use(protect);

router.get('/materials/low-stock', packagingController.getLowStockMaterials);
router.get('/materials', packagingController.listMaterials);
router.post(
  '/materials',
  authorize('admin', 'inventory_manager'),
  createMaterialValidator,
  validate,
  packagingController.createMaterial
);
router.post(
  '/materials/:id/restock',
  authorize('admin', 'inventory_manager'),
  restockMaterialValidator,
  validate,
  packagingController.restockMaterial
);

router.post(
  '/usage',
  authorize('admin', 'inventory_manager', 'sales_employee'),
  usageValidator,
  validate,
  packagingController.recordUsage
);

router.get('/reports/consumption', authorize('admin', 'accountant'), packagingController.getConsumptionReport);

export default router;
