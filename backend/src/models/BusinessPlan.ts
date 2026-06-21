import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export type PlanPeriod = 'monthly' | 'quarterly' | 'yearly';
export type PlanStatus = 'draft' | 'active' | 'completed' | 'archived';

export interface IBusinessPlan extends Document {
  title: string;
  period: PlanPeriod;
  startDate: Date;
  endDate: Date;
  revenueTarget: number;
  salesTarget: number;
  budgetAllocated: number;
  marketingBudget: number;
  notes?: string;
  status: PlanStatus;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const businessPlanSchema = new Schema<IBusinessPlan>(
  {
    title: { type: String, required: true, trim: true },
    period: { type: String, enum: ['monthly', 'quarterly', 'yearly'], required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    revenueTarget: { type: Number, required: true, min: 0 },
    salesTarget: { type: Number, required: true, min: 0 },
    budgetAllocated: { type: Number, default: 0, min: 0 },
    marketingBudget: { type: Number, default: 0, min: 0 },
    notes: { type: String, trim: true },
    status: { type: String, enum: ['draft', 'active', 'completed', 'archived'], default: 'draft' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

businessPlanSchema.index({ status: 1, startDate: -1 });

export const BusinessPlan: Model<IBusinessPlan> = mongoose.model<IBusinessPlan>(
  'BusinessPlan',
  businessPlanSchema
);
