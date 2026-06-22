import { Response } from 'express';
import { Notification } from '../models/Notification';
import { Wishlist } from '../models/Wishlist';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';
import { uploadToCloudinary } from '../services/uploadService';
import { User } from '../models/User';

export const getNotifications = asyncHandler(async (req: AuthRequest, res: Response) => {
  const notifications = await Notification.find({ userId: req.user!._id })
    .sort({ createdAt: -1 })
    .limit(50);
  const unreadCount = await Notification.countDocuments({ userId: req.user!._id, isRead: false });
  res.json({ success: true, data: { notifications, unreadCount } });
});

export const markAsRead = asyncHandler(async (req: AuthRequest, res: Response) => {
  await Notification.updateMany(
    { userId: req.user!._id, _id: { $in: req.body.ids ?? [] } },
    { isRead: true }
  );
  res.json({ success: true, message: 'Marked as read' });
});

export const markAllRead = asyncHandler(async (req: AuthRequest, res: Response) => {
  await Notification.updateMany({ userId: req.user!._id }, { isRead: true });
  res.json({ success: true, message: 'All marked as read' });
});

export const getWishlist = asyncHandler(async (req: AuthRequest, res: Response) => {
  let wishlist = await Wishlist.findOne({ userId: req.user!._id }).populate(
    'services',
    'name price durationInMinutes image category averageRating'
  );
  if (!wishlist) wishlist = await Wishlist.create({ userId: req.user!._id, services: [] });
  res.json({ success: true, data: wishlist });
});

export const toggleWishlist = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { serviceId } = req.body;
  let wishlist = await Wishlist.findOne({ userId: req.user!._id });
  if (!wishlist) wishlist = await Wishlist.create({ userId: req.user!._id, services: [] });

  const index = wishlist.services.findIndex((s) => s.toString() === serviceId);
  if (index > -1) {
    wishlist.services.splice(index, 1);
  } else {
    wishlist.services.push(serviceId);
  }
  await wishlist.save();

  const populated = await Wishlist.findById(wishlist._id).populate('services', 'name price image');
  res.json({ success: true, data: populated });
});

export const uploadProfileImage = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.file) throw new ApiError(400, 'No file uploaded');
  const url = await uploadToCloudinary(req.file.buffer, 'profiles');
  const user = await User.findByIdAndUpdate(req.user!._id, { profileImage: url }, { new: true });
  res.json({ success: true, data: user });
});
