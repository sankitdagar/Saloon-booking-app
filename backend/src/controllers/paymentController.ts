import { Response } from 'express';
import { Booking } from '../models/Booking';
import { User } from '../models/User';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';
import {
  createRazorpayOrder,
  verifyRazorpayPayment,
  getRazorpayKeyId,
} from '../services/paymentService';
import { notifyBookingConfirmed } from '../services/notificationService';

export const createPaymentOrder = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { bookingId } = req.body;
  const booking = await Booking.findById(bookingId);
  if (!booking) throw new ApiError(404, 'Booking not found');
  if (booking.customerId.toString() !== req.user!._id.toString()) {
    throw new ApiError(403, 'Access denied');
  }
  if (booking.paymentStatus === 'paid') {
    throw new ApiError(400, 'Already paid');
  }

  const order = await createRazorpayOrder(
    Math.round(booking.finalAmount * 100),
    booking._id.toString()
  );

  booking.razorpayOrderId = order.id;
  await booking.save();

  res.json({
    success: true,
    data: {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: getRazorpayKeyId(),
      bookingId: booking._id,
    },
  });
});

export const verifyPayment = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { bookingId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

  const isValid = verifyRazorpayPayment(razorpayOrderId, razorpayPaymentId, razorpaySignature);
  if (!isValid) throw new ApiError(400, 'Payment verification failed');

  const booking = await Booking.findById(bookingId);
  if (!booking) throw new ApiError(404, 'Booking not found');

  booking.paymentStatus = 'paid';
  booking.status = 'confirmed';
  booking.razorpayPaymentId = razorpayPaymentId;
  booking.razorpaySignature = razorpaySignature;
  await booking.save();

  const user = await User.findById(booking.customerId);
  if (user) await notifyBookingConfirmed(user, booking);

  res.json({ success: true, data: booking });
});

export const mockPayment = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { bookingId } = req.body;
  const booking = await Booking.findById(bookingId);
  if (!booking) throw new ApiError(404, 'Booking not found');

  booking.paymentStatus = 'paid';
  booking.status = 'confirmed';
  booking.razorpayPaymentId = `pay_mock_${Date.now()}`;
  await booking.save();

  const user = await User.findById(booking.customerId);
  if (user) await notifyBookingConfirmed(user, booking);

  res.json({ success: true, data: booking, message: 'Mock payment successful (dev mode)' });
});
