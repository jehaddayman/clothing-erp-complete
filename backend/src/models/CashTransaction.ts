import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export type CashDirection = 'in' | 'out';
export type CashCategory =
  | 'sales_revenue'
  | 'supplier_payment'
  | 'salary'
  | 'rent'
  | 'utilities'
  | 'shipping_expense'
  | 'packaging_expense'
  | 'marketing'
  | 'refund'
  | 'other_income'
  | 'other_expense';

export interface ICashTransaction extends Document {
  direction: CashDirection;
  category: CashCategory;
  amount: number;
  description?: string;
  reference?: string;
  date: Date;
  recordedBy: Types.ObjectId;
  createdAt: Date;
}

const cashTransactionSchema = new Schema<ICashTransaction>(
  {
    direction: { type: String, enum: ['in', 'out'], required: true },
    category: {
      type: String,
      enum: [
        'sales_revenue',
        'supplier_payment',
        'salary',
        'rent',
        'utilities',
        'shipping_expense',
        'packaging_expense',
        'marketing',
        'refund',
        'other_income',
        'other_expense',
      ],
      required: true,
    },
    amount: { type: Number, required: true, min: 0 },
    description: { type: String, trim: true },
    reference: { type: String, trim: true },
    date: { type: Date, required: true, default: Date.now },
    recordedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

cashTransactionSchema.index({ date: -1 });
cashTransactionSchema.index({ direction: 1, category: 1 });

export const CashTransaction: Model<ICashTransaction> = mongoose.model<ICashTransaction>(
  'CashTransaction',
  cashTransactionSchema
);
