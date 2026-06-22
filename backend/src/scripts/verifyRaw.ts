import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { User } from '../models/User';
import { Service } from '../models/Service';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function verify() {
  const uri = process.env.MONGODB_URI!;
  console.log('Raw URI db:', uri);
  await mongoose.connect(uri);
  console.log('Connected db name:', mongoose.connection.db?.databaseName);
  console.log('Users:', await User.countDocuments());
  console.log('Services:', await Service.countDocuments());
  const admin = await User.findOne({ email: 'admin@saloon.com' }).select('+password');
  console.log('Admin found:', !!admin);
  if (admin) console.log('Pwd ok:', await admin.comparePassword('admin12345'));
  await mongoose.disconnect();
}

verify().catch(console.error);
