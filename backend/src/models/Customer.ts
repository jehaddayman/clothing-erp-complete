import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICustomerNote {
  text: string;
  createdAt: Date;
}

export interface ICustomer extends Document {
  name: string;
  email?: string;
  phone: string;
  address?: string;
  city?: string;
  notes: ICustomerNote[];
  totalSpent: number;
  totalOrders: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const customerNoteSchema = new Schema<ICustomerNote>(
  {
    text: { type: String, required: true, trim: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const customerSchema = new Schema<ICustomer>(
  {
    name: { type: String, required: true, trim: true, maxlength: 150 },
    email: { type: String, trim: true, lowercase: true, sparse: true },
    phone: { type: String, required: true, trim: true },
    address: { type: String, trim: true },
    city: { type: String, trim: true },
    notes: { type: [customerNoteSchema], default: [] },
    totalSpent: { type: Number, default: 0, min: 0 },
    totalOrders: { type: Number, default: 0, min: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

customerSchema.index({ name: 'text', phone: 'text', email: 'text' });

export const Customer: Model<ICustomer> = mongoose.model<ICustomer>('Customer', customerSchema);
