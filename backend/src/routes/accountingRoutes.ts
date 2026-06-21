import { Router } from 'express';
import * as accountingController from '../controllers/accountingController';
import {
  createAccountValidator,
  createJournalEntryValidator,
} from '../validators/accountingValidators';
import { validate } from '../middleware/validate';
import { protect, authorize } from '../middleware/auth';

const router = Router();

router.use(protect);
router.use(authorize('admin', 'accountant'));

router.get('/accounts', accountingController.listAccounts);
router.get('/accounts/:id', accountingController.getAccount);
router.post('/accounts', createAccountValidator, validate, accountingController.createAccount);
router.put('/accounts/:id', accountingController.updateAccount);
router.post('/accounts/seed-defaults', authorize('admin'), accountingController.seedDefaults);

router.get('/journal-entries', accountingController.listJournalEntries);
router.post(
  '/journal-entries',
  createJournalEntryValidator,
  validate,
  accountingController.createJournalEntry
);

router.get('/ledger/:accountId', accountingController.getLedger);
router.get('/reports/trial-balance', accountingController.getTrialBalance);
router.get('/reports/profit-loss', accountingController.getProfitAndLoss);
router.get('/reports/balance-sheet', accountingController.getBalanceSheet);

export default router;
