import { Types } from 'mongoose';
import { Notification } from '../models/Notification';
import { NotificationType } from '../types';
import { sendEmail, bookingConfirmedEmail, bookingCancelledEmail, bookingReminderEmail } from './emailService';
import { sendSms, bookingConfirmationSms, bookingReminderSms } from './smsService';
import { IUser } from '../models/User';
import { IBooking } from '../models/Booking';

export async function createNotification(
  userId: Types.ObjectId | string,
  title: string,
  message: string,
  type: NotificationType,
  relatedId?: Types.ObjectId,
  relatedModel?: string
): Promise<void> {
  await Notification.create({
    userId,
    title,
    message,
    type,
    relatedId,
    relatedModel,
  });
}

export async function notifyBookingConfirmed(
  user: IUser,
  booking: IBooking
): Promise<void> {
  const dateStr = new Date(booking.date).toLocaleDateString('en-IN');
  const services = booking.services.map((s) => s.name).join(', ');

  await createNotification(
    user._id,
    'Booking Confirmed',
    `Your appointment on ${dateStr} at ${booking.startTime} is confirmed.`,
    'booking_confirmed',
    booking._id,
    'Booking'
  );

  await sendEmail(
    user.email,
    'Booking Confirmed',
    bookingConfirmedEmail({
      name: user.name,
      date: dateStr,
      time: booking.startTime,
      services,
      amount: booking.finalAmount,
    })
  );

  await sendSms(user.phone, bookingConfirmationSms(dateStr, booking.startTime));
}

export async function notifyBookingCancelled(
  user: IUser,
  booking: IBooking
): Promise<void> {
  const dateStr = new Date(booking.date).toLocaleDateString('en-IN');

  await createNotification(
    user._id,
    'Booking Cancelled',
    `Your appointment on ${dateStr} at ${booking.startTime} was cancelled.`,
    'booking_cancelled',
    booking._id,
    'Booking'
  );

  await sendEmail(
    user.email,
    'Booking Cancelled',
    bookingCancelledEmail(user.name, dateStr, booking.startTime)
  );
}

export async function notifyBookingRescheduled(
  user: IUser,
  booking: IBooking
): Promise<void> {
  const dateStr = new Date(booking.date).toLocaleDateString('en-IN');

  await createNotification(
    user._id,
    'Booking Rescheduled',
    `Your appointment has been rescheduled to ${dateStr} at ${booking.startTime}.`,
    'booking_rescheduled',
    booking._id,
    'Booking'
  );
}

export async function notifyBookingReminder(
  user: IUser,
  booking: IBooking
): Promise<void> {
  const dateStr = new Date(booking.date).toLocaleDateString('en-IN');

  await createNotification(
    user._id,
    'Appointment Reminder',
    `Reminder: Your appointment is in 2 hours — ${dateStr} at ${booking.startTime}.`,
    'booking_reminder',
    booking._id,
    'Booking'
  );

  await sendEmail(
    user.email,
    'Appointment Reminder',
    bookingReminderEmail(user.name, dateStr, booking.startTime)
  );

  await sendSms(user.phone, bookingReminderSms(dateStr, booking.startTime));
}
