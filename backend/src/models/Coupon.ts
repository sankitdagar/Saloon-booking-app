import mongoose, { Document, Schema, Model } from 'mongoose';
import { DiscountType } from '../types';

export interface ICoupon extends Document {
  code: string;
  description: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount?: number;
  validFrom: Date;
  validTo: Date;
  usageLimit: number;
  usedCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  isValid(orderAmount: number): boolean;
}

const couponSchema = new Schema<ICoupon>(
  {
    code: {
      type: String,
      required: [true, 'Coupon code is required'],
      unique: true,
      uppercase: true,
      trim: true,
      match: [/^[A-Z0-9_-]{3,20}$/, 'Code must be 3-20 alphanumeric characters'],
    },
    description: {
      type: String,
      default: '',
      maxlength: 200,
    },
    discountType: {
      type: String,
      enum: ['percentage', 'flat'],
      required: true,
    },
    discountValue: {
      type: Number,
      required: true,
      min: [0, 'Discount value cannot be negative'],
    },
    minOrderAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    maxDiscountAmount: {
      type: Number,
      min: 0,
    },
    validFrom: {
      type: Date,
      required: true,
    },
    validTo: {
      type: Date,
      required: true,
    },
    usageLimit: {
      type: Number,
      required: true,
      min: [1, 'Usage limit must be at least 1'],
    },
    usedCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

couponSchema.methods.isValid = function (orderAmount: number): boolean {
  const now = new Date();
  if (!this.isActive) return false;
  if (now < this.validFrom || now > this.validTo) return false;
  if (this.usedCount >= this.usageLimit) return false;
  if (orderAmount < this.minOrderAmount) return false;
  if (this.discountType === 'percentage' && this.discountValue > 100) return false;
  return true;
};

couponSchema.index({ isActive: 1, validFrom: 1, validTo: 1 });

export const Coupon: Model<ICoupon> = mongoose.model<ICoupon>('Coupon', couponSchema);
