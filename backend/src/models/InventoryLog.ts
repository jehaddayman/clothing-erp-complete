import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export type InventoryMovementType = 'stock_in' | 'stock_out' | 'adjustment' | 'damaged' | 'return';

export interface IInventoryLog extends Document {
  product: Types.ObjectId;
  type: InventoryMovementType;
  quantityChange: number;
  quantityAfter: number;
  reason?: string;
  reference?: string;
  performedBy: Types.ObjectId;
  createdAt: Date;
}

const inventoryLogSchema = new Schema<IInventoryLog>(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    type: {
      type: String,
      enum: ['stock_in', 'stock_out', 'adjustment', 'damaged', 'return'],
      required: true,
    },
    quantityChange: { type: Number, required: true },
    quantityAfter: { type: Number, required: true, min: 0 },
    reason: { type: String, trim: true },
    reference: { type: String, trim: true },
    performedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

inventoryLogSchema.index({ product: 1, createdAt: -1 });

export const InventoryLog: Model<IInventoryLog> = mongoose.model<IInventoryLog>(
  'InventoryLog',
  inventoryLogSchema
);
