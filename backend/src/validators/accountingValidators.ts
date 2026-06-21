import { body } from 'express-validator';

export const createAccountValidator = [
  body('code').trim().notEmpty().withMessage('Account code is required'),
  body('name').trim().notEmpty().withMessage('Account name is required'),
  body('type')
    .isIn(['asset', 'liability', 'equity', 'revenue', 'expense'])
    .withMessage('Invalid account type'),
];

export const createJournalEntryValidator = [
  body('date').optional().isISO8601(),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('lines').isArray({ min: 2 }).withMessage('At least two lines are required'),
  body('lines.*.account').isMongoId().withMessage('Valid account ID is required for each line'),
  body('lines.*.debit').optional().isFloat({ min: 0 }),
  body('lines.*.credit').optional().isFloat({ min: 0 }),
];
