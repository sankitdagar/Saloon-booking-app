import { cloudinary } from '../config/cloudinary';
import { ApiError } from '../utils/ApiError';
import { env } from '../config/env';

export async function uploadToCloudinary(
  buffer: Buffer,
  folder: string
): Promise<string> {
  if (!env.cloudinaryCloudName) {
    // Dev fallback: return placeholder when Cloudinary not configured
    return `https://placehold.co/600x400?text=${encodeURIComponent(folder)}`;
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: `saloon-booking/${folder}`, resource_type: 'image' },
      (error, result) => {
        if (error || !result) reject(new ApiError(500, 'Image upload failed'));
        else resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
}

export async function deleteFromCloudinary(publicId: string): Promise<void> {
  if (!env.cloudinaryCloudName) return;
  await cloudinary.uploader.destroy(publicId);
}
