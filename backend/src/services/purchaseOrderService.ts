import mongoose from 'mongoose';
import { PurchaseOrder, IPurchaseOrder } from '../models/PurchaseOrder';
import { Product } from '../models/Product';
import { Supplier } from '../models/Supplier';
import { InventoryLog } from '../models/InventoryLog';
import { ApiError } from '../utils/ApiError';
import { nextSequence } from '../utils/sequence';

interface POItemInput {
  product: string;
  quantity: number;
  unitCost: number;
}

interface CreatePOInput {
  supplier: string;
  items: POItemInput[];
  expectedDate?: Date;
  createdBy: string;
}

export const createPurchaseOrder = async (input: CreatePOInput): Promise<IPurchaseOrder> => {
  const supplier = await Supplier.findById(input.supplier);
  if (!supplier) throw ApiError.notFound('Supplier not found');

  const lineItems = [];
  let totalAmount = 0;

  for (const item of input.items) {
    const product = await Product.findById(item.product);
    if (!product) throw ApiError.notFound(`Product not found: ${item.product}`);
    const lineTotal = item.unitCost * item.quantity;
    lineItems.push({
      product: product.id,
      name: product.name,
      sku: product.sku,
      quantity: item.quantity,
      unitCost: item.unitCost,
      lineTotal,
    });
    totalAmount += lineTotal;
  }

  const poNumber = await nextSequence('purchaseOrder', 'PO');

  const po = await PurchaseOrder.create({
    poNumber,
    supplier: input.supplier,
    items: lineItems,
    totalAmount,
    expectedDate: input.expectedDate,
    createdBy: input.createdBy,
  });

  supplier.outstandingBalance += totalAmount;
  await supplier.save();

  return po;
};

export const receivePurchaseOrder = async (id: string, performedBy: string): Promise<IPurchaseOrder> => {
  const session = await mongoose.startSession();
  try {
    let po: IPurchaseOrder | undefined;
    await session.withTransaction(async () => {
      const purchaseOrder = await PurchaseOrder.findById(id).session(session);
      if (!purchaseOrder) throw ApiError.notFound('Purchase order not found');
      if (purchaseOrder.status === 'received') {
        throw ApiError.badRequest('Purchase order has already been received');
      }

      for (const item of purchaseOrder.items) {
        const product = await Product.findById(item.product).session(session);
        if (!product) continue;
        product.quantity += item.quantity;
        await product.save({ session });

        await InventoryLog.create(
          [
            {
              product: item.product,
              type: 'stock_in',
              quantityChange: item.quantity,
              quantityAfter: product.quantity,
              reason: 'Purchase order received',
              reference: purchaseOrder.poNumber,
              performedBy,
            },
          ],
          { session }
        );
      }

      purchaseOrder.status = 'received';
      purchaseOrder.receivedDate = new Date();
      await purchaseOrder.save({ session });
      po = purchaseOrder;
    });

    if (!po) throw ApiError.internal('Failed to receive purchase order');
    return po;
  } finally {
    session.endSession();
  }
};

export const listPurchaseOrders = async (page = 1, limit = 20, status?: string) => {
  const filter = status ? { status } : {};
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    PurchaseOrder.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('supplier', 'name phone'),
    PurchaseOrder.countDocuments(filter),
  ]);
  return { items, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
};

export const getPurchaseOrderById = async (id: string): Promise<IPurchaseOrder> => {
  const po = await PurchaseOrder.findById(id).populate('supplier', 'name phone email');
  if (!po) throw ApiError.notFound('Purchase order not found');
  return po;
};
