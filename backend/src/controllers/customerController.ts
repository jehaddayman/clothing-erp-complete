import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import * as customerService from '../services/customerService';

export const listCustomers = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, search, isActive } = req.query;
  const result = await customerService.listCustomers({
    page: page ? Number(page) : undefined,
    limit: limit ? Number(limit) : undefined,
    search: search as string,
    isActive: isActive !== undefined ? isActive === 'true' : undefined,
  });
  res.status(200).json({ success: true, ...result });
});

export const getCustomer = asyncHandler(async (req: Request, res: Response) => {
  const customer = await customerService.getCustomerById(req.params.id);
  res.status(200).json({ success: true, data: customer });
});

export const createCustomer = asyncHandler(async (req: Request, res: Response) => {
  const customer = await customerService.createCustomer(req.body);
  res.status(201).json({ success: true, data: customer });
});

export const updateCustomer = asyncHandler(async (req: Request, res: Response) => {
  const customer = await customerService.updateCustomer(req.params.id, req.body);
  res.status(200).json({ success: true, data: customer });
});

export const deactivateCustomer = asyncHandler(async (req: Request, res: Response) => {
  await customerService.deactivateCustomer(req.params.id);
  res.status(200).json({ success: true, message: 'Customer deactivated successfully' });
});

export const addNote = asyncHandler(async (req: Request, res: Response) => {
  const customer = await customerService.addCustomerNote(req.params.id, req.body.text);
  res.status(200).json({ success: true, data: customer });
});

export const getAnalytics = asyncHandler(async (_req: Request, res: Response) => {
  const analytics = await customerService.getCustomerAnalytics();
  res.status(200).json({ success: true, data: analytics });
});
