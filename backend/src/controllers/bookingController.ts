import { Response } from 'express';
import { body } from 'express-validator';
import { Booking } from '../models/Booking';
import { User } from '../models/User';
import { SaloonSettings } from '../models/SaloonSettings';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';
import {
  createBookingWithTransaction,
  canCancelBooking,
  getAvailableSlots,
} from '../services/slotService';
import {
  notifyBookingConfirmed,
  notifyBookingCancelled,
  notifyBookingRescheduled,
} from '../services/notificationService';
import { refundPayment } from '../services/paymentService';
import { env } from '../config/env';
import { addMinutesToTime } from '../utils/timeUtils';
export const createBookingValidation = [
  body('serviceIds').isArray({ min: 1 }),
  body('date').isISO8601(),
  body('startTime').matches(/^([01]\d|2[0-3]):[0-5]\d$/),
  body('paymentMethod').isIn(['online', 'pay_at_saloon']),
];

export const createBooking = asyncHandler(async (req: AuthRequest, res: Response) => {
  const booking = await createBookingWithTransaction({
    customerId: req.user!._id.toString(),
    staffId: req.body.staffId,
    anyAvailableStaff: req.body.anyAvailableStaff ?? false,
    serviceIds: req.body.serviceIds,
    date: req.body.date,
    startTime: req.body.startTime,
    paymentMethod: req.body.paymentMethod,
    couponCode: req.body.couponCode,
    loyaltyPointsRedeemed: req.body.loyaltyPointsRedeemed,
    notes: req.body.notes,
  });

  const populated = await Booking.findById(booking._id)
    .populate('customerId', 'name email phone')
    .populate({ path: 'staffId', populate: { path: 'userId', select: 'name' } });

  res.status(201).json({ success: true, data: populated });
});

export const getMyBookings = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { status } = req.query;
  const filter: Record<string, unknown> = { customerId: req.user!._id };
  if (status) filter.status = status;

  const bookings = await Booking.find(filter)
    .populate({ path: 'staffId', populate: { path: 'userId', select: 'name profileImage' } })
    .sort({ date: -1, startTime: -1 });

  res.json({ success: true, data: bookings });
});

export const getBookingById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const booking = await Booking.findById(req.params.id)
    .populate('customerId', 'name email phone')
    .populate({ path: 'staffId', populate: { path: 'userId', select: 'name profileImage' } });

  if (!booking) throw new ApiError(404, 'Booking not found');

  const isOwner = booking.customerId._id.toString() === req.user!._id.toString();
  const isAdmin = req.user!.role === 'admin';
  const isStaff =
    req.user!.role === 'staff' && booking.staffId?.toString() === req.staffProfileId;

  if (!isOwner && !isAdmin && !isStaff) throw new ApiError(403, 'Access denied');

  res.json({ success: true, data: booking });
});

export const cancelBooking = asyncHandler(async (req: AuthRequest, res: Response) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) throw new ApiError(404, 'Booking not found');

  const isOwner = booking.customerId.toString() === req.user!._id.toString();
  const isAdmin = req.user!.role === 'admin';
  if (!isOwner && !isAdmin) throw new ApiError(403, 'Access denied');

  if (['completed', 'cancelled', 'no-show'].includes(booking.status)) {
    throw new ApiError(400, 'Cannot cancel this booking');
  }

  if (isOwner && !canCancelBooking(booking.date, booking.startTime)) {
    throw new ApiError(400, `Cannot cancel within ${env.cancellationPolicyHours} hours of appointment`);
  }

  booking.status = 'cancelled';
  booking.cancellationReason = req.body.reason ?? 'Cancelled by user';
  booking.cancelledAt = new Date();
  booking.cancelledBy = req.user!._id;

  if (booking.paymentStatus === 'paid' && booking.paymentMethod === 'online' && booking.razorpayPaymentId) {
    await refundPayment(booking.razorpayPaymentId, booking.finalAmount * 100);
    booking.paymentStatus = 'refunded';
  }

  await booking.save();

  const user = await User.findById(booking.customerId);
  if (user) await notifyBookingCancelled(user, booking);

  res.json({ success: true, data: booking });
});

export const rescheduleBooking = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { date, startTime, staffId } = req.body;
  const booking = await Booking.findById(req.params.id);
  if (!booking) throw new ApiError(404, 'Booking not found');

  if (booking.customerId.toString() !== req.user!._id.toString()) {
    throw new ApiError(403, 'Access denied');
  }

  if (!canCancelBooking(booking.date, booking.startTime)) {
    throw new ApiError(400, `Cannot reschedule within ${env.cancellationPolicyHours} hours of appointment`);
  }

  const totalDuration = booking.services.reduce((s, svc) => s + svc.durationInMinutes, 0);
  const serviceIds = booking.services.map((s) => s.serviceId);
  const targetStaffId = staffId ?? booking.staffId?.toString();

  const availability = await getAvailableSlots(date, serviceIds, targetStaffId);
  const staffSlots = availability.find((a) => a.slots.includes(startTime));
  if (!staffSlots) throw new ApiError(409, 'Selected slot is not available');

  booking.date = new Date(date);
  booking.startTime = startTime;
  booking.endTime = addMinutesToTime(startTime, totalDuration);
  if (staffId) booking.staffId = staffId;
  booking.status = 'confirmed';
  await booking.save();

  const user = await User.findById(booking.customerId);
  if (user) await notifyBookingRescheduled(user, booking);

  res.json({ success: true, data: booking });
});

export const getAllBookings = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { status, date, staffId, page = '1', limit = '20' } = req.query;
  const filter: Record<string, unknown> = {};

  if (status) filter.status = status;
  if (staffId) filter.staffId = staffId;
  if (date) {
    const d = new Date(String(date));
    filter.date = { $gte: new Date(d.setHours(0, 0, 0, 0)), $lte: new Date(d.setHours(23, 59, 59, 999)) };
  }

  if (req.user!.role === 'staff') {
    filter.staffId = req.staffProfileId;
  }

  const skip = (Number(page) - 1) * Number(limit);
  const [bookings, total] = await Promise.all([
    Booking.find(filter)
      .populate('customerId', 'name email phone')
      .populate({ path: 'staffId', populate: { path: 'userId', select: 'name' } })
      .sort({ date: -1, startTime: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Booking.countDocuments(filter),
  ]);

  res.json({ success: true, data: { bookings, total, page: Number(page) } });
});

export const updateBookingStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { status } = req.body;
  const validStatuses = ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show'];
  if (!validStatuses.includes(status)) throw new ApiError(400, 'Invalid status');

  const booking = await Booking.findById(req.params.id);
  if (!booking) throw new ApiError(404, 'Booking not found');

  if (req.user!.role === 'staff' && booking.staffId?.toString() !== req.staffProfileId) {
    throw new ApiError(403, 'Not your appointment');
  }

  booking.status = status;

  if (status === 'completed') {
    const settings = await SaloonSettings.findOne();
    const pointsPerRupee = settings?.loyaltyPointsPerRupee ?? env.loyaltyPointsPerRupee;
    booking.loyaltyPointsEarned = Math.floor(booking.finalAmount * pointsPerRupee);
    await User.findByIdAndUpdate(booking.customerId, {
      $inc: { loyaltyPoints: booking.loyaltyPointsEarned - booking.loyaltyPointsRedeemed },
    });
  }

  await booking.save();

  if (status === 'confirmed') {
    const user = await User.findById(booking.customerId);
    if (user) await notifyBookingConfirmed(user, booking);
  }

  res.json({ success: true, data: booking });
});

export const createWalkInBooking = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { customerName, customerPhone, customerEmail, ...bookingData } = req.body;

  let customer = await User.findOne({ phone: customerPhone });
  if (!customer) {
    customer = await User.create({
      name: customerName,
      email: customerEmail ?? `${customerPhone}@walkin.local`,
      phone: customerPhone,
      password: Math.random().toString(36).slice(-10),
      role: 'customer',
      isPhoneVerified: true,
    });
  }

  const booking = await createBookingWithTransaction({
    customerId: customer._id.toString(),
    ...bookingData,
  });

  booking.status = 'confirmed';
  if (bookingData.paymentMethod === 'pay_at_saloon') {
    booking.paymentStatus = 'pending';
  }
  await booking.save();

  res.status(201).json({ success: true, data: booking });
});

export const markAsPaid = asyncHandler(async (req: AuthRequest, res: Response) => {
  const booking = await Booking.findByIdAndUpdate(
    req.params.id,
    { paymentStatus: 'paid' },
    { new: true }
  );
  if (!booking) throw new ApiError(404, 'Booking not found');
  res.json({ success: true, data: booking });
});
