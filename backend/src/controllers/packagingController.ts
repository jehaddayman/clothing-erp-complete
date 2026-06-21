import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import * as packagingService from '../services/packagingService';

export const listMaterials = asyncHandler(async (_req: Request, res: Response) => {
  const materials = await packagingService.listMaterials();
  res.status(200).json({ success: true, data: materials });
});

export const createMaterial = asyncHandler(async (req: Request, res: Response) => {
  const material = await packagingService.createMaterial(req.body);
  res.status(201).json({ success: true, data: material });
});

export const restockMaterial = asyncHandler(async (req: Request, res: Response) => {
  const material = await packagingService.restockMaterial(req.params.id, req.body.quantity);
  res.status(200).json({ success: true, data: material });
});

export const recordUsage = asyncHandler(async (req: Request, res: Response) => {
  const usage = await packagingService.recordUsage(
    req.body.material,
    req.body.quantityUsed,
    req.user!.id,
    req.body.order
  );
  res.status(201).json({ success: true, data: usage });
});

export const getConsumptionReport = asyncHandler(async (req: Request, res: Response) => {
  const { startDate, endDate } = req.query;
  const report = await packagingService.getConsumptionReport(
    startDate ? new Date(startDate as string) : undefined,
    endDate ? new Date(endDate as string) : undefined
  );
  res.status(200).json({ success: true, data: report });
});

export const getLowStockMaterials = asyncHandler(async (_req: Request, res: Response) => {
  const materials = await packagingService.getLowStockMaterials();
  res.status(200).json({ success: true, data: materials });
});
