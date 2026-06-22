import { Response } from 'express';
import { body, param } from 'express-validator';
import { Service } from '../models/Service';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';
import { uploadToCloudinary } from '../services/uploadService';

export const createServiceValidation = [
  body('name').trim().notEmpty(),
  body('description').trim().notEmpty(),
  body('category').isIn(['Hair', 'Skin', 'Spa', 'Makeup', 'Nails', 'Grooming', 'Other']),
  body('price').isFloat({ min: 0 }),
  body('durationInMinutes').isInt({ min: 15 }),
];

export const getServices = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { category, search, minPrice, maxPrice, page = '1', limit = '20' } = req.query;
  const filter: Record<string, unknown> = { isActive: true };

  if (category) filter.category = category;
  if (minPrice) filter.price = { ...(filter.price as object), $gte: Number(minPrice) };
  if (maxPrice) filter.price = { ...(filter.price as object), $lte: Number(maxPrice) };
  if (search) filter.$text = { $search: String(search) };

  const skip = (Number(page) - 1) * Number(limit);
  const [services, total] = await Promise.all([
    Service.find(filter).sort(search ? { score: { $meta: 'textScore' } } : { createdAt: -1 }).skip(skip).limit(Number(limit)),
    Service.countDocuments(filter),
  ]);

  res.json({ success: true, data: { services, total, page: Number(page), pages: Math.ceil(total / Number(limit)) } });
});

export const getServiceById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const service = await Service.findById(req.params.id);
  if (!service || (!service.isActive && req.user?.role !== 'admin')) {
    throw new ApiError(404, 'Service not found');
  }
  res.json({ success: true, data: service });
});

export const createService = asyncHandler(async (req: AuthRequest, res: Response) => {
  let image = '';
  if (req.file) {
    image = await uploadToCloudinary(req.file.buffer, 'services');
  }

  const service = await Service.create({ ...req.body, image });
  res.status(201).json({ success: true, data: service });
});

export const updateService = asyncHandler(async (req: AuthRequest, res: Response) => {
  const updates = { ...req.body };
  if (req.file) {
    updates.image = await uploadToCloudinary(req.file.buffer, 'services');
  }

  const service = await Service.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  });
  if (!service) throw new ApiError(404, 'Service not found');
  res.json({ success: true, data: service });
});

export const deleteService = asyncHandler(async (req: AuthRequest, res: Response) => {
  const service = await Service.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!service) throw new ApiError(404, 'Service not found');
  res.json({ success: true, message: 'Service deactivated' });
});

export const getCategories = asyncHandler(async (_req: AuthRequest, res: Response) => {
  const categories = await Service.distinct('category', { isActive: true });
  res.json({ success: true, data: categories });
});

export const serviceIdParam = [param('id').isMongoId()];
