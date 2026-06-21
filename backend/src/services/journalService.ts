import mongoose from 'mongoose';
import { JournalEntry, IJournalEntry, IJournalLine } from '../models/JournalEntry';
import { Account } from '../models/Account';
import { ApiError } from '../utils/ApiError';
import { nextSequence } from '../utils/sequence';

interface CreateJournalEntryInput {
  date?: Date;
  description: string;
  lines: { account: string; debit?: number; credit?: number; memo?: string }[];
  reference?: string;
  sourceType?: IJournalEntry['sourceType'];
  sourceId?: string;
  createdBy: string;
}

// Normal balance direction by account type: asset/expense increase with debit; liability/equity/revenue increase with credit
const normalBalanceSign = (type: string): 1 | -1 => {
  return type === 'asset' || type === 'expense' ? 1 : -1;
};

export const postJournalEntry = async (input: CreateJournalEntryInput): Promise<IJournalEntry> => {
  const totalDebit = input.lines.reduce((s, l) => s + (l.debit || 0), 0);
  const totalCredit = input.lines.reduce((s, l) => s + (l.credit || 0), 0);

  if (Math.abs(totalDebit - totalCredit) > 0.01) {
    throw ApiError.badRequest('Journal entry is not balanced: total debits must equal total credits');
  }

  const session = await mongoose.startSession();
  try {
    let entry: IJournalEntry | undefined;

    await session.withTransaction(async () => {
      const entryNumber = await nextSequence('journalEntry', 'JE');

      const created = await JournalEntry.create(
        [
          {
            entryNumber,
            date: input.date || new Date(),
            description: input.description,
            lines: input.lines.map((l) => ({
              account: l.account,
              debit: l.debit || 0,
              credit: l.credit || 0,
              memo: l.memo,
            })),
            reference: input.reference,
            sourceType: input.sourceType || 'manual',
            sourceId: input.sourceId,
            createdBy: input.createdBy,
          },
        ],
        { session }
      );
      entry = created[0];

      for (const line of input.lines) {
        const account = await Account.findById(line.account).session(session);
        if (!account) throw ApiError.notFound(`Account not found: ${line.account}`);

        const sign = normalBalanceSign(account.type);
        const netChange = ((line.debit || 0) - (line.credit || 0)) * sign;
        account.balance += netChange;
        await account.save({ session });
      }
    });

    if (!entry) throw ApiError.internal('Failed to post journal entry');
    return entry;
  } finally {
    session.endSession();
  }
};

export const listJournalEntries = async (page = 1, limit = 50) => {
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    JournalEntry.find()
      .sort({ date: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('lines.account', 'code name type'),
    JournalEntry.countDocuments(),
  ]);
  return { items, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
};

export const getGeneralLedger = async (accountId: string, startDate?: Date, endDate?: Date) => {
  const match: Record<string, unknown> = { 'lines.account': new mongoose.Types.ObjectId(accountId) };
  if (startDate || endDate) {
    match.date = {};
    if (startDate) (match.date as any).$gte = startDate;
    if (endDate) (match.date as any).$lte = endDate;
  }

  const entries = await JournalEntry.find(match).sort({ date: 1 });

  const account = await Account.findById(accountId);
  if (!account) throw ApiError.notFound('Account not found');

  const sign = normalBalanceSign(account.type);
  let runningBalance = 0;

  const lines = entries.flatMap((entry) =>
    entry.lines
      .filter((l) => l.account.toString() === accountId)
      .map((l) => {
        runningBalance += (l.debit - l.credit) * sign;
        return {
          date: entry.date,
          entryNumber: entry.entryNumber,
          description: entry.description,
          debit: l.debit,
          credit: l.credit,
          balance: runningBalance,
        };
      })
  );

  return { account: { code: account.code, name: account.name, type: account.type }, lines };
};

export const getTrialBalance = async () => {
  const accounts = await Account.find({ isActive: true }).sort({ code: 1 });

  const rows = accounts.map((acc) => {
    const sign = normalBalanceSign(acc.type);
    const debitBalance = sign === 1 && acc.balance > 0 ? acc.balance : 0;
    const creditBalance = sign === -1 && acc.balance > 0 ? acc.balance : 0;
    return {
      code: acc.code,
      name: acc.name,
      type: acc.type,
      debit: acc.balance >= 0 ? debitBalance : 0,
      credit: acc.balance >= 0 ? creditBalance : 0,
      balance: acc.balance,
    };
  });

  const totalDebit = rows.reduce((s, r) => s + r.debit, 0);
  const totalCredit = rows.reduce((s, r) => s + r.credit, 0);

  return { rows, totalDebit, totalCredit, isBalanced: Math.abs(totalDebit - totalCredit) < 0.01 };
};

export const getProfitAndLoss = async (startDate?: Date, endDate?: Date) => {
  const revenueAccounts = await Account.find({ type: 'revenue', isActive: true });
  const expenseAccounts = await Account.find({ type: 'expense', isActive: true });

  const totalRevenue = revenueAccounts.reduce((s, a) => s + a.balance, 0);
  const totalExpenses = expenseAccounts.reduce((s, a) => s + a.balance, 0);

  return {
    period: { startDate, endDate },
    revenue: revenueAccounts.map((a) => ({ code: a.code, name: a.name, amount: a.balance })),
    expenses: expenseAccounts.map((a) => ({ code: a.code, name: a.name, amount: a.balance })),
    totalRevenue,
    totalExpenses,
    netProfit: totalRevenue - totalExpenses,
  };
};

export const getBalanceSheet = async () => {
  const [assets, liabilities, equity] = await Promise.all([
    Account.find({ type: 'asset', isActive: true }),
    Account.find({ type: 'liability', isActive: true }),
    Account.find({ type: 'equity', isActive: true }),
  ]);

  const totalAssets = assets.reduce((s, a) => s + a.balance, 0);
  const totalLiabilities = liabilities.reduce((s, a) => s + a.balance, 0);
  const totalEquity = equity.reduce((s, a) => s + a.balance, 0);

  return {
    assets: assets.map((a) => ({ code: a.code, name: a.name, amount: a.balance })),
    liabilities: liabilities.map((a) => ({ code: a.code, name: a.name, amount: a.balance })),
    equity: equity.map((a) => ({ code: a.code, name: a.name, amount: a.balance })),
    totalAssets,
    totalLiabilities,
    totalEquity,
    isBalanced: Math.abs(totalAssets - (totalLiabilities + totalEquity)) < 0.01,
  };
};
