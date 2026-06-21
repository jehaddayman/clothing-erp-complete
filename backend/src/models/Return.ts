import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export type ReturnType = 'product_return' | 'shipping_return';
export type ReturnReason =
  | 'defective'
  | 'wrong_item'
  | 'wrong_size'
  | 'not_as_described'
  | 'changed_mind'
  | 'damaged_in_transit'
  | 'other';
export type ReturnStatus = 'requested' | 'approved' | 'rejected' | 'refunded' | 'completed';

export interface IReturnItem {
  product: Types.ObjectId;
  name: string;
  sku: string;
  quantity: number;
  refundAmount: number;
}

export interface IReturn extends Document {
  order: Types.ObjectId;
  type: ReturnType;
  items: IReturnItem[];
  reason: ReturnReason;
  reasonDetail?: string;
  status: ReturnStatus;
  totalRefund: number;
  restocked: boolean;
  processedBy?: Types.ObjectId;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const returnItemSchema = new Schema<IReturnItem>(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    sku: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    refundAmount: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const returnSchema = new Schema<IReturn>(
  {
    order: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
    type: { type: String, enum: ['product_return', 'shipping_return'], required: true },
    items: { type: [returnItemSchema], required: true, validate: (v: IReturnItem[]) => v.length > 0 },
    reason: {
      type: String,
      enum: [
        'defective',
        'wrong_item',
        'wrong_size',
        'not_as_described',
        'changed_mind',
        'damaged_in_transit',
        'other',
      ],
      required: true,
    },
    reasonDetail: { type: String, trim: true },
    status: {
      type: String,
      enum: ['requested', 'approved', 'rejected', 'refunded', 'completed'],
      default: 'requested',
    },
    totalRefund: { type: Number, required: true, min: 0 },
    restocked: { type: Boolean, default: false },
    processedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

returnSchema.index({ order: 1 });
returnSchema.index({ status: 1, createdAt: -1 });

export const Return: Model<IReturn> = mongoose.model<IReturn>('Return', returnSchema);
