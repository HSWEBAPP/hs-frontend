import { useState } from 'react';
import { sendForgotPasswordOtp, verifyForgotPasswordOtp, resetPassword } from '../../api/auth';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import Banner from "../../assets/images/login-banner.jpg";

export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // Step 1: Send OTP
  const handleSendOtp = async () => {
    if (!email) return toast.error('Please enter your email');
    try {
      setLoading(true);
      await sendForgotPasswordOtp({ email,  context: "forgotPassword"  });
      toast.success('OTP sent successfully');
      setStep(2);
      setLoading(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP');
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async () => {
    try {
      setLoading(true);
      await verifyForgotPasswordOtp({ email, otp });
      toast.success('OTP verified');
      setStep(3);
      setLoading(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid or expired OTP');
      setLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async () => {
    if (!newPassword) return toast.error("Please enter a new password");
    try {
      setLoading(true);
      await resetPassword({ email, newPassword });
      toast.success('Password reset successfully. Redirecting to login...');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      {/* Left Banner */}
      <div className="hidden md:block">
        <img src={Banner} alt="Forgot Banner" className="w-full h-full object-cover" />
      </div>

      {/* Right Form */}
      <div className="flex items-center justify-center bg-gray-100 px-6 py-12">
        <div className="bg-white p-8 rounded shadow-md w-full max-w-md space-y-4">

          {/* Step 1: Enter Email */}
          {step === 1 && (
            <>
              <h2 className="text-xl font-bold text-center text-black">Forgot Password</h2>
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full p-2 border text-black rounded border-gray-400"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button
                onClick={handleSendOtp}
                disabled={loading}
                className={`w-full bg-blue-600 text-white py-2 rounded ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loading ? 'Processing...' : 'Send OTP'}
              </button>
            </>
          )}

          {/* Step 2: Verify OTP */}
          {step === 2 && (
            <>
              <h2 className="text-xl font-bold text-center text-black">Verify OTP</h2>
              <input
                type="text"
                placeholder="Enter OTP"
                className="w-full p-2 border rounded text-black border-gray-400"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
              <button
                onClick={handleVerifyOtp}
                disabled={loading}
                className={`w-full bg-blue-600 text-white py-2 rounded ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loading ? 'Processing...' : 'Verify OTP'}
              </button>
            </>
          )}

          {/* Step 3: Reset Password */}
          {step === 3 && (
            <>
              <h2 className="text-xl font-bold text-center text-black">Enter New Password</h2>
              <input
                type="password"
                placeholder="Enter new password"
                className="w-full p-2 border rounded text-black border-gray-400"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <button
                onClick={handleResetPassword}
                disabled={loading}
                className={`w-full bg-blue-600 text-white py-2 rounded ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loading ? 'Processing...' : 'Reset Password'}
              </button>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
