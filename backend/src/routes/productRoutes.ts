import { Router } from 'express';
import * as productController from '../controllers/productController';
import {
  createProductValidator,
  updateProductValidator,
  listProductsValidator,
} from '../validators/productValidators';
import { validate } from '../middleware/validate';
import { protect, authorize } from '../middleware/auth';

const router = Router();

router.use(protect);

router.get('/low-stock', productController.getLowStockProducts);
router.get('/', listProductsValidator, validate, productController.listProducts);
router.get('/:id', productController.getProduct);

router.post(
  '/',
  authorize('admin', 'inventory_manager'),
  createProductValidator,
  validate,
  productController.createProduct
);

router.put(
  '/:id',
  authorize('admin', 'inventory_manager'),
  updateProductValidator,
  validate,
  productController.updateProduct
);

router.delete('/:id', authorize('admin', 'inventory_manager'), productController.deleteProduct);

export default router;
