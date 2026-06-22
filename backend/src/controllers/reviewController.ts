import { Response } from 'express';
import { body } from 'express-validator';
import { Review } from '../models/Review';
import { Booking } from '../models/Booking';
import { Service } from '../models/Service';
import { Staff } from '../models/Staff';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';
import { uploadToCloudinary } from '../services/uploadService';

export const createReviewValidation = [
  body('bookingId').isMongoId(),
  body('rating').isInt({ min: 1, max: 5 }),
  body('comment').trim().notEmpty().isLength({ max: 1000 }),
];

export const createReview = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { bookingId, rating, comment, staffId, serviceId } = req.body;

  const booking = await Booking.findById(bookingId);
  if (!booking) throw new ApiError(404, 'Booking not found');
  if (booking.customerId.toString() !== req.user!._id.toString()) {
    throw new ApiError(403, 'Access denied');
  }
  if (booking.status !== 'completed') {
    throw new ApiError(400, 'Can only review completed bookings');
  }

  const existing = await Review.findOne({ bookingId });
  if (existing) throw new ApiError(409, 'Review already submitted');

  let images: string[] = [];
  if (req.files && Array.isArray(req.files)) {
    images = await Promise.all(
      req.files.map((f) => uploadToCloudinary(f.buffer, 'reviews'))
    );
  }

  const review = await Review.create({
    customerId: req.user!._id,
    bookingId,
    staffId: staffId ?? booking.staffId,
    serviceId,
    rating,
    comment,
    images,
  });

  await updateRatings(staffId ?? booking.staffId?.toString(), serviceId);

  res.status(201).json({ success: true, data: review });
});

export const getServiceReviews = asyncHandler(async (req: AuthRequest, res: Response) => {
  const reviews = await Review.find({ serviceId: req.params.id, isHidden: false })
    .populate('customerId', 'name profileImage')
    .sort({ createdAt: -1 });
  res.json({ success: true, data: reviews });
});

export const getStaffReviews = asyncHandler(async (req: AuthRequest, res: Response) => {
  const reviews = await Review.find({ staffId: req.params.id, isHidden: false })
    .populate('customerId', 'name profileImage')
    .sort({ createdAt: -1 });
  res.json({ success: true, data: reviews });
});

export const getAllReviews = asyncHandler(async (_req: AuthRequest, res: Response) => {
  const reviews = await Review.find()
    .populate('customerId', 'name')
    .populate({ path: 'staffId', populate: { path: 'userId', select: 'name' } })
    .sort({ createdAt: -1 });
  res.json({ success: true, data: reviews });
});

export const respondToReview = asyncHandler(async (req: AuthRequest, res: Response) => {
  const review = await Review.findByIdAndUpdate(
    req.params.id,
    { adminResponse: req.body.response, adminRespondedAt: new Date() },
    { new: true }
  );
  if (!review) throw new ApiError(404, 'Review not found');
  res.json({ success: true, data: review });
});

export const hideReview = asyncHandler(async (req: AuthRequest, res: Response) => {
  const review = await Review.findByIdAndUpdate(
    req.params.id,
    { isHidden: req.body.isHidden ?? true },
    { new: true }
  );
  if (!review) throw new ApiError(404, 'Review not found');
  res.json({ success: true, data: review });
});

async function updateRatings(staffId?: string, serviceId?: string) {
  if (staffId) {
    const staffReviews = await Review.find({ staffId, isHidden: false });
    const avg = staffReviews.reduce((s, r) => s + r.rating, 0) / (staffReviews.length || 1);
    await Staff.findByIdAndUpdate(staffId, {
      rating: Math.round(avg * 10) / 10,
      totalReviews: staffReviews.length,
    });
  }
  if (serviceId) {
    const serviceReviews = await Review.find({ serviceId, isHidden: false });
    const avg = serviceReviews.reduce((s, r) => s + r.rating, 0) / (serviceReviews.length || 1);
    await Service.findByIdAndUpdate(serviceId, {
      averageRating: Math.round(avg * 10) / 10,
      totalReviews: serviceReviews.length,
    });
  }
}
