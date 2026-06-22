import mongoose from 'mongoose';
import { Staff, IStaff } from '../models/Staff';
import { Booking } from '../models/Booking';
import { Service } from '../models/Service';
import { SaloonSettings } from '../models/SaloonSettings';
import { Coupon, ICoupon } from '../models/Coupon';
import { ApiError } from '../utils/ApiError';
import { env } from '../config/env';
import {
  generateSlots,
  getWorkingHoursForDay,
  isDateOnHoliday,
  isStaffDayOff,
  addMinutesToTime,
  startOfDay,
  endOfDay,
  timeToMinutes,
} from '../utils/timeUtils';
import { TimeRange } from '../types';

const ACTIVE_STATUSES = ['pending', 'confirmed', 'in-progress'];

export async function getAvailableSlots(
  dateStr: string,
  serviceIds: string[],
  staffId?: string
): Promise<{ staffId: string; staffName: string; slots: string[] }[]> {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) throw new ApiError(400, 'Invalid date');

  const settings = await SaloonSettings.findOne();
  if (settings && isDateOnHoliday(date, settings.holidays)) {
    return [];
  }

  const services = await Service.find({ _id: { $in: serviceIds }, isActive: true });
  if (services.length !== serviceIds.length) {
    throw new ApiError(400, 'One or more services not found');
  }

  const totalDuration = services.reduce((sum, s) => sum + s.durationInMinutes, 0);

  let staffList: IStaff[] = [];
  if (staffId) {
    const staff = await Staff.findById(staffId).populate('userId', 'name');
    if (!staff || !staff.isActive) throw new ApiError(404, 'Staff not found');
    staffList = [staff];
  } else {
    staffList = await Staff.find({
      isActive: true,
      servicesOffered: { $all: serviceIds },
    }).populate('userId', 'name');
  }

  const results: { staffId: string; staffName: string; slots: string[] }[] = [];

  for (const staff of staffList) {
    if (isStaffDayOff(date, staff.daysOff)) continue;

    const dayHours = getWorkingHoursForDay(staff.workingHours, date);
    if (!dayHours.isOpen) continue;

    // Also respect saloon-level hours (intersection)
    let openTime = dayHours.openTime;
    let closeTime = dayHours.closeTime;
    if (settings) {
      const saloonHours = getWorkingHoursForDay(settings.workingHours, date);
      if (!saloonHours.isOpen) continue;
      openTime =
        timeToMinutes(openTime) > timeToMinutes(saloonHours.openTime)
          ? openTime
          : saloonHours.openTime;
      closeTime =
        timeToMinutes(closeTime) < timeToMinutes(saloonHours.closeTime)
          ? closeTime
          : saloonHours.closeTime;
    }

    const bookings = await Booking.find({
      staffId: staff._id,
      date: { $gte: startOfDay(date), $lte: endOfDay(date) },
      status: { $in: ACTIVE_STATUSES },
    });

    const bookedRanges: TimeRange[] = bookings.map((b) => ({
      startTime: b.startTime,
      endTime: b.endTime,
    }));

    const slots = generateSlots(
      openTime,
      closeTime,
      totalDuration,
      env.slotIntervalMinutes,
      bookedRanges
    );

    const user = staff.userId as unknown as { name: string };
    results.push({
      staffId: staff._id.toString(),
      staffName: user?.name ?? 'Staff',
      slots,
    });
  }

  return results;
}

export function calculateDiscount(coupon: ICoupon, orderAmount: number): number {
  if (!coupon.isValid(orderAmount)) return 0;

  if (coupon.discountType === 'flat') {
    return Math.min(coupon.discountValue, orderAmount);
  }

  let discount = (orderAmount * coupon.discountValue) / 100;
  if (coupon.maxDiscountAmount) {
    discount = Math.min(discount, coupon.maxDiscountAmount);
  }
  return Math.round(discount);
}

export async function validateAndApplyCoupon(
  code: string,
  orderAmount: number
): Promise<{ coupon: ICoupon; discount: number }> {
  const coupon = await Coupon.findOne({ code: code.toUpperCase() });
  if (!coupon) throw new ApiError(404, 'Invalid coupon code');

  const discount = calculateDiscount(coupon, orderAmount);
  if (discount === 0) throw new ApiError(400, 'Coupon is not valid for this order');

  return { coupon, discount };
}

export interface CreateBookingInput {
  customerId: string;
  staffId?: string;
  anyAvailableStaff: boolean;
  serviceIds: string[];
  date: string;
  startTime: string;
  paymentMethod: 'online' | 'pay_at_saloon';
  couponCode?: string;
  loyaltyPointsRedeemed?: number;
  notes?: string;
}

export async function createBookingWithTransaction(input: CreateBookingInput) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const services = await Service.find({
      _id: { $in: input.serviceIds },
      isActive: true,
    }).session(session);

    if (services.length !== input.serviceIds.length) {
      throw new ApiError(400, 'Invalid services selected');
    }

    const totalDuration = services.reduce((sum, s) => sum + s.durationInMinutes, 0);
    const endTime = addMinutesToTime(input.startTime, totalDuration);
    const totalAmount = services.reduce((sum, s) => sum + s.price, 0);

    let discountAmount = 0;
    let couponId;
    if (input.couponCode) {
      const { coupon, discount } = await validateAndApplyCoupon(input.couponCode, totalAmount);
      discountAmount = discount;
      couponId = coupon._id;
    }

    let loyaltyDiscount = 0;
    if (input.loyaltyPointsRedeemed && input.loyaltyPointsRedeemed > 0) {
      const settings = await SaloonSettings.findOne().session(session);
      const pointValue = settings?.loyaltyPointValue ?? 1;
      loyaltyDiscount = input.loyaltyPointsRedeemed * pointValue;
    }

    const finalAmount = Math.max(0, totalAmount - discountAmount - loyaltyDiscount);
    const date = new Date(input.date);

    let assignedStaffId = input.staffId;

    // Auto-assign staff if "any available"
    if (input.anyAvailableStaff || !assignedStaffId) {
      const availability = await getAvailableSlots(
        input.date,
        input.serviceIds,
        undefined
      );
      const match = availability.find((a) => a.slots.includes(input.startTime));
      if (!match) throw new ApiError(409, 'No staff available for this slot');
      assignedStaffId = match.staffId;
    }

    // Verify slot is still free (race condition check)
    const conflict = await Booking.findOne({
      staffId: assignedStaffId,
      date: { $gte: startOfDay(date), $lte: endOfDay(date) },
      startTime: input.startTime,
      status: { $in: ACTIVE_STATUSES },
    }).session(session);

    if (conflict) throw new ApiError(409, 'This slot was just booked by someone else');

    const bookingServices = services.map((s) => ({
      serviceId: s._id.toString(),
      name: s.name,
      price: s.price,
      durationInMinutes: s.durationInMinutes,
    }));

    const [booking] = await Booking.create(
      [
        {
          customerId: input.customerId,
          staffId: assignedStaffId,
          anyAvailableStaff: input.anyAvailableStaff,
          services: bookingServices,
          date,
          startTime: input.startTime,
          endTime,
          status: 'pending',
          paymentStatus: 'pending',
          paymentMethod: input.paymentMethod,
          totalAmount,
          discountAmount: discountAmount + loyaltyDiscount,
          finalAmount,
          couponApplied: couponId,
          couponCode: input.couponCode?.toUpperCase(),
          loyaltyPointsRedeemed: input.loyaltyPointsRedeemed ?? 0,
          notes: input.notes,
        },
      ],
      { session }
    );

    if (couponId) {
      await Coupon.findByIdAndUpdate(couponId, { $inc: { usedCount: 1 } }).session(session);
    }

    await session.commitTransaction();
    return booking;
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
}

export function canCancelBooking(date: Date, startTime: string): boolean {
  const [h, m] = startTime.split(':').map(Number);
  const appointment = new Date(date);
  appointment.setHours(h, m, 0, 0);
  const hoursLeft = (appointment.getTime() - Date.now()) / (1000 * 60 * 60);
  return hoursLeft >= env.cancellationPolicyHours;
}
