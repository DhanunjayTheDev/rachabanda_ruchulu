import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  register: (data: any) => apiClient.post('/auth/register', data),
  login: (data: any) => apiClient.post('/auth/login', data),
  logout: () => apiClient.post('/auth/logout'),
};

export const foodAPI = {
  getAll: (params?: any) => apiClient.get('/foods', { params }),
  getFeatured: () => apiClient.get('/foods/featured'),
  getBestsellers: () => apiClient.get('/foods/bestsellers'),
  getById: (id: string) => apiClient.get(`/foods/${id}`),
};

export const categoryAPI = {
  getAll: () => apiClient.get('/categories'),
};

export const cartAPI = {
  add: (data: any) => apiClient.post('/cart/add', data),
  get: () => apiClient.get('/cart'),
  update: (itemId: string, data: any) => apiClient.put(`/cart/update/${itemId}`, data),
  remove: (itemId: string) => apiClient.delete(`/cart/remove/${itemId}`),
  clear: () => apiClient.delete('/cart/clear'),
};

export const wishlistAPI = {
  add: (data: any) => apiClient.post('/wishlist/add', data),
  get: () => apiClient.get('/wishlist'),
  remove: (data: any) => apiClient.delete('/wishlist/remove', { data }),
  clear: () => apiClient.delete('/wishlist/clear'),
};

export const orderAPI = {
  create: (data: any) => apiClient.post('/orders', data),
  getAll: () => apiClient.get('/orders'),
  getById: (id: string) => apiClient.get(`/orders/${id}`),
};

export const paymentAPI = {
  createOrder: (data: any) => apiClient.post('/payments/create-order', data),
  verify: (data: any) => apiClient.post('/payments/verify', data),
};

export const userAPI = {
  getProfile: () => apiClient.get('/users/profile'),
  updateProfile: (data: any) => apiClient.put('/users/profile', data),
  getAddresses: () => apiClient.get('/users/addresses'),
  addAddress: (data: any) => apiClient.post('/users/addresses', data),
  updateAddress: (id: string, data: any) => apiClient.put(`/users/addresses/${id}`, data),
  deleteAddress: (id: string) => apiClient.delete(`/users/addresses/${id}`),
};

export const contactAPI = {
  submit: (data: any) => apiClient.post('/contact', data),
};

export const announcementAPI = {
  getAll: () => apiClient.get('/announcements'),
};

export const couponAPI = {
  getAll: () => apiClient.get('/coupons'),
  verify: (data: { code: string; orderValue: number }) => apiClient.post('/coupons/verify', data),
};

export const settingsAPI = {
  get: () => apiClient.get('/settings'),
};

export default apiClient;
