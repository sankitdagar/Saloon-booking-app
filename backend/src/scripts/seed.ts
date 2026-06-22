import mongoose from 'mongoose';
import { User } from '../models/User';
import { Service } from '../models/Service';
import { Staff } from '../models/Staff';
import { Coupon } from '../models/Coupon';
import { SaloonSettings } from '../models/SaloonSettings';
import { Booking } from '../models/Booking';
import { Review } from '../models/Review';
import { Notification } from '../models/Notification';
import { Wishlist } from '../models/Wishlist';
import { resolveMongoUri, getDatabaseName } from '../config/mongoUri';

import '../config/env';

const DEMO_ACCOUNTS = [
  { role: 'Admin', email: 'admin@saloon.com', password: 'admin12345' },
  { role: 'Staff', email: 'priya@saloon.com', password: 'staff12345' },
  { role: 'Customer', email: 'customer@demo.com', password: 'customer123' },
] as const;

async function seed() {
  const uri = resolveMongoUri();
  const dbName = getDatabaseName();
  console.log(`Connecting to MongoDB → ${dbName}`);
  await mongoose.connect(uri, { dbName });

  await Promise.all([
    User.deleteMany({}),
    Service.deleteMany({}),
    Staff.deleteMany({}),
    Coupon.deleteMany({}),
    SaloonSettings.deleteMany({}),
    Booking.deleteMany({}),
    Review.deleteMany({}),
    Notification.deleteMany({}),
    Wishlist.deleteMany({}),
  ]);

  const admin = await User.create({
    name: 'Saloon Admin',
    email: 'admin@saloon.com',
    phone: '9876543210',
    password: 'admin12345',
    role: 'admin',
    isPhoneVerified: true,
  });

  const staffUser1 = await User.create({
    name: 'Priya Sharma',
    email: 'priya@saloon.com',
    phone: '9876543211',
    password: 'staff12345',
    role: 'staff',
    isPhoneVerified: true,
  });

  const staffUser2 = await User.create({
    name: 'Rahul Verma',
    email: 'rahul@saloon.com',
    phone: '9876543212',
    password: 'staff12345',
    role: 'staff',
    isPhoneVerified: true,
  });

  const customer = await User.create({
    name: 'Demo Customer',
    email: 'customer@demo.com',
    phone: '9876543213',
    password: 'customer123',
    role: 'customer',
    isPhoneVerified: true,
    loyaltyPoints: 50,
  });

  const services = await Service.insertMany([
    { name: 'Haircut & Styling', description: 'Professional haircut with blow dry and styling', category: 'Hair', price: 599, durationInMinutes: 45, image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&h=400&fit=crop', isActive: true },
    { name: 'Hair Color', description: 'Full hair coloring with premium products', category: 'Hair', price: 2499, durationInMinutes: 120, image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&h=400&fit=crop', isActive: true },
    { name: 'Facial Cleanup', description: 'Deep cleansing facial for glowing skin', category: 'Skin', price: 799, durationInMinutes: 60, image: 'https://images.unsplash.com/photo-1570172619644-dfd955f99797?w=600&h=400&fit=crop', isActive: true },
    { name: 'Full Body Spa', description: 'Relaxing full body spa with aromatherapy', category: 'Spa', price: 1999, durationInMinutes: 90, image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&h=400&fit=crop', isActive: true },
    { name: 'Bridal Makeup', description: 'Complete bridal makeup with HD finish', category: 'Makeup', price: 4999, durationInMinutes: 120, image: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=600&h=400&fit=crop', isActive: true },
    { name: 'Manicure & Pedicure', description: 'Classic mani-pedi with nail polish', category: 'Nails', price: 899, durationInMinutes: 75, image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&h=400&fit=crop', isActive: true },
    { name: 'Beard Trim & Grooming', description: 'Beard shaping and grooming for men', category: 'Grooming', price: 399, durationInMinutes: 30, image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3d1?w=600&h=400&fit=crop', isActive: true },
  ]);

  await Staff.insertMany([
    { userId: staffUser1._id, bio: 'Expert hairstylist with 8 years experience', servicesOffered: [services[0]._id, services[1]._id, services[4]._id], rating: 4.8, totalBookingsCompleted: 120 },
    { userId: staffUser2._id, bio: 'Specialist in skin care and spa treatments', servicesOffered: [services[2]._id, services[3]._id, services[5]._id, services[6]._id], rating: 4.6, totalBookingsCompleted: 95 },
  ]);

  await Coupon.insertMany([
    { code: 'WELCOME20', description: '20% off for new customers', discountType: 'percentage', discountValue: 20, minOrderAmount: 500, maxDiscountAmount: 500, validFrom: new Date(), validTo: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), usageLimit: 100, usedCount: 0, isActive: true },
    { code: 'FLAT100', description: 'Flat ₹100 off', discountType: 'flat', discountValue: 100, minOrderAmount: 800, validFrom: new Date(), validTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), usageLimit: 50, usedCount: 0, isActive: true },
  ]);

  await SaloonSettings.create({
    businessName: 'Glamour Studio',
    tagline: 'Where elegance meets artistry',
    address: { street: '123 MG Road', city: 'Bangalore', state: 'Karnataka', pincode: '560001', country: 'India' },
    location: { lat: 12.9716, lng: 77.5946 },
    logo: 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=200&h=200&fit=crop',
    galleryImages: [
      'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&h=400&fit=crop',
    ],
    contactInfo: { phone: '9876543210', email: 'info@glamourstudio.com', whatsapp: '9876543210' },
    about: 'Glamour Studio is a premium saloon offering hair, skin, spa, and makeup services since 2015.',
    cancellationPolicyHours: 2,
    loyaltyPointsPerRupee: 0.1,
    loyaltyPointValue: 1,
  });

  // Verify demo logins work
  console.log('\nVerifying demo accounts...');
  for (const account of DEMO_ACCOUNTS) {
    const user = await User.findOne({ email: account.email }).select('+password');
    if (!user) {
      console.error(`❌ ${account.role}: user not found (${account.email})`);
      continue;
    }
    const ok = await user.comparePassword(account.password);
    console.log(`${ok ? '✅' : '❌'} ${account.role}: ${account.email} / ${account.password}`);
  }

  console.log(`\n📊 Seeded: ${await User.countDocuments()} users, ${await Service.countDocuments()} services`);
  console.log(`📁 Database: ${getDatabaseName()}\n`);
  console.log('Demo accounts:');
  DEMO_ACCOUNTS.forEach((a) => console.log(`  ${a.role.padEnd(10)} ${a.email.padEnd(22)} ${a.password}`));
  console.log('  Coupons:   WELCOME20, FLAT100\n');

  void admin;
  void customer;

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
