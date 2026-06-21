import { body } from 'express-validator';

export const createPlanValidator = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('period').isIn(['monthly', 'quarterly', 'yearly']).withMessage('Invalid period'),
  body('startDate').isISO8601().withMessage('Valid start date is required'),
  body('endDate').isISO8601().withMessage('Valid end date is required'),
  body('revenueTarget').isFloat({ min: 0 }).withMessage('Revenue target must be non-negative'),
  body('salesTarget').isFloat({ min: 0 }).withMessage('Sales target must be non-negative'),
  body('budgetAllocated').optional().isFloat({ min: 0 }),
  body('marketingBudget').optional().isFloat({ min: 0 }),
];
