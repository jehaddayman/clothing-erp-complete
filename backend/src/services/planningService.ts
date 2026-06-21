import { BusinessPlan, IBusinessPlan } from '../models/BusinessPlan';
import { Order } from '../models/Order';
import { Customer } from '../models/Customer';
import { Return } from '../models/Return';
import { ApiError } from '../utils/ApiError';

export const createPlan = async (data: Partial<IBusinessPlan>, createdBy: string) => {
  return BusinessPlan.create({ ...data, createdBy });
};

export const listPlans = async (status?: string) => {
  const filter = status ? { status } : {};
  return BusinessPlan.find(filter).sort({ startDate: -1 });
};

export const getPlanById = async (id: string): Promise<IBusinessPlan> => {
  const plan = await BusinessPlan.findById(id);
  if (!plan) throw ApiError.notFound('Business plan not found');
  return plan;
};

export const updatePlan = async (id: string, data: Partial<IBusinessPlan>): Promise<IBusinessPlan> => {
  const plan = await BusinessPlan.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!plan) throw ApiError.notFound('Business plan not found');
  return plan;
};

export const getPlanProgress = async (id: string) => {
  const plan = await getPlanById(id);

  const orderStats = await Order.aggregate([
    {
      $match: {
        status: { $ne: 'cancelled' },
        createdAt: { $gte: plan.startDate, $lte: plan.endDate },
      },
    },
    { $group: { _id: null, revenue: { $sum: '$total' }, orders: { $sum: 1 } } },
  ]);

  const actualRevenue = orderStats[0]?.revenue || 0;
  const actualOrders = orderStats[0]?.orders || 0;

  return {
    plan,
    actualRevenue,
    actualOrders,
    revenueProgress: plan.revenueTarget > 0 ? (actualRevenue / plan.revenueTarget) * 100 : 0,
    salesProgress: plan.salesTarget > 0 ? (actualOrders / plan.salesTarget) * 100 : 0,
  };
};

// Simple linear-trend sales forecast based on last 6 months of order data
export const getSalesForecast = async (monthsAhead = 3) => {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const monthly = await Order.aggregate([
    { $match: { status: { $ne: 'cancelled' }, createdAt: { $gte: sixMonthsAgo } } },
    {
      $group: {
        _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
        revenue: { $sum: '$total' },
        orders: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  if (monthly.length < 2) {
    return { historical: monthly, forecast: [], note: 'Not enough historical data for forecasting' };
  }

  // Linear regression on revenue over month index
  const n = monthly.length;
  const xs = monthly.map((_, i) => i);
  const ys = monthly.map((m) => m.revenue);
  const xMean = xs.reduce((a, b) => a + b, 0) / n;
  const yMean = ys.reduce((a, b) => a + b, 0) / n;
  const num = xs.reduce((s, x, i) => s + (x - xMean) * (ys[i] - yMean), 0);
  const den = xs.reduce((s, x) => s + (x - xMean) ** 2, 0);
  const slope = den !== 0 ? num / den : 0;
  const intercept = yMean - slope * xMean;

  const forecast = [];
  for (let i = 0; i < monthsAhead; i++) {
    const x = n + i;
    const projectedRevenue = Math.max(0, Math.round(intercept + slope * x));
    const date = new Date();
    date.setMonth(date.getMonth() + i + 1);
    forecast.push({
      month: date.toLocaleString('default', { month: 'long', year: 'numeric' }),
      projectedRevenue,
    });
  }

  return { historical: monthly, forecast };
};

export const getBusinessKpis = async (startDate?: Date, endDate?: Date) => {
  const match: Record<string, unknown> = { status: { $ne: 'cancelled' } };
  if (startDate || endDate) {
    match.createdAt = {};
    if (startDate) (match.createdAt as any).$gte = startDate;
    if (endDate) (match.createdAt as any).$lte = endDate;
  }

  const [orderAgg, customerAgg, returnAgg, repeatCustomers] = await Promise.all([
    Order.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$total' },
          totalCost: { $sum: { $sum: '$items.lineTotal' } },
          totalOrders: { $sum: 1 },
        },
      },
    ]),
    Customer.countDocuments(),
    Return.countDocuments(),
    Customer.countDocuments({ totalOrders: { $gt: 1 } }),
  ]);

  const totalRevenue = orderAgg[0]?.totalRevenue || 0;
  const totalOrders = orderAgg[0]?.totalOrders || 0;
  const totalCustomers = customerAgg || 0;

  return {
    totalRevenue,
    totalOrders,
    avgOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
    totalCustomers,
    customerRetentionRate: totalCustomers > 0 ? (repeatCustomers / totalCustomers) * 100 : 0,
    returnRate: totalOrders > 0 ? (returnAgg / totalOrders) * 100 : 0,
  };
};
