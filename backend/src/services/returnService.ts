import mongoose from 'mongoose';
import { Return, IReturn, ReturnStatus } from '../models/Return';
import { Order } from '../models/Order';
import { Product } from '../models/Product';
import { InventoryLog } from '../models/InventoryLog';
import { CashTransaction } from '../models/CashTransaction';
import { ApiError } from '../utils/ApiError';

interface ReturnItemInput {
  product: string;
  quantity: number;
}

interface CreateReturnInput {
  order: string;
  type: 'product_return' | 'shipping_return';
  items: ReturnItemInput[];
  reason: IReturn['reason'];
  reasonDetail?: string;
  createdBy: string;
}

export const createReturn = async (input: CreateReturnInput): Promise<IReturn> => {
  const order = await Order.findById(input.order);
  if (!order) throw ApiError.notFound('Order not found');

  const items = [];
  let totalRefund = 0;

  for (const item of input.items) {
    const orderItem = order.items.find((i) => i.product.toString() === item.product);
    if (!orderItem) {
      throw ApiError.badRequest(`Product ${item.product} was not part of this order`);
    }
    if (item.quantity > orderItem.quantity) {
      throw ApiError.badRequest(`Return quantity exceeds ordered quantity for ${orderItem.name}`);
    }
    const refundAmount = orderItem.unitPrice * item.quantity;
    items.push({
      product: orderItem.product,
      name: orderItem.name,
      sku: orderItem.sku,
      quantity: item.quantity,
      refundAmount,
    });
    totalRefund += refundAmount;
  }

  return Return.create({
    order: input.order,
    type: input.type,
    items,
    reason: input.reason,
    reasonDetail: input.reasonDetail,
    totalRefund,
    createdBy: input.createdBy,
  });
};

export const updateReturnStatus = async (
  id: string,
  status: ReturnStatus,
  processedBy: string,
  restock?: boolean
): Promise<IReturn> => {
  const session = await mongoose.startSession();
  try {
    let returnDoc: IReturn | undefined;

    await session.withTransaction(async () => {
      const ret = await Return.findById(id).session(session);
      if (!ret) throw ApiError.notFound('Return not found');

      ret.status = status;
      ret.processedBy = processedBy as any;

      if (status === 'refunded' && restock && !ret.restocked) {
        for (const item of ret.items) {
          const product = await Product.findById(item.product).session(session);
          if (!product) continue;
          product.quantity += item.quantity;
          await product.save({ session });

          await InventoryLog.create(
            [
              {
                product: item.product,
                type: 'return',
                quantityChange: item.quantity,
                quantityAfter: product.quantity,
                reason: 'Product return restocked',
                performedBy: processedBy,
              },
            ],
            { session }
          );
        }
        ret.restocked = true;
      }

      if (status === 'refunded') {
        await CashTransaction.create(
          [
            {
              direction: 'out',
              category: 'refund',
              amount: ret.totalRefund,
              description: `Refund for return on order ${ret.order}`,
              reference: ret.id,
              recordedBy: processedBy,
            },
          ],
          { session }
        );
      }

      await ret.save({ session });
      returnDoc = ret;
    });

    if (!returnDoc) throw ApiError.internal('Failed to update return');
    return returnDoc;
  } finally {
    session.endSession();
  }
};

interface ListReturnsQuery {
  page?: number;
  limit?: number;
  status?: ReturnStatus;
  type?: 'product_return' | 'shipping_return';
}

export const listReturns = async (q: ListReturnsQuery) => {
  const page = q.page && q.page > 0 ? q.page : 1;
  const limit = q.limit && q.limit > 0 ? Math.min(q.limit, 100) : 20;
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = {};
  if (q.status) filter.status = q.status;
  if (q.type) filter.type = q.type;

  const [items, total] = await Promise.all([
    Return.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('order', 'orderNumber total'),
    Return.countDocuments(filter),
  ]);

  return { items, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
};

export const getReturnById = async (id: string): Promise<IReturn> => {
  const ret = await Return.findById(id).populate('order', 'orderNumber total customer');
  if (!ret) throw ApiError.notFound('Return not found');
  return ret;
};

export const getReturnStatistics = async (startDate?: Date, endDate?: Date) => {
  const match: Record<string, unknown> = {};
  if (startDate || endDate) {
    match.createdAt = {};
    if (startDate) (match.createdAt as any).$gte = startDate;
    if (endDate) (match.createdAt as any).$lte = endDate;
  }

  const [byReason, byStatus, totals, totalOrders] = await Promise.all([
    Return.aggregate([
      { $match: match },
      { $group: { _id: '$reason', count: { $sum: 1 }, totalRefund: { $sum: '$totalRefund' } } },
      { $sort: { count: -1 } },
    ]),
    Return.aggregate([{ $match: match }, { $group: { _id: '$status', count: { $sum: 1 } } }]),
    Return.aggregate([
      { $match: match },
      { $group: { _id: null, totalReturns: { $sum: 1 }, totalRefunded: { $sum: '$totalRefund' } } },
    ]),
    Order.countDocuments(
      startDate || endDate
        ? { createdAt: match.createdAt }
        : {}
    ),
  ]);

  const totalReturns = totals[0]?.totalReturns || 0;
  const returnRate = totalOrders > 0 ? (totalReturns / totalOrders) * 100 : 0;

  return {
    totalReturns,
    totalRefunded: totals[0]?.totalRefunded || 0,
    returnRate: Number(returnRate.toFixed(2)),
    byReason,
    byStatus,
  };
};
