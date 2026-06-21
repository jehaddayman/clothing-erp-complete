import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  sku: string;
  barcode?: string;
  category: string;
  brand?: string;
  color?: string;
  size?: string;
  costPrice: number;
  sellingPrice: number;
  quantity: number;
  lowStockThreshold: number;
  images: string[];
  isActive: boolean;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true, maxlength: 200 },
    sku: { type: String, required: true, unique: true, uppercase: true, trim: true },
    barcode: { type: String, trim: true, sparse: true },
    category: { type: String, required: true, trim: true, index: true },
    brand: { type: String, trim: true },
    color: { type: String, trim: true },
    size: { type: String, trim: true },
    costPrice: { type: Number, required: true, min: 0 },
    sellingPrice: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 0, default: 0 },
    lowStockThreshold: { type: Number, default: 10, min: 0 },
    images: { type: [String], default: [] },
    isActive: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

productSchema.index({ name: 'text', sku: 'text', barcode: 'text' });
productSchema.index({ category: 1, isActive: 1 });

productSchema.virtual('isLowStock').get(function (this: IProduct) {
  return this.quantity <= this.lowStockThreshold;
});

productSchema.set('toJSON', { virtuals: true });

export const Product: Model<IProduct> = mongoose.model<IProduct>('Product', productSchema);
