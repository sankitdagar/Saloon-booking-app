import cron from 'node-cron';
import { Booking } from '../models/Booking';
import { User } from '../models/User';
import { notifyBookingReminder } from '../services/notificationService';
import { env } from '../config/env';
import { hoursUntilAppointment } from '../utils/timeUtils';

export function startReminderCron(): void {
  cron.schedule(env.reminderCronSchedule, async () => {
    try {
      const now = new Date();
      const in3Hours = new Date(now.getTime() + 3 * 60 * 60 * 1000);

      const bookings = await Booking.find({
        status: { $in: ['confirmed', 'pending'] },
        reminderSent: false,
        date: { $gte: now, $lte: in3Hours },
      });

      for (const booking of bookings) {
        const hoursLeft = hoursUntilAppointment(booking.date, booking.startTime);
        if (hoursLeft <= 2.5 && hoursLeft >= 1.5) {
          const user = await User.findById(booking.customerId);
          if (user) {
            await notifyBookingReminder(user, booking);
            booking.reminderSent = true;
            await booking.save();
          }
        }
      }

      // Auto-cancel unpaid pending bookings older than 30 minutes
      const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000);
      await Booking.updateMany(
        {
          status: 'pending',
          paymentMethod: 'online',
          paymentStatus: 'pending',
          createdAt: { $lt: thirtyMinAgo },
        },
        { status: 'cancelled', cancellationReason: 'Auto-cancelled: payment not received' }
      );
    } catch (err) {
      console.error('Cron job error:', err);
    }
  });

  console.log('Reminder cron job started');
}
