import mongoose, { Document, Schema, Model } from 'mongoose';
import { ServiceCategory } from '../types';

export interface IService extends Document {
  name: string;
  slug: string;
  description: string;
  category: ServiceCategory;
  price: number;
  durationInMinutes: number;
  image: string;
  images: string[];
  isActive: boolean;
  averageRating: number;
  totalReviews: number;
  createdAt: Date;
  updatedAt: Date;
}

const serviceSchema = new Schema<IService>(
  {
    name: {
      type: String,
      required: [true, 'Service name is required'],
      trim: true,
      maxlength: [150, 'Name cannot exceed 150 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    category: {
      type: String,
      enum: ['Hair', 'Skin', 'Spa', 'Makeup', 'Nails', 'Grooming', 'Other'],
      required: [true, 'Category is required'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    durationInMinutes: {
      type: Number,
      required: [true, 'Duration is required'],
      min: [15, 'Minimum duration is 15 minutes'],
    },
    image: {
      type: String,
      default: '',
    },
    images: {
      type: [String],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    averageRating: {
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
  },
  { timestamps: true }
);

// Auto-generate slug from name
serviceSchema.pre('validate', function (next) {
  if (this.name && (!this.slug || this.isModified('name'))) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

serviceSchema.index({ category: 1, isActive: 1 });
serviceSchema.index({ name: 'text', description: 'text' });
serviceSchema.index({ price: 1 });
serviceSchema.index({ isActive: 1 });

export const Service: Model<IService> = mongoose.model<IService>('Service', serviceSchema);
