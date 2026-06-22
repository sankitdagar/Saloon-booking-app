import mongoose, { Document, Schema, Model, Types } from 'mongoose';

export interface IReview extends Document {
  customerId: Types.ObjectId;
  bookingId: Types.ObjectId;
  staffId?: Types.ObjectId;
  serviceId?: Types.ObjectId;
  rating: number;
  comment: string;
  images: string[];
  adminResponse?: string;
  adminRespondedAt?: Date;
  isHidden: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    customerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
      unique: true, // one review per booking
    },
    staffId: {
      type: Schema.Types.ObjectId,
      ref: 'Staff',
    },
    serviceId: {
      type: Schema.Types.ObjectId,
      ref: 'Service',
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Minimum rating is 1'],
      max: [5, 'Maximum rating is 5'],
    },
    comment: {
      type: String,
      required: [true, 'Comment is required'],
      maxlength: [1000, 'Comment cannot exceed 1000 characters'],
    },
    images: {
      type: [String],
      default: [],
      validate: {
        validator: (v: string[]) => v.length <= 5,
        message: 'Maximum 5 images allowed',
      },
    },
    adminResponse: {
      type: String,
      maxlength: [500, 'Response cannot exceed 500 characters'],
    },
    adminRespondedAt: Date,
    isHidden: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

reviewSchema.index({ staffId: 1, createdAt: -1 });
reviewSchema.index({ serviceId: 1, isHidden: 1 });
reviewSchema.index({ customerId: 1 });

export const Review: Model<IReview> = mongoose.model<IReview>('Review', reviewSchema);
