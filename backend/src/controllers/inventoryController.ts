import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import * as inventoryService from '../services/inventoryService';

export const stockIn = asyncHandler(async (req: Request, res: Response) => {
  const product = await inventoryService.stockIn({ ...req.body, performedBy: req.user!.id });
  res.status(200).json({ success: true, data: product });
});

export const stockOut = asyncHandler(async (req: Request, res: Response) => {
  const product = await inventoryService.stockOut({ ...req.body, performedBy: req.user!.id });
  res.status(200).json({ success: true, data: product });
});

export const markDamaged = asyncHandler(async (req: Request, res: Response) => {
  const product = await inventoryService.markDamaged({ ...req.body, performedBy: req.user!.id });
  res.status(200).json({ success: true, data: product });
});

export const recordReturn = asyncHandler(async (req: Request, res: Response) => {
  const product = await inventoryService.recordReturn({ ...req.body, performedBy: req.user!.id });
  res.status(200).json({ success: true, data: product });
});

export const adjustInventory = asyncHandler(async (req: Request, res: Response) => {
  const product = await inventoryService.adjustInventory({
    ...req.body,
    performedBy: req.user!.id,
  });
  res.status(200).json({ success: true, data: product });
});

export const getProductHistory = asyncHandler(async (req: Request, res: Response) => {
  const logs = await inventoryService.getProductHistory(
    req.params.productId,
    req.query.limit ? Number(req.query.limit) : undefined
  );
  res.status(200).json({ success: true, data: logs });
});

export const getAllLogs = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, type } = req.query;
  const result = await inventoryService.getAllLogs(
    page ? Number(page) : undefined,
    limit ? Number(limit) : undefined,
    type as any
  );
  res.status(200).json({ success: true, ...result });
});
