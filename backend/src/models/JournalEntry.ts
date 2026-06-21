import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IJournalLine {
  account: Types.ObjectId;
  debit: number;
  credit: number;
  memo?: string;
}

export interface IJournalEntry extends Document {
  entryNumber: string;
  date: Date;
  description: string;
  lines: IJournalLine[];
  reference?: string;
  sourceType?: 'sale' | 'purchase' | 'expense' | 'payment' | 'adjustment' | 'manual';
  sourceId?: Types.ObjectId;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const journalLineSchema = new Schema<IJournalLine>(
  {
    account: { type: Schema.Types.ObjectId, ref: 'Account', required: true },
    debit: { type: Number, default: 0, min: 0 },
    credit: { type: Number, default: 0, min: 0 },
    memo: { type: String, trim: true },
  },
  { _id: false }
);

const journalEntrySchema = new Schema<IJournalEntry>(
  {
    entryNumber: { type: String, required: true, unique: true },
    date: { type: Date, required: true, default: Date.now },
    description: { type: String, required: true, trim: true },
    lines: {
      type: [journalLineSchema],
      required: true,
      validate: {
        validator: (lines: IJournalLine[]) => {
          if (lines.length < 2) return false;
          const totalDebit = lines.reduce((s, l) => s + l.debit, 0);
          const totalCredit = lines.reduce((s, l) => s + l.credit, 0);
          return Math.abs(totalDebit - totalCredit) < 0.01;
        },
        message: 'Journal entry must have at least 2 lines and total debits must equal total credits',
      },
    },
    reference: { type: String, trim: true },
    sourceType: {
      type: String,
      enum: ['sale', 'purchase', 'expense', 'payment', 'adjustment', 'manual'],
      default: 'manual',
    },
    sourceId: { type: Schema.Types.ObjectId },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

journalEntrySchema.index({ date: -1 });
journalEntrySchema.index({ sourceType: 1, sourceId: 1 });

export const JournalEntry: Model<IJournalEntry> = mongoose.model<IJournalEntry>(
  'JournalEntry',
  journalEntrySchema
);
