import { body } from 'express-validator';

export const createOrderValidator = [
  body('customer').isMongoId().withMessage('Valid customer ID is required'),
  body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
  body('items.*.product').isMongoId().withMessage('Valid product ID is required for each item'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be a positive integer'),
  body('discount').optional().isFloat({ min: 0 }),
  body('taxRate').optional().isFloat({ min: 0, max: 100 }),
  body('shippingCost').optional().isFloat({ min: 0 }),
];

export const updateOrderStatusValidator = [
  body('status')
    .isIn(['pending', 'processing', 'shipped', 'delivered', 'returned', 'cancelled'])
    .withMessage('Invalid status'),
];

export const updatePaymentStatusValidator = [
  body('paymentStatus').isIn(['unpaid', 'paid', 'partial', 'refunded']).withMessage('Invalid payment status'),
];
