import { Router } from 'express';
import * as reportController from '../controllers/reportController';
import { protect, authorize } from '../middleware/auth';

const router = Router();

router.use(protect);

router.get('/sales/excel', authorize('admin', 'accountant', 'sales_employee'), reportController.salesExcel);
router.get(
  '/inventory/excel',
  authorize('admin', 'inventory_manager'),
  reportController.inventoryExcel
);
router.get('/cashflow/excel', authorize('admin', 'accountant'), reportController.cashFlowExcel);
router.get(
  '/shipping/excel',
  authorize('admin', 'sales_employee', 'inventory_manager'),
  reportController.shippingExcel
);
router.get('/returns/excel', authorize('admin', 'accountant'), reportController.returnsExcel);

router.get('/accounting/profit-loss/pdf', authorize('admin', 'accountant'), reportController.profitLossPdf);
router.get(
  '/accounting/balance-sheet/pdf',
  authorize('admin', 'accountant'),
  reportController.balanceSheetPdf
);

export default router;
