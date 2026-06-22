import mongoose, { Document, Schema, Model, Types } from 'mongoose';
import { WeeklyWorkingHours } from '../types';

const dayWorkingHoursSchema = new Schema(
  {
    isOpen: { type: Boolean, default: true },
    openTime: { type: String, default: '09:00', match: /^([01]\d|2[0-3]):[0-5]\d$/ },
    closeTime: { type: String, default: '18:00', match: /^([01]\d|2[0-3]):[0-5]\d$/ },
  },
  { _id: false }
);

const defaultWorkingHours: WeeklyWorkingHours = {
  monday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
  tuesday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
  wednesday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
  thursday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
  friday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
  saturday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
  sunday: { isOpen: false, openTime: '09:00', closeTime: '18:00' },
};

export interface IStaff extends Document {
  userId: Types.ObjectId;
  bio: string;
  servicesOffered: Types.ObjectId[];
  workingHours: WeeklyWorkingHours;
  daysOff: Date[];
  rating: number;
  totalReviews: number;
  totalBookingsCompleted: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const staffSchema = new Schema<IStaff>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Staff must be linked to a user account'],
      unique: true,
    },
    bio: {
      type: String,
      default: '',
      maxlength: [500, 'Bio cannot exceed 500 characters'],
    },
    servicesOffered: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Service',
      },
    ],
    workingHours: {
      monday: { type: dayWorkingHoursSchema, default: () => ({ ...defaultWorkingHours.monday }) },
      tuesday: { type: dayWorkingHoursSchema, default: () => ({ ...defaultWorkingHours.tuesday }) },
      wednesday: { type: dayWorkingHoursSchema, default: () => ({ ...defaultWorkingHours.wednesday }) },
      thursday: { type: dayWorkingHoursSchema, default: () => ({ ...defaultWorkingHours.thursday }) },
      friday: { type: dayWorkingHoursSchema, default: () => ({ ...defaultWorkingHours.friday }) },
      saturday: { type: dayWorkingHoursSchema, default: () => ({ ...defaultWorkingHours.saturday }) },
      sunday: { type: dayWorkingHoursSchema, default: () => ({ ...defaultWorkingHours.sunday }) },
    },
    daysOff: {
      type: [Date],
      default: [],
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalBookingsCompleted: {
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

staffSchema.index({ isActive: 1 });
staffSchema.index({ servicesOffered: 1 });

export const Staff: Model<IStaff> = mongoose.model<IStaff>('Staff', staffSchema);
