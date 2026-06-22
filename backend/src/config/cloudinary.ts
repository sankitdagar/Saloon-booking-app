import { v2 as cloudinary } from 'cloudinary';
import { env } from './env';

export function configureCloudinary(): void {
  if (!env.cloudinaryCloudName || !env.cloudinaryApiKey || !env.cloudinaryApiSecret) {
    console.warn('Cloudinary credentials not set — file uploads will fail until configured');
    return;
  }

  cloudinary.config({
    cloud_name: env.cloudinaryCloudName,
    api_key: env.cloudinaryApiKey,
    api_secret: env.cloudinaryApiSecret,
  });
}

export { cloudinary };
