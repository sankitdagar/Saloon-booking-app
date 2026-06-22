import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { User } from '../models/User';
import { Service } from '../models/Service';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

function resolveMongoUri(): string {
  let uri = process.env.MONGODB_URI ?? 'mongodb://127.0.0.1:27017/saloon-booking';
  if (/^mongodb(\+srv)?:\/\/[^/]+\/?$/.test(uri)) {
    uri = `${uri.replace(/\/$/, '')}/saloon-booking`;
  }
  return uri;
}

async function verify() {
  const uri = resolveMongoUri();
  console.log('URI (masked):', uri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'));
  await mongoose.connect(uri);
  const users = await User.countDocuments();
  const services = await Service.countDocuments();
  console.log('Users:', users, 'Services:', services);
  const admin = await User.findOne({ email: 'admin@saloon.com' }).select('+password');
  if (admin) {
    console.log('Admin password test:', await admin.comparePassword('admin12345'));
  } else {
    console.log('Admin NOT FOUND');
  }
  await mongoose.disconnect();
}

verify().catch(console.error);
