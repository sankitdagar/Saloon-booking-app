import mongoose, { Document, Schema, Model, Types } from 'mongoose';
import {
  BookingStatus,
  PaymentStatus,
  PaymentMethod,
  BookingServiceItem,
} from '../types';

export interface IBooking extends Document {
  customerId: Types.ObjectId;
  staffId?: Types.ObjectId;
  anyAvailableStaff: boolean;
  services: BookingServiceItem[];
  date: Date;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  totalAmount: number;
  discountAmount: number;
  finalAmount: number;
  couponApplied?: Types.ObjectId;
  couponCode?: string;
  loyaltyPointsEarned: number;
  loyaltyPointsRedeemed: number;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  notes?: string;
  cancellationReason?: string;
  cancelledAt?: Date;
  cancelledBy?: Types.ObjectId;
  reminderSent: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const bookingServiceItemSchema = new Schema<BookingServiceItem>(
  {
    serviceId: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    durationInMinutes: { type: Number, required: true, min: 15 },
  },
  { _id: false }
);

const bookingSchema = new Schema<IBooking>(
  {
    customerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Customer is required'],
    },
    staffId: {
      type: Schema.Types.ObjectId,
      ref: 'Staff',
    },
    anyAvailableStaff: {
      type: Boolean,
      default: false,
    },
    services: {
      type: [bookingServiceItemSchema],
      required: true,
      validate: {
        validator: (v: BookingServiceItem[]) => v.length > 0,
        message: 'At least one service is required',
      },
    },
    date: {
      type: Date,
      required: [true, 'Booking date is required'],
    },
    startTime: {
      type: String,
      required: [true, 'Start time is required'],
      match: [/^([01]\d|2[0-3]):[0-5]\d$/, 'Invalid time format (use HH:mm)'],
    },
    endTime: {
      type: String,
      required: [true, 'End time is required'],
      match: [/^([01]\d|2[0-3]):[0-5]\d$/, 'Invalid time format (use HH:mm)'],
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show'],
      default: 'pending',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      enum: ['online', 'pay_at_saloon'],
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    discountAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    finalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    couponApplied: {
      type: Schema.Types.ObjectId,
      ref: 'Coupon',
    },
    couponCode: {
      type: String,
      trim: true,
      uppercase: true,
    },
    loyaltyPointsEarned: {
      type: Number,
      default: 0,
      min: 0,
    },
    loyaltyPointsRedeemed: {
      type: Number,
      default: 0,
      min: 0,
    },
    razorpayOrderId: String,
    razorpayPaymentId: String,
    razorpaySignature: String,
    notes: {
      type: String,
      maxlength: 500,
    },
    cancellationReason: String,
    cancelledAt: Date,
    cancelledBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    reminderSent: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Fast slot lookup: find bookings for a staff member on a given date
bookingSchema.index({ staffId: 1, date: 1, status: 1 });
bookingSchema.index({ customerId: 1, createdAt: -1 });
bookingSchema.index({ date: 1, startTime: 1 });
bookingSchema.index({ status: 1, date: 1 });

// Prevent double booking: same staff + date + startTime for active bookings
bookingSchema.index(
  { staffId: 1, date: 1, startTime: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: { $in: ['pending', 'confirmed', 'in-progress'] },
      staffId: { $exists: true, $ne: null },
    },
  }
);

export const Booking: Model<IBooking> = mongoose.model<IBooking>('Booking', bookingSchema);
