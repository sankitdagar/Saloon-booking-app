import dotenv from 'dotenv';
import { resolveMongoUri } from './mongoUri';

dotenv.config();

function requireEnv(key: string, fallback?: string): string {
  const value = process.env[key] ?? fallback;
  if (value === undefined || value === '') {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: parseInt(process.env.PORT ?? '5000', 10),
  mongoUri: resolveMongoUri(),

  jwtAccessSecret: requireEnv('JWT_ACCESS_SECRET', 'dev-access-secret-change-me'),
  jwtRefreshSecret: requireEnv('JWT_REFRESH_SECRET', 'dev-refresh-secret-change-me'),
  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '15m',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',

  clientUrl: process.env.CLIENT_URL ?? 'http://localhost:5173',

  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME ?? '',
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY ?? '',
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET ?? '',

  razorpayKeyId: process.env.RAZORPAY_KEY_ID ?? '',
  razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET ?? '',

  smtpHost: process.env.SMTP_HOST ?? '',
  smtpPort: parseInt(process.env.SMTP_PORT ?? '587', 10),
  smtpUser: process.env.SMTP_USER ?? '',
  smtpPass: process.env.SMTP_PASS ?? '',
  emailFrom: process.env.EMAIL_FROM ?? 'Saloon Booking <noreply@saloon.com>',

  twilioAccountSid: process.env.TWILIO_ACCOUNT_SID ?? '',
  twilioAuthToken: process.env.TWILIO_AUTH_TOKEN ?? '',
  twilioPhoneNumber: process.env.TWILIO_PHONE_NUMBER ?? '',

  cancellationPolicyHours: parseInt(process.env.CANCELLATION_POLICY_HOURS ?? '2', 10),
  slotIntervalMinutes: parseInt(process.env.SLOT_INTERVAL_MINUTES ?? '15', 10),
  loyaltyPointsPerRupee: parseFloat(process.env.LOYALTY_POINTS_PER_RUPEE ?? '0.1'),
  reminderCronSchedule: process.env.REMINDER_CRON_SCHEDULE ?? '*/15 * * * *',
};

export const isProduction = env.nodeEnv === 'production';
