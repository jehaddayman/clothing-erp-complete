import { body, query } from 'express-validator';

export const createProductValidator = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('sku').trim().notEmpty().withMessage('SKU is required'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('costPrice').isFloat({ min: 0 }).withMessage('Cost price must be a non-negative number'),
  body('sellingPrice').isFloat({ min: 0 }).withMessage('Selling price must be a non-negative number'),
  body('quantity').optional().isInt({ min: 0 }).withMessage('Quantity must be a non-negative integer'),
  body('lowStockThreshold').optional().isInt({ min: 0 }),
  body('images').optional().isArray(),
];

export const updateProductValidator = [
  body('name').optional().trim().notEmpty(),
  body('costPrice').optional().isFloat({ min: 0 }),
  body('sellingPrice').optional().isFloat({ min: 0 }),
  body('quantity').optional().isInt({ min: 0 }),
  body('lowStockThreshold').optional().isInt({ min: 0 }),
];

export const listProductsValidator = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
];
