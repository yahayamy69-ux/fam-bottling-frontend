import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth service
export const authService = {
  register: (name, email, password, passwordConfirm) =>
    api.post('/auth/register', { name, email, password, passwordConfirm }),
  login: (email, password) =>
    api.post('/auth/login', { email, password }),
  getProfile: () =>
    api.get('/auth/profile'),
};

// Supply service
export const supplyService = {
  submitSupply: (bottleSize, quantity, pricePerUnit) =>
    api.post('/supply', { bottleSize, quantity, pricePerUnit }),
  getUserSupplies: () =>
    api.get('/supply/my'),
  getSupplyById: (id) =>
    api.get(`/supply/${id}`),
};

// Admin service
export const adminService = {
  getAllSupplies: () =>
    api.get('/admin/supplies'),
  updateSupplyStatus: (id, status, notes) =>
    api.patch(`/admin/supply/${id}`, { status, notes }),
  toggleReturningCustomer: (userId) =>
    api.patch(`/admin/user/${userId}/returning`),
  getUserDetails: (userId) =>
    api.get(`/admin/user/${userId}`),
};

// Contact service
export const contactService = {
  submitContact: (name, email, subject, message) =>
    api.post('/contact', { name, email, subject, message })
};

export default api;
