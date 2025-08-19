import { useState } from 'react';
import { sendForgotPasswordOtp, verifyForgotPasswordOtp, resetPassword } from '../../api/auth';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import Banner from "../../assets/images/login-banner.jpg";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  // Step 1: Send OTP
  const handleSendOtp = async () => {
    if (!email) return toast.error('Please enter your email');
    try {
      setLoading(true);
      await sendForgotPasswordOtp({ email, context: "forgotPassword" });
      toast.success('OTP sent successfully');
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async () => {
    if (!otp) return toast.error('Please enter OTP');
    try {
      setLoading(true);
      await verifyForgotPasswordOtp({ email, otp });
      toast.success('OTP verified');
      setStep(3);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid or expired OTP');
    } finally {
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

  const renderStep = () => {
    switch(step) {
      case 1:
        return (
          <>
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full p-3 border rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 text-black"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button
              onClick={handleSendOtp}
              disabled={loading}
              className={`w-full bg-blue-600 text-white py-3 rounded-lg mt-4 hover:bg-blue-700 transition ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Processing...' : 'Send OTP'}
            </button>
          </>
        );
      case 2:
        return (
          <>
            <input
              type="text"
              placeholder="Enter OTP"
              className="w-full p-3 border rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 text-black"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
            <button
              onClick={handleVerifyOtp}
              disabled={loading}
              className={`w-full bg-blue-600 text-white py-3 rounded-lg mt-4 hover:bg-blue-700 transition ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Processing...' : 'Verify OTP'}
            </button>
          </>
        );
      case 3:
        return (
          <>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter new password"
                className="w-full p-3 border rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 text-black"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <div
                className="absolute top-4 right-3 cursor-pointer text-gray-600"
                onClick={() => setShowPassword(prev => !prev)}
              >
                {showPassword ? <FaEye /> : <FaEyeSlash />}
              </div>
            </div>
            <button
              onClick={handleResetPassword}
              disabled={loading}
              className={`w-full bg-blue-600 text-white py-3 rounded-lg mt-4 hover:bg-blue-700 transition ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Processing...' : 'Reset Password'}
            </button>
          </>
        );
      default:
        return null;
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
        <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md space-y-6">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">
            {step === 1 ? "Forgot Password" : step === 2 ? "Verify OTP" : "Reset Password"}
          </h2>

          {/* Step Indicator */}
          <div className="flex justify-center items-center space-x-2 mb-4">
            {[1,2,3].map((s) => (
              <div key={s} className={`w-8 h-1 rounded-full ${step >= s ? "bg-blue-600" : "bg-gray-300"} transition-all`}></div>
            ))}
          </div>

          {renderStep()}

        </div>
      </div>
    </div>
  );
}
