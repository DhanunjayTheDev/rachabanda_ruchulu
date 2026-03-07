import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const adminAuthAPI = {
  login: (data: { email: string; password: string }) => api.post('/admin/login', data),
  getProfile: () => api.get('/admin/profile'),
  updateProfile: (data: Record<string, unknown>) => api.put('/admin/profile', data),
};

// Dashboard
export const dashboardAPI = {
  getStats: () => api.get('/admin/dashboard/stats'),
  getRecentOrders: () => api.get('/admin/dashboard/recent-orders'),
  getRevenue: (period: string) => api.get(`/admin/dashboard/revenue?period=${period}`),
};

// Foods
export const foodsAPI = {
  getAll: (params?: Record<string, string>) => api.get('/foods', { params }),
  getById: (id: string) => api.get(`/foods/${id}`),
  create: (data: FormData) => api.post('/foods', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id: string, data: FormData) => api.put(`/foods/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id: string) => api.delete(`/foods/${id}`),
};

// Categories
export const categoriesAPI = {
  getAll: () => api.get('/categories'),
  create: (data: FormData) => api.post('/categories', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id: string, data: FormData) => api.put(`/categories/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id: string) => api.delete(`/categories/${id}`),
};

// Orders
export const ordersAPI = {
  getAll: (params?: Record<string, string>) => api.get('/admin/orders', { params }),
  getById: (id: string) => api.get(`/admin/orders/${id}`),
  updateStatus: (id: string, status: string) => api.put(`/admin/orders/${id}/status`, { status }),
};

// Customers
export const customersAPI = {
  getAll: (params?: Record<string, string>) => api.get('/admin/customers', { params }),
  getById: (id: string) => api.get(`/admin/customers/${id}`),
  block: (id: string) => api.put(`/admin/customers/${id}/block`, {}),
  unblock: (id: string) => api.put(`/admin/customers/${id}/unblock`, {}),
  delete: (id: string) => api.delete(`/admin/customers/${id}`),
};

// Payments
export const paymentsAPI = {
  getAll: (params?: Record<string, string>) => api.get('/admin/payments', { params }),
  getRevenue: () => api.get('/admin/payments/revenue'),
};

// Reviews
export const reviewsAPI = {
  getAll: (params?: Record<string, string>) => api.get('/admin/reviews', { params }),
  delete: (id: string) => api.delete(`/admin/reviews/${id}`),
};

// Settings
export const settingsAPI = {
  get: () => api.get('/admin/settings'),
  update: (data: Record<string, unknown>) => api.put('/admin/settings', data),
};

// Coupons
export const couponsAPI = {
  getAll: () => api.get('/coupons/admin/all'),
  create: (data: Record<string, unknown>) => api.post('/coupons', data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/coupons/${id}`, data),
  delete: (id: string) => api.delete(`/coupons/${id}`),
};

// Announcements
export const announcementsAPI = {
  getAll: () => api.get('/announcements/admin/all'),
  create: (data: FormData) => api.post('/announcements', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id: string, data: FormData) => api.put(`/announcements/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id: string) => api.delete(`/announcements/${id}`),
};

// Restaurants
export const restaurantsAPI = {
  getMain: () => api.get('/admin/restaurant'),
  getAll: () => api.get('/admin/restaurants'),
  getById: (id: string) => api.get(`/admin/restaurants/${id}`),
  create: (data: Record<string, unknown>) => api.post('/admin/restaurants', data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/admin/restaurants/${id}`, data),
  delete: (id: string) => api.delete(`/admin/restaurants/${id}`),
  updateStatus: (id: string, isOpen: boolean) => api.put(`/admin/restaurants/${id}/status`, { isOpen }),
  updateHours: (id: string, openingHours: Record<string, unknown>) => api.put(`/admin/restaurants/${id}/hours`, { openingHours }),
};

// QR Codes
export const qrCodesAPI = {
  getAll: () => api.get('/admin/qrcodes'),
  getById: (id: string) => api.get(`/admin/qrcodes/${id}`),
  create: (data: Record<string, unknown>) => api.post('/admin/qrcodes', data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/admin/qrcodes/${id}`, data),
  delete: (id: string) => api.delete(`/admin/qrcodes/${id}`),
};

export default api;
