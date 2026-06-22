import mongoose from 'mongoose';
import { env } from './env';
import { getDatabaseName } from './mongoUri';

export async function connectDatabase(): Promise<void> {
  mongoose.set('strictQuery', true);

  const dbName = getDatabaseName();
  await mongoose.connect(env.mongoUri, { dbName });

  mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB disconnected');
  });

  console.log(`MongoDB connected → database: ${dbName}`);
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
}
