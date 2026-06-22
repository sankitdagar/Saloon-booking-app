import { Response } from 'express';
import { SaloonSettings } from '../models/SaloonSettings';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';
import { uploadToCloudinary } from '../services/uploadService';

export const getSettings = asyncHandler(async (_req: AuthRequest, res: Response) => {
  let settings = await SaloonSettings.findOne();
  if (!settings) settings = await SaloonSettings.create({});
  res.json({ success: true, data: settings });
});

export const updateSettings = asyncHandler(async (req: AuthRequest, res: Response) => {
  let settings = await SaloonSettings.findOne();
  if (!settings) settings = await SaloonSettings.create({});

  const updates = { ...req.body };

  if (req.file) {
    updates.logo = await uploadToCloudinary(req.file.buffer, 'saloon');
  }

  if (req.files && typeof req.files === 'object' && 'gallery' in req.files) {
    const galleryFiles = req.files.gallery as Express.Multer.File[];
    const urls = await Promise.all(
      galleryFiles.map((f) => uploadToCloudinary(f.buffer, 'gallery'))
    );
    updates.galleryImages = [...(settings.galleryImages ?? []), ...urls];
  }

  Object.assign(settings, updates);
  await settings.save();

  res.json({ success: true, data: settings });
});
