import { Router } from 'express';
import * as inventoryController from '../controllers/inventoryController';
import {
  stockMovementValidator,
  adjustmentValidator,
} from '../validators/inventoryValidators';
import { validate } from '../middleware/validate';
import { protect, authorize } from '../middleware/auth';

const router = Router();

router.use(protect);
router.use(authorize('admin', 'inventory_manager'));

router.post('/stock-in', stockMovementValidator, validate, inventoryController.stockIn);
router.post('/stock-out', stockMovementValidator, validate, inventoryController.stockOut);
router.post('/damaged', stockMovementValidator, validate, inventoryController.markDamaged);
router.post('/return', stockMovementValidator, validate, inventoryController.recordReturn);
router.post('/adjust', adjustmentValidator, validate, inventoryController.adjustInventory);

router.get('/logs', inventoryController.getAllLogs);
router.get('/history/:productId', inventoryController.getProductHistory);

export default router;
