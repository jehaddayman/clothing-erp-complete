import { body } from 'express-validator';

export const createSupplierValidator = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('phone').trim().notEmpty().withMessage('Phone is required'),
  body('email').optional().isEmail(),
];

export const createPurchaseOrderValidator = [
  body('supplier').isMongoId().withMessage('Valid supplier ID is required'),
  body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
  body('items.*.product').isMongoId().withMessage('Valid product ID is required'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be positive'),
  body('items.*.unitCost').isFloat({ min: 0 }).withMessage('Unit cost must be non-negative'),
  body('expectedDate').optional().isISO8601(),
];

export const supplierPaymentValidator = [
  body('amount').isFloat({ gt: 0 }).withMessage('Payment amount must be greater than 0'),
];
