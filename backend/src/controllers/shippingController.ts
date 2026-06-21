import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import * as shippingService from '../services/shippingService';

export const createShipment = asyncHandler(async (req: Request, res: Response) => {
  const shipment = await shippingService.createShipment(req.body);
  res.status(201).json({ success: true, data: shipment });
});

export const updateStatus = asyncHandler(async (req: Request, res: Response) => {
  const shipment = await shippingService.updateShipmentStatus(
    req.params.id,
    req.body.status,
    req.body.note
  );
  res.status(200).json({ success: true, data: shipment });
});

export const getByOrder = asyncHandler(async (req: Request, res: Response) => {
  const shipment = await shippingService.getShipmentByOrder(req.params.orderId);
  res.status(200).json({ success: true, data: shipment });
});

export const listShipments = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, status } = req.query;
  const result = await shippingService.listShipments({
    page: page ? Number(page) : undefined,
    limit: limit ? Number(limit) : undefined,
    status: status as any,
  });
  res.status(200).json({ success: true, ...result });
});

export const getPerformance = asyncHandler(async (_req: Request, res: Response) => {
  const data = await shippingService.getShippingPerformance();
  res.status(200).json({ success: true, data });
});
