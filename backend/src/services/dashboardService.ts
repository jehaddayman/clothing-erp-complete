import { Order } from '../models/Order';
import { Product } from '../models/Product';
import { Account } from '../models/Account';
import { Return } from '../models/Return';
import { Shipment } from '../models/Shipment';
import { CashTransaction } from '../models/CashTransaction';

export const getDashboardSummary = async () => {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [
    revenueAgg,
    monthlyRevenueAgg,
    expenseAccounts,
    inventoryAgg,
    totalProducts,
    lowStockCount,
    pendingShipments,
    returnedOrders,
    cashAgg,
  ] = await Promise.all([
    Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]),
    Order.aggregate([
      { $match: { status: { $ne: 'cancelled' }, createdAt: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: '$total' }, count: { $sum: 1 } } },
    ]),
    Account.find({ type: 'expense', isActive: true }),
    Product.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: null, value: { $sum: { $multiply: ['$costPrice', '$quantity'] } } } },
    ]),
    Product.countDocuments({ isActive: true }),
    Product.countDocuments({ isActive: true, $expr: { $lte: ['$quantity', '$lowStockThreshold'] } }),
    Shipment.countDocuments({ status: { $in: ['pending', 'processing'] } }),
    Order.countDocuments({ status: 'returned' }),
    CashTransaction.aggregate([{ $group: { _id: '$direction', total: { $sum: '$amount' } } }]),
  ]);

  const totalRevenue = revenueAgg[0]?.total || 0;
  const totalExpenses = expenseAccounts.reduce((s, a) => s + a.balance, 0);
  const monthlyRevenue = monthlyRevenueAgg[0]?.total || 0;
  const monthlyOrders = monthlyRevenueAgg[0]?.count || 0;
  const inventoryValue = inventoryAgg[0]?.value || 0;

  const cashIn = cashAgg.find((c) => c._id === 'in')?.total || 0;
  const cashOut = cashAgg.find((c) => c._id === 'out')?.total || 0;

  return {
    totalRevenue,
    totalExpenses,
    netProfit: totalRevenue - totalExpenses,
    cashFlow: cashIn - cashOut,
    inventoryValue,
    totalProducts,
    lowStockAlerts: lowStockCount,
    monthlySales: { revenue: monthlyRevenue, orders: monthlyOrders },
    pendingShipments,
    returnedOrders,
  };
};

export const getMonthlySalesChart = async (year: number) => {
  return Order.aggregate([
    {
      $match: {
        status: { $ne: 'cancelled' },
        createdAt: { $gte: new Date(`${year}-01-01`), $lt: new Date(`${year + 1}-01-01`) },
      },
    },
    {
      $group: {
        _id: { $month: '$createdAt' },
        revenue: { $sum: '$total' },
        orders: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);
};

export const getRecentActivity = async (limit = 10) => {
  const [recentOrders, recentReturns] = await Promise.all([
    Order.find().sort({ createdAt: -1 }).limit(limit).populate('customer', 'name'),
    Return.find().sort({ createdAt: -1 }).limit(limit).populate('order', 'orderNumber'),
  ]);
  return { recentOrders, recentReturns };
};
