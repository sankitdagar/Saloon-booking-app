import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const { data } = await axios.post(`${API_URL}/auth/refresh`, {}, { withCredentials: true });
        localStorage.setItem('accessToken', data.data.accessToken);
        original.headers.Authorization = `Bearer ${data.data.accessToken}`;
        return api(original);
      } catch {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        const publicPaths = ['/', '/services', '/about', '/login', '/register', '/forgot-password', '/reset-password'];
        const isPublic = publicPaths.some((p) => window.location.pathname === p || window.location.pathname.startsWith('/services/'));
        if (!isPublic && !window.location.pathname.startsWith('/login')) {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// Auth
export const authApi = {
  register: (data: object) => api.post('/auth/register', data),
  login: (data: object) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token: string, password: string) => api.post('/auth/reset-password', { token, password }),
  verifyOtp: (otp: string) => api.post('/auth/verify-otp', { otp }),
  resendOtp: () => api.post('/auth/resend-otp'),
  updateProfile: (data: object) => api.put('/auth/profile', data),
  changePassword: (data: object) => api.put('/auth/change-password', data),
};

// Services
export const servicesApi = {
  getAll: (params?: object) => api.get('/services', { params }),
  getById: (id: string) => api.get(`/services/${id}`),
  getCategories: () => api.get('/services/categories'),
  create: (data: FormData) => api.post('/services', data),
  update: (id: string, data: FormData) => api.put(`/services/${id}`, data),
  delete: (id: string) => api.delete(`/services/${id}`),
};

// Staff
export const staffApi = {
  getAll: (params?: object) => api.get('/staff', { params }),
  getById: (id: string) => api.get(`/staff/${id}`),
  getAvailability: (params: object) => api.get('/staff/availability', { params }),
  create: (data: object) => api.post('/staff', data),
  update: (id: string, data: object) => api.put(`/staff/${id}`, data),
  delete: (id: string) => api.delete(`/staff/${id}`),
};

// Bookings
export const bookingsApi = {
  create: (data: object) => api.post('/bookings', data),
  getMy: (params?: object) => api.get('/bookings/my', { params }),
  getById: (id: string) => api.get(`/bookings/${id}`),
  cancel: (id: string, reason?: string) => api.put(`/bookings/${id}/cancel`, { reason }),
  reschedule: (id: string, data: object) => api.put(`/bookings/${id}/reschedule`, data),
  getAll: (params?: object) => api.get('/bookings', { params }),
  updateStatus: (id: string, status: string) => api.put(`/bookings/${id}/status`, { status }),
  walkIn: (data: object) => api.post('/bookings/walk-in', data),
  markPaid: (id: string) => api.put(`/bookings/${id}/mark-paid`),
};

// Reviews
export const reviewsApi = {
  create: (data: FormData) => api.post('/reviews', data),
  getByService: (id: string) => api.get(`/reviews/service/${id}`),
  getAll: () => api.get('/reviews'),
  respond: (id: string, response: string) => api.put(`/reviews/${id}/respond`, { response }),
  hide: (id: string, isHidden: boolean) => api.put(`/reviews/${id}/hide`, { isHidden }),
};

// Coupons
export const couponsApi = {
  validate: (code: string, orderAmount: number) => api.post('/coupons/validate', { code, orderAmount }),
  getAll: () => api.get('/coupons'),
  create: (data: object) => api.post('/coupons', data),
  update: (id: string, data: object) => api.put(`/coupons/${id}`, data),
  delete: (id: string) => api.delete(`/coupons/${id}`),
};

// Payments
export const paymentsApi = {
  createOrder: (bookingId: string) => api.post('/payments/create-order', { bookingId }),
  verify: (data: object) => api.post('/payments/verify', data),
  mock: (bookingId: string) => api.post('/payments/mock', { bookingId }),
};

// Settings
export const settingsApi = {
  get: () => api.get('/saloon-settings'),
  update: (data: FormData) => api.put('/saloon-settings', data),
};

// Dashboard
export const dashboardApi = {
  getStats: () => api.get('/dashboard/stats'),
  getCustomers: (params?: object) => api.get('/dashboard/customers', { params }),
  blockCustomer: (id: string, isBlocked: boolean) => api.put(`/dashboard/customers/${id}/block`, { isBlocked }),
  getCustomerBookings: (id: string) => api.get(`/dashboard/customers/${id}/bookings`),
  exportReport: (params?: object) => api.get('/dashboard/export', { params, responseType: 'blob' }),
};

// User
export const userApi = {
  getNotifications: () => api.get('/users/notifications'),
  markRead: (ids: string[]) => api.put('/users/notifications/read', { ids }),
  markAllRead: () => api.put('/users/notifications/read-all'),
  getWishlist: () => api.get('/users/wishlist'),
  toggleWishlist: (serviceId: string) => api.post('/users/wishlist/toggle', { serviceId }),
  uploadProfileImage: (file: File) => {
    const fd = new FormData();
    fd.append('image', file);
    return api.post('/users/profile-image', fd);
  },
};
