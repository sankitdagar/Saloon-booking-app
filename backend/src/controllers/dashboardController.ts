import { Response } from 'express';
import { Booking } from '../models/Booking';
import { User } from '../models/User';
import { Staff } from '../models/Staff';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';

export const getDashboardStats = asyncHandler(async (_req: AuthRequest, res: Response) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const monthAgo = new Date(today);
  monthAgo.setMonth(monthAgo.getMonth() - 1);

  const [
    todayBookings,
    pendingBookings,
    totalCustomers,
    completedBookings,
    cancelledBookings,
    revenueToday,
    revenueWeek,
    revenueMonth,
    topServices,
    staffPerformance,
  ] = await Promise.all([
    Booking.find({ date: { $gte: today, $lt: tomorrow } })
      .populate('customerId', 'name phone')
      .populate({ path: 'staffId', populate: { path: 'userId', select: 'name' } })
      .sort({ startTime: 1 }),
    Booking.countDocuments({ status: 'pending' }),
    User.countDocuments({ role: 'customer' }),
    Booking.countDocuments({ status: 'completed' }),
    Booking.countDocuments({ status: 'cancelled' }),
    Booking.aggregate([
      { $match: { date: { $gte: today, $lt: tomorrow }, paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$finalAmount' } } },
    ]),
    Booking.aggregate([
      { $match: { date: { $gte: weekAgo }, paymentStatus: 'paid' } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } }, total: { $sum: '$finalAmount' } } },
      { $sort: { _id: 1 } },
    ]),
    Booking.aggregate([
      { $match: { date: { $gte: monthAgo }, paymentStatus: 'paid' } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } }, total: { $sum: '$finalAmount' } } },
      { $sort: { _id: 1 } },
    ]),
    Booking.aggregate([
      { $unwind: '$services' },
      { $group: { _id: '$services.serviceId', name: { $first: '$services.name' }, count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]),
    Staff.find()
      .populate('userId', 'name')
      .select('rating totalBookingsCompleted totalReviews')
      .sort({ totalBookingsCompleted: -1 }),
  ]);

  const totalBookings = completedBookings + cancelledBookings;
  const cancellationRate = totalBookings > 0 ? (cancelledBookings / totalBookings) * 100 : 0;

  res.json({
    success: true,
    data: {
      todayBookings,
      pendingBookings,
      totalCustomers,
      cancellationRate: Math.round(cancellationRate * 10) / 10,
      revenue: {
        today: revenueToday[0]?.total ?? 0,
        weekly: revenueWeek,
        monthly: revenueMonth,
      },
      topServices,
      staffPerformance,
    },
  });
});

export const getCustomers = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { page = '1', limit = '20', search } = req.query;
  const filter: Record<string, unknown> = { role: 'customer' };
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);
  const [customers, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    User.countDocuments(filter),
  ]);

  res.json({ success: true, data: { customers, total } });
});

export const toggleBlockCustomer = asyncHandler(async (req: AuthRequest, res: Response) => {
  const customer = await User.findOneAndUpdate(
    { _id: req.params.id, role: 'customer' },
    { isBlocked: req.body.isBlocked },
    { new: true }
  );
  res.json({ success: true, data: customer });
});

export const getCustomerBookings = asyncHandler(async (req: AuthRequest, res: Response) => {
  const bookings = await Booking.find({ customerId: req.params.id })
    .populate({ path: 'staffId', populate: { path: 'userId', select: 'name' } })
    .sort({ date: -1 });
  res.json({ success: true, data: bookings });
});

export const exportReport = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { from, to } = req.query;
  const filter: Record<string, unknown> = { paymentStatus: 'paid' };
  if (from && to) {
    filter.date = { $gte: new Date(String(from)), $lte: new Date(String(to)) };
  }

  const bookings = await Booking.find(filter)
    .populate('customerId', 'name email')
    .sort({ date: -1 });

  const csv = [
    'Date,Customer,Services,Amount,Status,Payment',
    ...bookings.map((b) =>
      [
        new Date(b.date).toISOString().split('T')[0],
        (b.customerId as unknown as { name: string }).name,
        b.services.map((s) => s.name).join(';'),
        b.finalAmount,
        b.status,
        b.paymentStatus,
      ].join(',')
    ),
  ].join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=report.csv');
  res.send(csv);
});
