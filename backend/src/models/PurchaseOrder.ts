import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export type PurchaseOrderStatus = 'draft' | 'ordered' | 'received' | 'cancelled';
export type SupplierPaymentStatus = 'unpaid' | 'partial' | 'paid';

export interface IPurchaseOrderItem {
  product: Types.ObjectId;
  name: string;
  sku: string;
  quantity: number;
  unitCost: number;
  lineTotal: number;
}

export interface IPurchaseOrder extends Document {
  poNumber: string;
  supplier: Types.ObjectId;
  items: IPurchaseOrderItem[];
  totalAmount: number;
  status: PurchaseOrderStatus;
  paymentStatus: SupplierPaymentStatus;
  amountPaid: number;
  expectedDate?: Date;
  receivedDate?: Date;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const poItemSchema = new Schema<IPurchaseOrderItem>(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    sku: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitCost: { type: Number, required: true, min: 0 },
    lineTotal: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const purchaseOrderSchema = new Schema<IPurchaseOrder>(
  {
    poNumber: { type: String, required: true, unique: true },
    supplier: { type: Schema.Types.ObjectId, ref: 'Supplier', required: true },
    items: { type: [poItemSchema], required: true, validate: (v: IPurchaseOrderItem[]) => v.length > 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ['draft', 'ordered', 'received', 'cancelled'], default: 'draft' },
    paymentStatus: { type: String, enum: ['unpaid', 'partial', 'paid'], default: 'unpaid' },
    amountPaid: { type: Number, default: 0, min: 0 },
    expectedDate: { type: Date },
    receivedDate: { type: Date },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

purchaseOrderSchema.index({ supplier: 1, createdAt: -1 });

export const PurchaseOrder: Model<IPurchaseOrder> = mongoose.model<IPurchaseOrder>(
  'PurchaseOrder',
  purchaseOrderSchema
);
