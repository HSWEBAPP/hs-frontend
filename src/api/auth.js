// src/api/index.js
import axios from "axios";

// ==================== AXIOS INSTANCE ====================
const API = axios.create({
  baseURL: "https://hs-backend-2.onrender.com/api/", // Always include /api
});

// Interceptor: attach token to every request
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export default API;

// ==================== AUTH ====================

// Register new user
export const register = (userData) => API.post("auth/register", userData);

// Login user with email or mobile
export const login = (loginData) => API.post("auth/login", loginData);

// Send OTP to email
export const sendOtp = (data) => API.post("auth/send-otp", data);

// Verify OTP
export const verifyOtp = (data) => API.post("auth/verify-otp", data);

// Forgot password OTP
export const sendForgotPasswordOtp = (data) =>
  API.post("auth/forgot-password/send-otp", data);

export const verifyForgotPasswordOtp = (data) =>
  API.post("auth/forgot-password/verify-otp", data);

export const resetPassword = (data) => API.post("auth/reset-password", data);

// ==================== ADMIN ====================

export const updateUser = (id, updates) => API.put(`admin/users/${id}`, updates);

export const fetchUsers = () => API.get("admin/users");

export const updateUserStatus = (id, status) =>
API.patch(`admin/users/${id}/toggle`, { status });



// ==================== WALLET ====================

// Deduct ₹10 for a tool usage
export const deductWallet = (feature) => API.post("wallet/deduct-tool-usage", { feature });


// Recharge wallet (QR Upload)
export const rechargeWallet = (formData) =>
  API.post("wallet/user/recharge/qr", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

// Get current wallet balance
export const getWalletBalance = () => API.get("wallet/balance");

// Get wallet history
export const getWalletHistory = () => API.get("wallet/user/history");

// ==================== QR CODES ====================

export const getQRCodes = () => API.get("qrcode");
export const createQRCode = (formData) =>
  API.post("api/qrcode/create", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const deleteQRCode = (id) => API.delete(`api/qrcode/${id}`);
// ==================== RECHARGE ====================

export const fetchRechargeRequests = () =>
  API.get("admin/wallet/recharges");

export const approveRecharge = (id) =>
  API.put(`admin/wallet/recharges/approve/${id}`);

export const rejectRechargeRequest = (id) =>
  API.put(`admin/wallet/recharges/reject/${id}`);

// ================= ADMIN =================
export const fetchAdminTransactions = () =>
  API.get("admin/wallet/transactions"); // all users

// ================= USER =================
export const fetchUserTransactions = () =>
  API.get("wallet/transactions"); // only logged-in user


export const manualRecharge = (data) =>
  API.post("admin/wallet/recharges/manual", data);

