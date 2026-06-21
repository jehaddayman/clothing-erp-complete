import { CashTransaction, ICashTransaction } from '../models/CashTransaction';

interface CreateCashTxInput {
  direction: 'in' | 'out';
  category: ICashTransaction['category'];
  amount: number;
  description?: string;
  reference?: string;
  date?: Date;
  recordedBy: string;
}

export const recordTransaction = async (input: CreateCashTxInput) => {
  return CashTransaction.create(input);
};

interface ListQuery {
  page?: number;
  limit?: number;
  direction?: 'in' | 'out';
  category?: string;
  startDate?: Date;
  endDate?: Date;
}

export const listTransactions = async (q: ListQuery) => {
  const page = q.page && q.page > 0 ? q.page : 1;
  const limit = q.limit && q.limit > 0 ? Math.min(q.limit, 100) : 50;
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = {};
  if (q.direction) filter.direction = q.direction;
  if (q.category) filter.category = q.category;
  if (q.startDate || q.endDate) {
    filter.date = {};
    if (q.startDate) (filter.date as any).$gte = q.startDate;
    if (q.endDate) (filter.date as any).$lte = q.endDate;
  }

  const [items, total] = await Promise.all([
    CashTransaction.find(filter).sort({ date: -1 }).skip(skip).limit(limit),
    CashTransaction.countDocuments(filter),
  ]);

  return { items, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
};

export const getCashPosition = async () => {
  const result = await CashTransaction.aggregate([
    {
      $group: {
        _id: '$direction',
        total: { $sum: '$amount' },
      },
    },
  ]);

  const cashIn = result.find((r) => r._id === 'in')?.total || 0;
  const cashOut = result.find((r) => r._id === 'out')?.total || 0;

  return { cashIn, cashOut, netCash: cashIn - cashOut };
};

const groupByPeriod = (granularity: 'day' | 'week' | 'month') => {
  switch (granularity) {
    case 'day':
      return { year: { $year: '$date' }, month: { $month: '$date' }, day: { $dayOfMonth: '$date' } };
    case 'week':
      return { year: { $year: '$date' }, week: { $week: '$date' } };
    case 'month':
    default:
      return { year: { $year: '$date' }, month: { $month: '$date' } };
  }
};

export const getCashFlowStatement = async (
  granularity: 'day' | 'week' | 'month',
  startDate?: Date,
  endDate?: Date
) => {
  const match: Record<string, unknown> = {};
  if (startDate || endDate) {
    match.date = {};
    if (startDate) (match.date as any).$gte = startDate;
    if (endDate) (match.date as any).$lte = endDate;
  }

  const data = await CashTransaction.aggregate([
    { $match: match },
    {
      $group: {
        _id: { period: groupByPeriod(granularity), direction: '$direction' },
        total: { $sum: '$amount' },
      },
    },
    { $sort: { '_id.period': 1 } },
  ]);

  return data;
};

export const getCashFlowForecast = async (periodsAhead = 3) => {
  // Simple forecast based on trailing 3-month average of cash in/out
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

  const historical = await CashTransaction.aggregate([
    { $match: { date: { $gte: threeMonthsAgo } } },
    {
      $group: {
        _id: { month: { $month: '$date' }, direction: '$direction' },
        total: { $sum: '$amount' },
      },
    },
  ]);

  const inflows = historical.filter((h) => h._id.direction === 'in');
  const outflows = historical.filter((h) => h._id.direction === 'out');

  const avgIn = inflows.length ? inflows.reduce((s, h) => s + h.total, 0) / inflows.length : 0;
  const avgOut = outflows.length ? outflows.reduce((s, h) => s + h.total, 0) / outflows.length : 0;
  const avgNet = avgIn - avgOut;

  const forecast = [];
  for (let i = 1; i <= periodsAhead; i++) {
    const date = new Date();
    date.setMonth(date.getMonth() + i);
    forecast.push({
      month: date.toLocaleString('default', { month: 'long', year: 'numeric' }),
      projectedInflow: Math.round(avgIn),
      projectedOutflow: Math.round(avgOut),
      projectedNet: Math.round(avgNet),
    });
  }

  return { basedOnAvgMonthlyIn: avgIn, basedOnAvgMonthlyOut: avgOut, forecast };
};
