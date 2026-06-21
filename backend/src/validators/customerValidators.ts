import { body } from 'express-validator';

export const createCustomerValidator = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('phone').trim().notEmpty().withMessage('Phone is required'),
  body('email').optional().isEmail().withMessage('Invalid email'),
];

export const updateCustomerValidator = [
  body('name').optional().trim().notEmpty(),
  body('phone').optional().trim().notEmpty(),
  body('email').optional().isEmail(),
];

export const addNoteValidator = [body('text').trim().notEmpty().withMessage('Note text is required')];
