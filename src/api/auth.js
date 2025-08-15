import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api/', // Replace with your deployed URL if needed
});

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

// ✅ Deduct ₹10 for a tool usage
export const deductWallet = (feature) =>
  API.post('wallet/deduct', { feature }, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`
    }
  });

// ✅ Recharge wallet
export const rechargeWallet = (amount) =>
  API.patch('wallet/recharge', { amount }, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`
    }
  });

// ✅ Get current wallet balance
export const getWalletBalance = () =>
  API.get('wallet/balance', {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
       'Cache-Control': 'no-cache',
      Pragma: 'no-cache',
    }
  });

  export const fetchUsers = () =>
  API.get("admin/users", {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  export const updateUserStatus = (id, status) =>
  API.patch(`admin/users/${id}/toggle`, { status }, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });

export const getQRCodes = () =>
  API.get("qrcode");



export const fetchRechargeRequests = async () => {
  return axios.get(`${BASE_URL}/recharges`);
};

export const approveRecharge = async (id) => {
  return axios.put(`${BASE_URL}/recharges/approve/${id}`);
};

export const fetchTransactions = async () => {
  return axios.get(`${BASE_URL}/transactions`);
};

export const manualRecharge = async (data) => {
  return axios.post(`${BASE_URL}/recharges/manual`, data);
};


