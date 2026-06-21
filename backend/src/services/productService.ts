import { FilterQuery } from 'mongoose';
import { Product, IProduct } from '../models/Product';
import { ApiError } from '../utils/ApiError';

export interface ProductListQuery {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  brand?: string;
  isActive?: boolean;
  lowStockOnly?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const listProducts = async (q: ProductListQuery) => {
  const page = q.page && q.page > 0 ? q.page : 1;
  const limit = q.limit && q.limit > 0 ? Math.min(q.limit, 100) : 20;
  const skip = (page - 1) * limit;

  const filter: FilterQuery<IProduct> = {};
  if (q.search) filter.$text = { $search: q.search };
  if (q.category) filter.category = q.category;
  if (q.brand) filter.brand = q.brand;
  if (typeof q.isActive === 'boolean') filter.isActive = q.isActive;
  if (q.lowStockOnly) filter.$expr = { $lte: ['$quantity', '$lowStockThreshold'] };

  const sortField = q.sortBy || 'createdAt';
  const sortDir = q.sortOrder === 'asc' ? 1 : -1;

  const [items, total] = await Promise.all([
    Product.find(filter)
      .sort({ [sortField]: sortDir })
      .skip(skip)
      .limit(limit),
    Product.countDocuments(filter),
  ]);

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getProductById = async (id: string): Promise<IProduct> => {
  const product = await Product.findById(id);
  if (!product) throw ApiError.notFound('Product not found');
  return product;
};

export const createProduct = async (
  data: Partial<IProduct>,
  createdBy: string
): Promise<IProduct> => {
  const existing = await Product.findOne({ sku: data.sku?.toUpperCase() });
  if (existing) throw ApiError.conflict('A product with this SKU already exists');

  return Product.create({ ...data, createdBy });
};

export const updateProduct = async (
  id: string,
  data: Partial<IProduct>
): Promise<IProduct> => {
  const product = await Product.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
  if (!product) throw ApiError.notFound('Product not found');
  return product;
};

export const deleteProduct = async (id: string): Promise<void> => {
  const product = await Product.findByIdAndUpdate(id, { isActive: false }, { new: true });
  if (!product) throw ApiError.notFound('Product not found');
};

export const getLowStockProducts = async (): Promise<IProduct[]> => {
  return Product.find({
    isActive: true,
    $expr: { $lte: ['$quantity', '$lowStockThreshold'] },
  }).sort({ quantity: 1 });
};
