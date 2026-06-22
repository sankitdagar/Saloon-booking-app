import mongoose, { Document, Schema, Model, Types } from 'mongoose';
import { NotificationType } from '../types';

export interface INotification extends Document {
  userId: Types.ObjectId;
  title: string;
  message: string;
  type: NotificationType;
  relatedId?: Types.ObjectId;
  relatedModel?: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
      maxlength: 100,
    },
    message: {
      type: String,
      required: true,
      maxlength: 500,
    },
    type: {
      type: String,
      enum: [
        'booking_confirmed',
        'booking_cancelled',
        'booking_rescheduled',
        'booking_reminder',
        'offer',
        'general',
      ],
      required: true,
    },
    relatedId: {
      type: Schema.Types.ObjectId,
    },
    relatedModel: {
      type: String,
      enum: ['Booking', 'Coupon', 'Review'],
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

export const Notification: Model<INotification> = mongoose.model<INotification>(
  'Notification',
  notificationSchema
);
