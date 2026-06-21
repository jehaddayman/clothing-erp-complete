import { Shipment, IShipment, ShipmentStatus } from '../models/Shipment';
import { Order } from '../models/Order';
import { ApiError } from '../utils/ApiError';

interface CreateShipmentInput {
  order: string;
  shippingCompany: string;
  shippingCost: number;
  trackingNumber?: string;
}

export const createShipment = async (input: CreateShipmentInput): Promise<IShipment> => {
  const order = await Order.findById(input.order);
  if (!order) throw ApiError.notFound('Order not found');

  const existing = await Shipment.findOne({ order: input.order });
  if (existing) throw ApiError.conflict('A shipment already exists for this order');

  const shipment = await Shipment.create({
    ...input,
    statusHistory: [{ status: 'pending', changedAt: new Date() }],
  });

  order.shippingCost = input.shippingCost;
  order.total += input.shippingCost;
  await order.save();

  return shipment;
};

export const updateShipmentStatus = async (
  id: string,
  status: ShipmentStatus,
  note?: string
): Promise<IShipment> => {
  const shipment = await Shipment.findById(id);
  if (!shipment) throw ApiError.notFound('Shipment not found');

  shipment.status = status;
  shipment.statusHistory.push({ status, changedAt: new Date(), note });
  if (status === 'shipped') shipment.shippedAt = new Date();
  if (status === 'delivered') shipment.deliveredAt = new Date();
  await shipment.save();

  await Order.findByIdAndUpdate(shipment.order, { status });

  return shipment;
};

export const getShipmentByOrder = async (orderId: string): Promise<IShipment> => {
  const shipment = await Shipment.findOne({ order: orderId }).populate('order', 'orderNumber total');
  if (!shipment) throw ApiError.notFound('Shipment not found for this order');
  return shipment;
};

interface ListShipmentsQuery {
  page?: number;
  limit?: number;
  status?: ShipmentStatus;
}

export const listShipments = async (q: ListShipmentsQuery) => {
  const page = q.page && q.page > 0 ? q.page : 1;
  const limit = q.limit && q.limit > 0 ? Math.min(q.limit, 100) : 20;
  const skip = (page - 1) * limit;

  const filter = q.status ? { status: q.status } : {};

  const [items, total] = await Promise.all([
    Shipment.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('order', 'orderNumber total customer'),
    Shipment.countDocuments(filter),
  ]);

  return { items, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
};

export const getShippingPerformance = async () => {
  const result = await Shipment.aggregate([
    { $match: { status: 'delivered', shippedAt: { $exists: true }, deliveredAt: { $exists: true } } },
    {
      $project: {
        deliveryDays: {
          $divide: [{ $subtract: ['$deliveredAt', '$shippedAt'] }, 1000 * 60 * 60 * 24],
        },
        shippingCost: 1,
      },
    },
    {
      $group: {
        _id: null,
        avgDeliveryDays: { $avg: '$deliveryDays' },
        avgShippingCost: { $avg: '$shippingCost' },
        totalDelivered: { $sum: 1 },
      },
    },
  ]);

  const statusCounts = await Shipment.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  return {
    performance: result[0] || { avgDeliveryDays: 0, avgShippingCost: 0, totalDelivered: 0 },
    statusBreakdown: statusCounts,
  };
};
