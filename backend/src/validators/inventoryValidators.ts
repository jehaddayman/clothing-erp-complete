import { body } from 'express-validator';

export const stockMovementValidator = [
  body('product').isMongoId().withMessage('Valid product ID is required'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be a positive integer'),
  body('reason').optional().trim(),
  body('reference').optional().trim(),
];

export const adjustmentValidator = [
  body('product').isMongoId().withMessage('Valid product ID is required'),
  body('newQuantity').isInt({ min: 0 }).withMessage('New quantity must be a non-negative integer'),
  body('reason').trim().notEmpty().withMessage('Reason is required for adjustments'),
];
