import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import * as supplierService from '../services/supplierService';
import * as poService from '../services/purchaseOrderService';

export const listSuppliers = asyncHandler(async (req: Request, res: Response) => {
  const suppliers = await supplierService.listSuppliers(req.query.search as string);
  res.status(200).json({ success: true, data: suppliers });
});

export const getSupplier = asyncHandler(async (req: Request, res: Response) => {
  const supplier = await supplierService.getSupplierById(req.params.id);
  res.status(200).json({ success: true, data: supplier });
});

export const createSupplier = asyncHandler(async (req: Request, res: Response) => {
  const supplier = await supplierService.createSupplier(req.body);
  res.status(201).json({ success: true, data: supplier });
});

export const updateSupplier = asyncHandler(async (req: Request, res: Response) => {
  const supplier = await supplierService.updateSupplier(req.params.id, req.body);
  res.status(200).json({ success: true, data: supplier });
});

export const deactivateSupplier = asyncHandler(async (req: Request, res: Response) => {
  await supplierService.deactivateSupplier(req.params.id);
  res.status(200).json({ success: true, message: 'Supplier deactivated successfully' });
});

export const recordPayment = asyncHandler(async (req: Request, res: Response) => {
  const supplier = await supplierService.recordSupplierPayment(req.params.id, req.body.amount);
  res.status(200).json({ success: true, data: supplier });
});

export const createPurchaseOrder = asyncHandler(async (req: Request, res: Response) => {
  const po = await poService.createPurchaseOrder({ ...req.body, createdBy: req.user!.id });
  res.status(201).json({ success: true, data: po });
});

export const listPurchaseOrders = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, status } = req.query;
  const result = await poService.listPurchaseOrders(
    page ? Number(page) : undefined,
    limit ? Number(limit) : undefined,
    status as string
  );
  res.status(200).json({ success: true, ...result });
});

export const getPurchaseOrder = asyncHandler(async (req: Request, res: Response) => {
  const po = await poService.getPurchaseOrderById(req.params.id);
  res.status(200).json({ success: true, data: po });
});

export const receivePurchaseOrder = asyncHandler(async (req: Request, res: Response) => {
  const po = await poService.receivePurchaseOrder(req.params.id, req.user!.id);
  res.status(200).json({ success: true, data: po });
});
