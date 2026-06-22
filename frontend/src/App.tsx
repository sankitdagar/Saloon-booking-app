import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import CustomerLayout, { ProtectedRoute, GuestRoute, RequireCustomer } from './components/Layout';

import HomePage from './pages/HomePage';
import ServicesPage from './pages/ServicesPage';
import ServiceDetailPage from './pages/ServiceDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import VerifyOtpPage from './pages/VerifyOtpPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import BookingPage from './pages/BookingPage';
import BookingConfirmationPage from './pages/BookingConfirmationPage';
import MyBookingsPage from './pages/MyBookingsPage';
import ProfilePage from './pages/ProfilePage';
import AboutPage from './pages/AboutPage';
import NotificationsPage from './pages/NotificationsPage';
import WishlistPage from './pages/WishlistPage';

import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminServicesPage from './pages/admin/AdminServicesPage';
import AdminStaffPage from './pages/admin/AdminStaffPage';
import AdminBookingsPage from './pages/admin/AdminBookingsPage';
import AdminCustomersPage from './pages/admin/AdminCustomersPage';
import AdminCouponsPage from './pages/admin/AdminCouponsPage';
import AdminReviewsPage from './pages/admin/AdminReviewsPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';
import AdminReportsPage from './pages/admin/AdminReportsPage';

import StaffDashboard from './pages/staff/StaffDashboard';

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30000, retry: 1 } },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Customer routes */}
            <Route element={<CustomerLayout />}>
              <Route index element={<HomePage />} />
              <Route path="services" element={<ServicesPage />} />
              <Route path="services/:id" element={<ServiceDetailPage />} />
              <Route path="about" element={<AboutPage />} />
              <Route path="book" element={<RequireCustomer><BookingPage /></RequireCustomer>} />
              <Route path="booking-confirmation/:id" element={<RequireCustomer><BookingConfirmationPage /></RequireCustomer>} />
              <Route path="bookings" element={<ProtectedRoute roles={['customer']}><MyBookingsPage /></ProtectedRoute>} />
              <Route path="profile" element={<ProtectedRoute roles={['customer', 'admin', 'staff']}><ProfilePage /></ProtectedRoute>} />
              <Route path="notifications" element={<ProtectedRoute roles={['customer', 'admin', 'staff']}><NotificationsPage /></ProtectedRoute>} />
              <Route path="wishlist" element={<RequireCustomer><WishlistPage /></RequireCustomer>} />
            </Route>

            {/* Auth routes */}
            <Route path="login" element={<GuestRoute><LoginPage /></GuestRoute>} />
            <Route path="register" element={<GuestRoute><RegisterPage /></GuestRoute>} />
            <Route path="verify-otp" element={<ProtectedRoute><VerifyOtpPage /></ProtectedRoute>} />
            <Route path="forgot-password" element={<ForgotPasswordPage />} />
            <Route path="reset-password" element={<ResetPasswordPage />} />

            {/* Admin routes */}
            <Route path="admin" element={<ProtectedRoute roles={['admin']}><AdminLayout /></ProtectedRoute>}>
              <Route index element={<AdminDashboard />} />
              <Route path="services" element={<AdminServicesPage />} />
              <Route path="staff" element={<AdminStaffPage />} />
              <Route path="bookings" element={<AdminBookingsPage />} />
              <Route path="customers" element={<AdminCustomersPage />} />
              <Route path="coupons" element={<AdminCouponsPage />} />
              <Route path="reviews" element={<AdminReviewsPage />} />
              <Route path="settings" element={<AdminSettingsPage />} />
              <Route path="reports" element={<AdminReportsPage />} />
            </Route>

            {/* Staff routes */}
            <Route path="staff" element={<ProtectedRoute roles={['staff']}><StaffDashboard /></ProtectedRoute>} />
          </Routes>
        </BrowserRouter>
        <Toaster position="top-right" />
      </AuthProvider>
    </QueryClientProvider>
  );
}
