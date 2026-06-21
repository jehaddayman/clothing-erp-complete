import { body } from 'express-validator';

export const createReturnValidator = [
  body('order').isMongoId().withMessage('Valid order ID is required'),
  body('type').isIn(['product_return', 'shipping_return']).withMessage('Invalid return type'),
  body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
  body('items.*.product').isMongoId().withMessage('Valid product ID is required'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be positive'),
  body('reason')
    .isIn([
      'defective',
      'wrong_item',
      'wrong_size',
      'not_as_described',
      'changed_mind',
      'damaged_in_transit',
      'other',
    ])
    .withMessage('Invalid reason'),
];

export const updateReturnStatusValidator = [
  body('status')
    .isIn(['requested', 'approved', 'rejected', 'refunded', 'completed'])
    .withMessage('Invalid status'),
  body('restock').optional().isBoolean(),
];
