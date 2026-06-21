import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import * as excelReportService from '../services/excelReportService';
import * as pdfReportService from '../services/pdfReportService';
import * as journalService from '../services/journalService';

const parseDateRange = (req: Request) => {
  const { startDate, endDate } = req.query;
  return {
    startDate: startDate ? new Date(startDate as string) : undefined,
    endDate: endDate ? new Date(endDate as string) : undefined,
  };
};

export const salesExcel = asyncHandler(async (req: Request, res: Response) => {
  const { startDate, endDate } = parseDateRange(req);
  await excelReportService.generateSalesReport(res, startDate, endDate);
});

export const inventoryExcel = asyncHandler(async (_req: Request, res: Response) => {
  await excelReportService.generateInventoryReport(res);
});

export const cashFlowExcel = asyncHandler(async (req: Request, res: Response) => {
  const { startDate, endDate } = parseDateRange(req);
  await excelReportService.generateCashFlowReport(res, startDate, endDate);
});

export const shippingExcel = asyncHandler(async (_req: Request, res: Response) => {
  await excelReportService.generateShippingReport(res);
});

export const returnsExcel = asyncHandler(async (_req: Request, res: Response) => {
  await excelReportService.generateReturnsReport(res);
});

export const profitLossPdf = asyncHandler(async (req: Request, res: Response) => {
  const { startDate, endDate } = parseDateRange(req);
  const data = await journalService.getProfitAndLoss(startDate, endDate);
  pdfReportService.generateProfitLossPdf(res, data);
});

export const balanceSheetPdf = asyncHandler(async (_req: Request, res: Response) => {
  const data = await journalService.getBalanceSheet();
  pdfReportService.generateBalanceSheetPdf(res, data);
});
