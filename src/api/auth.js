import axios from 'axios';

const API = axios.create({
  baseURL: 'https://hs-backend-2.onrender.com/', // Replace with deployed URL if needed
});
// Interceptor: attach token to every request
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token"); // token stored after login
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});
export default API;

// ==================== AUTH ====================

// Register new user
export const register = (userData) => API.post('auth/register', userData);

// Login user with email or mobile
export const login = (loginData) => API.post('auth/login', loginData);

// Send OTP to email for forgot password
export const sendOtp = (data, config) => API.post('auth/send-otp', data, config);

// Verify OTP
export const verifyOtp = (data) => API.post('auth/verify-otp', data);

// Send OTP for forgot password
export const sendForgotPasswordOtp = (data) =>
  API.post('auth/forgot-password/send-otp', data);

// Verify OTP for forgot password
export const verifyForgotPasswordOtp = (data) =>
  API.post('auth/forgot-password/verify-otp', data);

// Reset password
export const resetPassword = (data) => API.post('auth/reset-password', data);

// ==================== ADMIN ====================

// Update user
export const updateUser = (id, updates) =>
  API.put(`admin/users/${id}`, updates);

// Get all users
export const fetchUsers = () =>
  API.get('admin/users', {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  });

// Update user status
export const updateUserStatus = (id, status) =>
  API.patch(
    `admin/users/${id}/toggle`,
    { status },
    { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
  );

// ==================== WALLET ====================

// Deduct ₹10 for a tool usage
export const deductWallet = (feature) =>
  API.post(
    'wallet/deduct',
    { feature },
    { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
  );

// Recharge wallet
export const rechargeWallet = (amount) =>
  API.patch(
    'wallet/recharge',
    { amount },
    { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
  );

// Get current wallet balance
export const getWalletBalance = () =>
  API.get('wallet/balance', {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
      'Cache-Control': 'no-cache',
      Pragma: 'no-cache',
    },
  });

// ==================== QR CODES ====================
export const getQRCodes = () => API.get('qrcode');

// ==================== RECHARGE ====================
export const fetchRechargeRequests = () => API.get('admin/wallet/recharges');

export const approveRecharge = (id) =>
  API.put(`admin/wallet/recharges/approve/${id}`);

export const rejectRechargeRequest = (id) =>
  API.put(`admin/wallet/recharges/reject/${id}`);

export const fetchTransactions = () =>
  API.get("admin/wallet/transactions");

export const manualRecharge = (data) =>
  API.post("admin/wallet/recharges/manual", data);
