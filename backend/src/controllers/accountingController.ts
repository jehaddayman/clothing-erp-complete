import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import * as accountService from '../services/accountService';
import * as journalService from '../services/journalService';

export const listAccounts = asyncHandler(async (req: Request, res: Response) => {
  const accounts = await accountService.listAccounts(req.query.type as any);
  res.status(200).json({ success: true, data: accounts });
});

export const getAccount = asyncHandler(async (req: Request, res: Response) => {
  const account = await accountService.getAccountById(req.params.id);
  res.status(200).json({ success: true, data: account });
});

export const createAccount = asyncHandler(async (req: Request, res: Response) => {
  const account = await accountService.createAccount(req.body);
  res.status(201).json({ success: true, data: account });
});

export const updateAccount = asyncHandler(async (req: Request, res: Response) => {
  const account = await accountService.updateAccount(req.params.id, req.body);
  res.status(200).json({ success: true, data: account });
});

export const seedDefaults = asyncHandler(async (_req: Request, res: Response) => {
  const created = await accountService.seedDefaultChartOfAccounts();
  res.status(200).json({ success: true, message: `${created.length} default accounts created`, data: created });
});

export const createJournalEntry = asyncHandler(async (req: Request, res: Response) => {
  const entry = await journalService.postJournalEntry({ ...req.body, createdBy: req.user!.id });
  res.status(201).json({ success: true, data: entry });
});

export const listJournalEntries = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit } = req.query;
  const result = await journalService.listJournalEntries(
    page ? Number(page) : undefined,
    limit ? Number(limit) : undefined
  );
  res.status(200).json({ success: true, ...result });
});

export const getLedger = asyncHandler(async (req: Request, res: Response) => {
  const { startDate, endDate } = req.query;
  const ledger = await journalService.getGeneralLedger(
    req.params.accountId,
    startDate ? new Date(startDate as string) : undefined,
    endDate ? new Date(endDate as string) : undefined
  );
  res.status(200).json({ success: true, data: ledger });
});

export const getTrialBalance = asyncHandler(async (_req: Request, res: Response) => {
  const tb = await journalService.getTrialBalance();
  res.status(200).json({ success: true, data: tb });
});

export const getProfitAndLoss = asyncHandler(async (req: Request, res: Response) => {
  const { startDate, endDate } = req.query;
  const pl = await journalService.getProfitAndLoss(
    startDate ? new Date(startDate as string) : undefined,
    endDate ? new Date(endDate as string) : undefined
  );
  res.status(200).json({ success: true, data: pl });
});

export const getBalanceSheet = asyncHandler(async (_req: Request, res: Response) => {
  const bs = await journalService.getBalanceSheet();
  res.status(200).json({ success: true, data: bs });
});
