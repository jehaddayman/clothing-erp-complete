import { body } from 'express-validator';

export const createCashTransactionValidator = [
  body('direction').isIn(['in', 'out']).withMessage('Direction must be in or out'),
  body('category')
    .isIn([
      'sales_revenue',
      'supplier_payment',
      'salary',
      'rent',
      'utilities',
      'shipping_expense',
      'packaging_expense',
      'marketing',
      'refund',
      'other_income',
      'other_expense',
    ])
    .withMessage('Invalid category'),
  body('amount').isFloat({ gt: 0 }).withMessage('Amount must be greater than 0'),
  body('date').optional().isISO8601(),
];
