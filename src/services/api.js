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

// QR service for authentication
export const qrService = {
  generateLoginQR: () =>
    api.post('/qr/generate-login'),
  authenticateWithQR: (sessionCode) =>
    api.post('/qr/authenticate', { sessionCode }),
  checkQRStatus: (sessionCode) =>
    api.get(`/qr/status/${sessionCode}`),
  generateScanSessionQR: () =>
    api.post('/qr/generate-scan-session'),
};

// Bottle scan service
export const bottleScanService = {
  submitScannedBottle: (barcode, bottleSize, quantity, pricePerUnit, sessionCode) =>
    api.post('/bottle-scan', { barcode, bottleSize, quantity, pricePerUnit, sessionCode }),
  verifyBarcode: (barcode, bottleSize) =>
    api.post('/bottle-scan/verify-barcode', { barcode, bottleSize }),
  getUserScannedBottles: () =>
    api.get('/bottle-scan/my'),
  getScannedBottleById: (id) =>
    api.get(`/bottle-scan/${id}`),
};

export default api;
