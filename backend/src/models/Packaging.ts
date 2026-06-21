import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IPackagingMaterial extends Document {
  name: string;
  unit: string;
  costPerUnit: number;
  quantityInStock: number;
  reorderThreshold: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const packagingMaterialSchema = new Schema<IPackagingMaterial>(
  {
    name: { type: String, required: true, trim: true, unique: true },
    unit: { type: String, required: true, trim: true },
    costPerUnit: { type: Number, required: true, min: 0 },
    quantityInStock: { type: Number, default: 0, min: 0 },
    reorderThreshold: { type: Number, default: 20, min: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const PackagingMaterial: Model<IPackagingMaterial> = mongoose.model<IPackagingMaterial>(
  'PackagingMaterial',
  packagingMaterialSchema
);

export interface IPackagingUsage extends Document {
  material: Types.ObjectId;
  order?: Types.ObjectId;
  quantityUsed: number;
  totalCost: number;
  performedBy: Types.ObjectId;
  createdAt: Date;
}

const packagingUsageSchema = new Schema<IPackagingUsage>(
  {
    material: { type: Schema.Types.ObjectId, ref: 'PackagingMaterial', required: true },
    order: { type: Schema.Types.ObjectId, ref: 'Order' },
    quantityUsed: { type: Number, required: true, min: 1 },
    totalCost: { type: Number, required: true, min: 0 },
    performedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

packagingUsageSchema.index({ material: 1, createdAt: -1 });

export const PackagingUsage: Model<IPackagingUsage> = mongoose.model<IPackagingUsage>(
  'PackagingUsage',
  packagingUsageSchema
);
