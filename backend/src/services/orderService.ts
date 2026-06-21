import mongoose from 'mongoose';
import { Order, IOrder, OrderStatus } from '../models/Order';
import { Product } from '../models/Product';
import { Customer } from '../models/Customer';
import { InventoryLog } from '../models/InventoryLog';
import { ApiError } from '../utils/ApiError';
import { nextSequence } from '../utils/sequence';

interface OrderItemInput {
  product: string;
  quantity: number;
}

interface CreateOrderInput {
  customer: string;
  items: OrderItemInput[];
  discount?: number;
  taxRate?: number;
  shippingCost?: number;
  notes?: string;
  createdBy: string;
}

export const createOrder = async (input: CreateOrderInput): Promise<IOrder> => {
  const session = await mongoose.startSession();
  try {
    let order: IOrder | undefined;

    await session.withTransaction(async () => {
      const customer = await Customer.findById(input.customer).session(session);
      if (!customer) throw ApiError.notFound('Customer not found');

      const lineItems = [];
      let subtotal = 0;

      for (const item of input.items) {
        const product = await Product.findById(item.product).session(session);
        if (!product) throw ApiError.notFound(`Product not found: ${item.product}`);
        if (product.quantity < item.quantity) {
          throw ApiError.badRequest(
            `Insufficient stock for ${product.name}. Available: ${product.quantity}, requested: ${item.quantity}`
          );
        }

        const lineTotal = product.sellingPrice * item.quantity;
        lineItems.push({
          product: product.id,
          name: product.name,
          sku: product.sku,
          quantity: item.quantity,
          unitPrice: product.sellingPrice,
          lineTotal,
        });
        subtotal += lineTotal;

        product.quantity -= item.quantity;
        await product.save({ session });

        await InventoryLog.create(
          [
            {
              product: product.id,
              type: 'stock_out',
              quantityChange: -item.quantity,
              quantityAfter: product.quantity,
              reason: 'Sale order',
              performedBy: input.createdBy,
            },
          ],
          { session }
        );
      }

      const discount = input.discount || 0;
      const taxRate = input.taxRate || 0;
      const shippingCost = input.shippingCost || 0;
      const taxableAmount = Math.max(subtotal - discount, 0);
      const taxAmount = (taxableAmount * taxRate) / 100;
      const total = taxableAmount + taxAmount + shippingCost;

      const orderNumber = await nextSequence('order', 'ORD');

      const created = await Order.create(
        [
          {
            orderNumber,
            customer: input.customer,
            items: lineItems,
            subtotal,
            discount,
            taxRate,
            taxAmount,
            shippingCost,
            total,
            notes: input.notes,
            createdBy: input.createdBy,
          },
        ],
        { session }
      );
      order = created[0];

      customer.totalSpent += total;
      customer.totalOrders += 1;
      await customer.save({ session });
    });

    if (!order) throw ApiError.internal('Order creation failed');
    return order;
  } finally {
    session.endSession();
  }
};

export const getOrderById = async (id: string): Promise<IOrder> => {
  const order = await Order.findById(id).populate('customer', 'name phone email').populate(
    'createdBy',
    'name'
  );
  if (!order) throw ApiError.notFound('Order not found');
  return order;
};

interface ListOrdersQuery {
  page?: number;
  limit?: number;
  status?: OrderStatus;
  customer?: string;
}

export const listOrders = async (q: ListOrdersQuery) => {
  const page = q.page && q.page > 0 ? q.page : 1;
  const limit = q.limit && q.limit > 0 ? Math.min(q.limit, 100) : 20;
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = {};
  if (q.status) filter.status = q.status;
  if (q.customer) filter.customer = q.customer;

  const [items, total] = await Promise.all([
    Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('customer', 'name phone'),
    Order.countDocuments(filter),
  ]);

  return { items, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
};

export const updateOrderStatus = async (id: string, status: OrderStatus): Promise<IOrder> => {
  const order = await Order.findByIdAndUpdate(id, { status }, { new: true });
  if (!order) throw ApiError.notFound('Order not found');
  return order;
};

export const updatePaymentStatus = async (
  id: string,
  paymentStatus: IOrder['paymentStatus']
): Promise<IOrder> => {
  const order = await Order.findByIdAndUpdate(id, { paymentStatus }, { new: true });
  if (!order) throw ApiError.notFound('Order not found');
  return order;
};

export const getRevenueStats = async (startDate?: Date, endDate?: Date) => {
  const match: Record<string, unknown> = { status: { $ne: 'cancelled' } };
  if (startDate || endDate) {
    match.createdAt = {};
    if (startDate) (match.createdAt as any).$gte = startDate;
    if (endDate) (match.createdAt as any).$lte = endDate;
  }

  const result = await Order.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$total' },
        totalOrders: { $sum: 1 },
        avgOrderValue: { $avg: '$total' },
      },
    },
  ]);

  return result[0] || { totalRevenue: 0, totalOrders: 0, avgOrderValue: 0 };
};

export const getMonthlySales = async (year: number) => {
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
