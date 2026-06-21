import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import * as cashFlowService from '../services/cashFlowService';

export const recordTransaction = asyncHandler(async (req: Request, res: Response) => {
  const tx = await cashFlowService.recordTransaction({ ...req.body, recordedBy: req.user!.id });
  res.status(201).json({ success: true, data: tx });
});

export const listTransactions = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, direction, category, startDate, endDate } = req.query;
  const result = await cashFlowService.listTransactions({
    page: page ? Number(page) : undefined,
    limit: limit ? Number(limit) : undefined,
    direction: direction as any,
    category: category as string,
    startDate: startDate ? new Date(startDate as string) : undefined,
    endDate: endDate ? new Date(endDate as string) : undefined,
  });
  res.status(200).json({ success: true, ...result });
});

export const getCashPosition = asyncHandler(async (_req: Request, res: Response) => {
  const position = await cashFlowService.getCashPosition();
  res.status(200).json({ success: true, data: position });
});

export const getStatement = asyncHandler(async (req: Request, res: Response) => {
  const { granularity, startDate, endDate } = req.query;
  const data = await cashFlowService.getCashFlowStatement(
    (granularity as 'day' | 'week' | 'month') || 'month',
    startDate ? new Date(startDate as string) : undefined,
    endDate ? new Date(endDate as string) : undefined
  );
  res.status(200).json({ success: true, data });
});

export const getForecast = asyncHandler(async (req: Request, res: Response) => {
  const periods = req.query.periods ? Number(req.query.periods) : undefined;
  const forecast = await cashFlowService.getCashFlowForecast(periods);
  res.status(200).json({ success: true, data: forecast });
});
