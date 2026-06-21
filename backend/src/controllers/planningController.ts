import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import * as planningService from '../services/planningService';

export const createPlan = asyncHandler(async (req: Request, res: Response) => {
  const plan = await planningService.createPlan(req.body, req.user!.id);
  res.status(201).json({ success: true, data: plan });
});

export const listPlans = asyncHandler(async (req: Request, res: Response) => {
  const plans = await planningService.listPlans(req.query.status as string);
  res.status(200).json({ success: true, data: plans });
});

export const getPlan = asyncHandler(async (req: Request, res: Response) => {
  const plan = await planningService.getPlanById(req.params.id);
  res.status(200).json({ success: true, data: plan });
});

export const updatePlan = asyncHandler(async (req: Request, res: Response) => {
  const plan = await planningService.updatePlan(req.params.id, req.body);
  res.status(200).json({ success: true, data: plan });
});

export const getPlanProgress = asyncHandler(async (req: Request, res: Response) => {
  const progress = await planningService.getPlanProgress(req.params.id);
  res.status(200).json({ success: true, data: progress });
});

export const getSalesForecast = asyncHandler(async (req: Request, res: Response) => {
  const months = req.query.months ? Number(req.query.months) : undefined;
  const forecast = await planningService.getSalesForecast(months);
  res.status(200).json({ success: true, data: forecast });
});

export const getKpis = asyncHandler(async (req: Request, res: Response) => {
  const { startDate, endDate } = req.query;
  const kpis = await planningService.getBusinessKpis(
    startDate ? new Date(startDate as string) : undefined,
    endDate ? new Date(endDate as string) : undefined
  );
  res.status(200).json({ success: true, data: kpis });
});
