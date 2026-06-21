import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export type ShipmentStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'returned';

export interface IShipment extends Document {
  order: Types.ObjectId;
  shippingCompany: string;
  trackingNumber?: string;
  shippingCost: number;
  status: ShipmentStatus;
  statusHistory: { status: ShipmentStatus; changedAt: Date; note?: string }[];
  shippedAt?: Date;
  deliveredAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const shipmentSchema = new Schema<IShipment>(
  {
    order: { type: Schema.Types.ObjectId, ref: 'Order', required: true, unique: true },
    shippingCompany: { type: String, required: true, trim: true },
    trackingNumber: { type: String, trim: true },
    shippingCost: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ['pending', 'processing', 'shipped', 'delivered', 'returned'],
      default: 'pending',
    },
    statusHistory: {
      type: [
        {
          status: { type: String, required: true },
          changedAt: { type: Date, default: Date.now },
          note: { type: String },
        },
      ],
      default: [],
    },
    shippedAt: { type: Date },
    deliveredAt: { type: Date },
  },
  { timestamps: true }
);

shipmentSchema.index({ status: 1, createdAt: -1 });

export const Shipment: Model<IShipment> = mongoose.model<IShipment>('Shipment', shipmentSchema);
