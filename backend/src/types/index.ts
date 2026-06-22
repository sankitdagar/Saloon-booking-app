export type UserRole = 'customer' | 'admin' | 'staff';

export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'in-progress'
  | 'completed'
  | 'cancelled'
  | 'no-show';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export type PaymentMethod = 'online' | 'pay_at_saloon';

export type DiscountType = 'percentage' | 'flat';

export type NotificationType =
  | 'booking_confirmed'
  | 'booking_cancelled'
  | 'booking_rescheduled'
  | 'booking_reminder'
  | 'offer'
  | 'general';

export type ServiceCategory =
  | 'Hair'
  | 'Skin'
  | 'Spa'
  | 'Makeup'
  | 'Nails'
  | 'Grooming'
  | 'Other';

export interface DayWorkingHours {
  isOpen: boolean;
  openTime: string; // "09:00" 24h format
  closeTime: string; // "18:00"
}

export interface WeeklyWorkingHours {
  monday: DayWorkingHours;
  tuesday: DayWorkingHours;
  wednesday: DayWorkingHours;
  thursday: DayWorkingHours;
  friday: DayWorkingHours;
  saturday: DayWorkingHours;
  sunday: DayWorkingHours;
}

export interface TimeRange {
  startTime: string; // "HH:mm"
  endTime: string;
}

export interface JwtPayload {
  userId: string;
  role: UserRole;
}

export interface BookingServiceItem {
  serviceId: string;
  name: string;
  price: number;
  durationInMinutes: number;
}
