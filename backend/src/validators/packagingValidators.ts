import { body } from 'express-validator';

export const createMaterialValidator = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('unit').trim().notEmpty().withMessage('Unit is required'),
  body('costPerUnit').isFloat({ min: 0 }).withMessage('Cost per unit must be non-negative'),
];

export const restockMaterialValidator = [
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be a positive integer'),
];

export const usageValidator = [
  body('material').isMongoId().withMessage('Valid material ID is required'),
  body('quantityUsed').isInt({ min: 1 }).withMessage('Quantity used must be a positive integer'),
  body('order').optional().isMongoId(),
];
