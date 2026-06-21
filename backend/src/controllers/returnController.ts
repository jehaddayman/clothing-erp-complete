import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import * as returnService from '../services/returnService';

export const createReturn = asyncHandler(async (req: Request, res: Response) => {
  const ret = await returnService.createReturn({ ...req.body, createdBy: req.user!.id });
  res.status(201).json({ success: true, data: ret });
});

export const updateStatus = asyncHandler(async (req: Request, res: Response) => {
  const ret = await returnService.updateReturnStatus(
    req.params.id,
    req.body.status,
    req.user!.id,
    req.body.restock
  );
  res.status(200).json({ success: true, data: ret });
});

export const listReturns = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, status, type } = req.query;
  const result = await returnService.listReturns({
    page: page ? Number(page) : undefined,
    limit: limit ? Number(limit) : undefined,
    status: status as any,
    type: type as any,
  });
  res.status(200).json({ success: true, ...result });
});

export const getReturn = asyncHandler(async (req: Request, res: Response) => {
  const ret = await returnService.getReturnById(req.params.id);
  res.status(200).json({ success: true, data: ret });
});

export const getStatistics = asyncHandler(async (req: Request, res: Response) => {
  const { startDate, endDate } = req.query;
  const stats = await returnService.getReturnStatistics(
    startDate ? new Date(startDate as string) : undefined,
    endDate ? new Date(endDate as string) : undefined
  );
  res.status(200).json({ success: true, data: stats });
});
