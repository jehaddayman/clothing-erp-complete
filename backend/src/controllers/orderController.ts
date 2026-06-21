import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import * as orderService from '../services/orderService';
import { streamInvoicePdf } from '../services/invoiceService';
import { Order } from '../models/Order';
import { ApiError } from '../utils/ApiError';

export const createOrder = asyncHandler(async (req: Request, res: Response) => {
  const order = await orderService.createOrder({ ...req.body, createdBy: req.user!.id });
  res.status(201).json({ success: true, data: order });
});

export const listOrders = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, status, customer } = req.query;
  const result = await orderService.listOrders({
    page: page ? Number(page) : undefined,
    limit: limit ? Number(limit) : undefined,
    status: status as any,
    customer: customer as string,
  });
  res.status(200).json({ success: true, ...result });
});

export const getOrder = asyncHandler(async (req: Request, res: Response) => {
  const order = await orderService.getOrderById(req.params.id);
  res.status(200).json({ success: true, data: order });
});

export const updateStatus = asyncHandler(async (req: Request, res: Response) => {
  const order = await orderService.updateOrderStatus(req.params.id, req.body.status);
  res.status(200).json({ success: true, data: order });
});

export const updatePaymentStatus = asyncHandler(async (req: Request, res: Response) => {
  const order = await orderService.updatePaymentStatus(req.params.id, req.body.paymentStatus);
  res.status(200).json({ success: true, data: order });
});

export const downloadInvoice = asyncHandler(async (req: Request, res: Response) => {
  const order = await Order.findById(req.params.id).populate('customer', 'name phone email');
  if (!order) throw ApiError.notFound('Order not found');
  streamInvoicePdf(order, res);
});

export const getRevenueStats = asyncHandler(async (req: Request, res: Response) => {
  const { startDate, endDate } = req.query;
  const stats = await orderService.getRevenueStats(
    startDate ? new Date(startDate as string) : undefined,
    endDate ? new Date(endDate as string) : undefined
  );
  res.status(200).json({ success: true, data: stats });
});

export const getMonthlySales = asyncHandler(async (req: Request, res: Response) => {
  const year = req.query.year ? Number(req.query.year) : new Date().getFullYear();
  const data = await orderService.getMonthlySales(year);
  res.status(200).json({ success: true, data });
});
