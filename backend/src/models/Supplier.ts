import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISupplier extends Document {
  name: string;
  contactPerson?: string;
  email?: string;
  phone: string;
  address?: string;
  totalPurchased: number;
  outstandingBalance: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const supplierSchema = new Schema<ISupplier>(
  {
    name: { type: String, required: true, trim: true },
    contactPerson: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true, sparse: true },
    phone: { type: String, required: true, trim: true },
    address: { type: String, trim: true },
    totalPurchased: { type: Number, default: 0, min: 0 },
    outstandingBalance: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

supplierSchema.index({ name: 'text', phone: 'text' });

export const Supplier: Model<ISupplier> = mongoose.model<ISupplier>('Supplier', supplierSchema);
