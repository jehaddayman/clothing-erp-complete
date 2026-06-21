import { FilterQuery } from 'mongoose';
import { Customer, ICustomer } from '../models/Customer';
import { ApiError } from '../utils/ApiError';

export interface CustomerListQuery {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
}

export const listCustomers = async (q: CustomerListQuery) => {
  const page = q.page && q.page > 0 ? q.page : 1;
  const limit = q.limit && q.limit > 0 ? Math.min(q.limit, 100) : 20;
  const skip = (page - 1) * limit;

  const filter: FilterQuery<ICustomer> = {};
  if (q.search) filter.$text = { $search: q.search };
  if (typeof q.isActive === 'boolean') filter.isActive = q.isActive;

  const [items, total] = await Promise.all([
    Customer.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Customer.countDocuments(filter),
  ]);

  return { items, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
};

export const getCustomerById = async (id: string): Promise<ICustomer> => {
  const customer = await Customer.findById(id);
  if (!customer) throw ApiError.notFound('Customer not found');
  return customer;
};

export const createCustomer = async (data: Partial<ICustomer>): Promise<ICustomer> => {
  if (data.email) {
    const existing = await Customer.findOne({ email: data.email.toLowerCase() });
    if (existing) throw ApiError.conflict('A customer with this email already exists');
  }
  return Customer.create(data);
};

export const updateCustomer = async (
  id: string,
  data: Partial<ICustomer>
): Promise<ICustomer> => {
  const customer = await Customer.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
  if (!customer) throw ApiError.notFound('Customer not found');
  return customer;
};

export const deactivateCustomer = async (id: string): Promise<void> => {
  const customer = await Customer.findByIdAndUpdate(id, { isActive: false });
  if (!customer) throw ApiError.notFound('Customer not found');
};

export const addCustomerNote = async (id: string, text: string): Promise<ICustomer> => {
  const customer = await Customer.findByIdAndUpdate(
    id,
    { $push: { notes: { text, createdAt: new Date() } } },
    { new: true }
  );
  if (!customer) throw ApiError.notFound('Customer not found');
  return customer;
};

export const getCustomerAnalytics = async () => {
  const [topSpenders, totalCustomers, activeCustomers] = await Promise.all([
    Customer.find({ isActive: true }).sort({ totalSpent: -1 }).limit(10),
    Customer.countDocuments(),
    Customer.countDocuments({ isActive: true }),
  ]);

  const aggregate = await Customer.aggregate([
    {
      $group: {
        _id: null,
        avgSpent: { $avg: '$totalSpent' },
        totalRevenue: { $sum: '$totalSpent' },
        avgOrders: { $avg: '$totalOrders' },
      },
    },
  ]);

  return {
    totalCustomers,
    activeCustomers,
    topSpenders,
    avgSpent: aggregate[0]?.avgSpent || 0,
    totalRevenue: aggregate[0]?.totalRevenue || 0,
    avgOrders: aggregate[0]?.avgOrders || 0,
  };
};
