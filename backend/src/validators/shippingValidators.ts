import { body } from 'express-validator';

export const createShipmentValidator = [
  body('order').isMongoId().withMessage('Valid order ID is required'),
  body('shippingCompany').trim().notEmpty().withMessage('Shipping company is required'),
  body('shippingCost').isFloat({ min: 0 }).withMessage('Shipping cost must be non-negative'),
  body('trackingNumber').optional().trim(),
];

export const updateShipmentStatusValidator = [
  body('status')
    .isIn(['pending', 'processing', 'shipped', 'delivered', 'returned'])
    .withMessage('Invalid shipment status'),
  body('note').optional().trim(),
];
