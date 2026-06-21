import mongoose, { Schema, Document, Model } from 'mongoose';

export type AccountType = 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';

export interface IAccount extends Document {
  code: string;
  name: string;
  type: AccountType;
  description?: string;
  isActive: boolean;
  balance: number;
  createdAt: Date;
  updatedAt: Date;
}

const accountSchema = new Schema<IAccount>(
  {
    code: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: ['asset', 'liability', 'equity', 'revenue', 'expense'], required: true },
    description: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
    balance: { type: Number, default: 0 },
  },
  { timestamps: true }
);

accountSchema.index({ type: 1 });

export const Account: Model<IAccount> = mongoose.model<IAccount>('Account', accountSchema);
