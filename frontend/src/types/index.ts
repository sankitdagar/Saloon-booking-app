export type UserRole = 'customer' | 'admin' | 'staff';

export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  profileImage?: string;
  loyaltyPoints: number;
  isPhoneVerified: boolean;
  isBlocked: boolean;
}

export interface Service {
  _id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  price: number;
  durationInMinutes: number;
  image: string;
  isActive: boolean;
  averageRating: number;
  totalReviews: number;
}

export interface StaffMember {
  _id: string;
  userId: { _id: string; name: string; email: string; profileImage?: string };
  bio: string;
  servicesOffered: Service[];
  workingHours: Record<string, { isOpen: boolean; openTime: string; closeTime: string }>;
  rating: number;
  totalBookingsCompleted: number;
  isActive: boolean;
}

export interface BookingService {
  serviceId: string;
  name: string;
  price: number;
  durationInMinutes: number;
}

export interface Booking {
  _id: string;
  customerId: User | string;
  staffId?: StaffMember | string;
  anyAvailableStaff: boolean;
  services: BookingService[];
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  totalAmount: number;
  discountAmount: number;
  finalAmount: number;
  couponCode?: string;
  loyaltyPointsEarned: number;
  notes?: string;
  createdAt: string;
}

export interface Review {
  _id: string;
  customerId: { name: string; profileImage?: string };
  rating: number;
  comment: string;
  images: string[];
  adminResponse?: string;
  createdAt: string;
}

export interface Coupon {
  _id: string;
  code: string;
  description: string;
  discountType: 'percentage' | 'flat';
  discountValue: number;
  minOrderAmount: number;
  validFrom: string;
  validTo: string;
  usageLimit: number;
  usedCount: number;
  isActive: boolean;
}

export interface SaloonSettings {
  businessName: string;
  tagline: string;
  address: { street: string; city: string; state: string; pincode: string; country: string };
  location: { lat: number; lng: number };
  logo: string;
  galleryImages: string[];
  workingHours: Record<string, { isOpen: boolean; openTime: string; closeTime: string }>;
  holidays: string[];
  contactInfo: { phone: string; email: string; whatsapp?: string };
  about: string;
  cancellationPolicyHours: number;
}

export interface Notification {
  _id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface DashboardStats {
  todayBookings: Booking[];
  pendingBookings: number;
  totalCustomers: number;
  cancellationRate: number;
  revenue: { today: number; weekly: { _id: string; total: number }[]; monthly: { _id: string; total: number }[] };
  topServices: { _id: string; name: string; count: number }[];
  staffPerformance: StaffMember[];
}
