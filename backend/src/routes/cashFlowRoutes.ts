import { Router } from 'express';
import * as cashFlowController from '../controllers/cashFlowController';
import { createCashTransactionValidator } from '../validators/cashFlowValidators';
import { validate } from '../middleware/validate';
import { protect, authorize } from '../middleware/auth';

const router = Router();

router.use(protect);
router.use(authorize('admin', 'accountant'));

router.get('/position', cashFlowController.getCashPosition);
router.get('/statement', cashFlowController.getStatement);
router.get('/forecast', cashFlowController.getForecast);
router.get('/', cashFlowController.listTransactions);
router.post('/', createCashTransactionValidator, validate, cashFlowController.recordTransaction);

export default router;
