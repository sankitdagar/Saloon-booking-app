import mongoose, { Document, Schema, Model } from 'mongoose';
import { WeeklyWorkingHours } from '../types';

const dayWorkingHoursSchema = new Schema(
  {
    isOpen: { type: Boolean, default: true },
    openTime: { type: String, default: '09:00' },
    closeTime: { type: String, default: '18:00' },
  },
  { _id: false }
);

export interface ISaloonSettings extends Document {
  businessName: string;
  tagline: string;
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  location: {
    lat: number;
    lng: number;
  };
  logo: string;
  galleryImages: string[];
  workingHours: WeeklyWorkingHours;
  holidays: Date[];
  contactInfo: {
    phone: string;
    email: string;
    whatsapp?: string;
    website?: string;
  };
  socialLinks: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
  cancellationPolicyHours: number;
  loyaltyPointsPerRupee: number;
  loyaltyPointValue: number; // rupees per point when redeeming
  about: string;
  createdAt: Date;
  updatedAt: Date;
}

const saloonSettingsSchema = new Schema<ISaloonSettings>(
  {
    businessName: {
      type: String,
      required: true,
      default: 'My Saloon',
    },
    tagline: {
      type: String,
      default: 'Your beauty, our passion',
    },
    address: {
      street: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      pincode: { type: String, default: '' },
      country: { type: String, default: 'India' },
    },
    location: {
      lat: { type: Number, default: 0 },
      lng: { type: Number, default: 0 },
    },
    logo: { type: String, default: '' },
    galleryImages: { type: [String], default: [] },
    workingHours: {
      monday: { type: dayWorkingHoursSchema, default: () => ({ isOpen: true, openTime: '09:00', closeTime: '20:00' }) },
      tuesday: { type: dayWorkingHoursSchema, default: () => ({ isOpen: true, openTime: '09:00', closeTime: '20:00' }) },
      wednesday: { type: dayWorkingHoursSchema, default: () => ({ isOpen: true, openTime: '09:00', closeTime: '20:00' }) },
      thursday: { type: dayWorkingHoursSchema, default: () => ({ isOpen: true, openTime: '09:00', closeTime: '20:00' }) },
      friday: { type: dayWorkingHoursSchema, default: () => ({ isOpen: true, openTime: '09:00', closeTime: '20:00' }) },
      saturday: { type: dayWorkingHoursSchema, default: () => ({ isOpen: true, openTime: '09:00', closeTime: '20:00' }) },
      sunday: { type: dayWorkingHoursSchema, default: () => ({ isOpen: false, openTime: '09:00', closeTime: '20:00' }) },
    },
    holidays: { type: [Date], default: [] },
    contactInfo: {
      phone: { type: String, default: '' },
      email: { type: String, default: '' },
      whatsapp: String,
      website: String,
    },
    socialLinks: {
      facebook: String,
      instagram: String,
      twitter: String,
    },
    cancellationPolicyHours: {
      type: Number,
      default: 2,
      min: 0,
    },
    loyaltyPointsPerRupee: {
      type: Number,
      default: 0.1,
      min: 0,
    },
    loyaltyPointValue: {
      type: Number,
      default: 1,
      min: 0,
    },
    about: {
      type: String,
      default: '',
      maxlength: 2000,
    },
  },
  { timestamps: true }
);

// Singleton pattern — only one settings document
saloonSettingsSchema.statics.getSettings = async function () {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

export const SaloonSettings: Model<ISaloonSettings> = mongoose.model<ISaloonSettings>(
  'SaloonSettings',
  saloonSettingsSchema
);
