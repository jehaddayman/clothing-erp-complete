import mongoose from 'mongoose';
import { Product } from '../models/Product';
import { InventoryLog, InventoryMovementType } from '../models/InventoryLog';
import { ApiError } from '../utils/ApiError';

interface MovementInput {
  product: string;
  quantity: number;
  reason?: string;
  reference?: string;
  performedBy: string;
}

interface AdjustmentInput {
  product: string;
  newQuantity: number;
  reason: string;
  performedBy: string;
}

const applyMovement = async (
  productId: string,
  type: InventoryMovementType,
  delta: number,
  reason: string | undefined,
  reference: string | undefined,
  performedBy: string
) => {
  const session = await mongoose.startSession();
  try {
    let updatedProduct;
    await session.withTransaction(async () => {
      const product = await Product.findById(productId).session(session);
      if (!product) throw ApiError.notFound('Product not found');

      const newQty = product.quantity + delta;
      if (newQty < 0) {
        throw ApiError.badRequest(
          `Insufficient stock. Current quantity: ${product.quantity}, requested change: ${delta}`
        );
      }

      product.quantity = newQty;
      await product.save({ session });

      await InventoryLog.create(
        [
          {
            product: productId,
            type,
            quantityChange: delta,
            quantityAfter: newQty,
            reason,
            reference,
            performedBy,
          },
        ],
        { session }
      );

      updatedProduct = product;
    });
    return updatedProduct;
  } finally {
    session.endSession();
  }
};

export const stockIn = async (input: MovementInput) => {
  return applyMovement(
    input.product,
    'stock_in',
    Math.abs(input.quantity),
    input.reason,
    input.reference,
    input.performedBy
  );
};

export const stockOut = async (input: MovementInput) => {
  return applyMovement(
    input.product,
    'stock_out',
    -Math.abs(input.quantity),
    input.reason,
    input.reference,
    input.performedBy
  );
};

export const markDamaged = async (input: MovementInput) => {
  return applyMovement(
    input.product,
    'damaged',
    -Math.abs(input.quantity),
    input.reason || 'Damaged goods',
    input.reference,
    input.performedBy
  );
};

export const recordReturn = async (input: MovementInput) => {
  return applyMovement(
    input.product,
    'return',
    Math.abs(input.quantity),
    input.reason || 'Product return',
    input.reference,
    input.performedBy
  );
};

export const adjustInventory = async (input: AdjustmentInput) => {
  const session = await mongoose.startSession();
  try {
    let updatedProduct;
    await session.withTransaction(async () => {
      const product = await Product.findById(input.product).session(session);
      if (!product) throw ApiError.notFound('Product not found');

      const delta = input.newQuantity - product.quantity;
      product.quantity = input.newQuantity;
      await product.save({ session });

      await InventoryLog.create(
        [
          {
            product: input.product,
            type: 'adjustment',
            quantityChange: delta,
            quantityAfter: input.newQuantity,
            reason: input.reason,
            performedBy: input.performedBy,
          },
        ],
        { session }
      );

      updatedProduct = product;
    });
    return updatedProduct;
  } finally {
    session.endSession();
  }
};

export const getProductHistory = async (productId: string, limit = 50) => {
  return InventoryLog.find({ product: productId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('performedBy', 'name email');
};

export const getAllLogs = async (page = 1, limit = 50, type?: InventoryMovementType) => {
  const filter = type ? { type } : {};
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    InventoryLog.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('product', 'name sku')
      .populate('performedBy', 'name email'),
    InventoryLog.countDocuments(filter),
  ]);
  return { items, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
};
