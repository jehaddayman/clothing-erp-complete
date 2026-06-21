import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import * as dashboardService from '../services/dashboardService';

export const getSummary = asyncHandler(async (_req: Request, res: Response) => {
  const summary = await dashboardService.getDashboardSummary();
  res.status(200).json({ success: true, data: summary });
});

export const getMonthlySalesChart = asyncHandler(async (req: Request, res: Response) => {
  const year = req.query.year ? Number(req.query.year) : new Date().getFullYear();
  const data = await dashboardService.getMonthlySalesChart(year);
  res.status(200).json({ success: true, data });
});

export const getRecentActivity = asyncHandler(async (req: Request, res: Response) => {
  const limit = req.query.limit ? Number(req.query.limit) : undefined;
  const data = await dashboardService.getRecentActivity(limit);
  res.status(200).json({ success: true, data });
});
