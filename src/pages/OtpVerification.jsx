import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { sendOtp, verifyOtp } from "../api/auth";

export default function OtpVerification() {
  const navigate = useNavigate();
  const email = localStorage.getItem("pendingEmail");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  if (!email) {
    navigate("/register");
  }

  const handleVerify = async () => {
    if (!otp) {
      toast.error("Please enter the OTP");
      return;
    }
    setLoading(true);
    try {
      const res = await verifyOtp({ email, otp });
      toast.success(res.data.message);
      localStorage.removeItem("pendingEmail");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await sendOtp({ email });
      toast.success("OTP resent successfully");
    } catch {
      toast.error("Failed to resend OTP");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-sm">
        <h2 className="text-lg font-bold text-center mb-4">Verify OTP</h2>
        <p className="text-sm text-gray-600 mb-4">
          We sent an OTP to <b>{email}</b>. Please enter it below to get your ₹50 bonus.
        </p>
        <input
          type="text"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          placeholder="Enter OTP"
          className="w-full p-2 border border-gray-300 rounded mb-4"
        />
        <button
          onClick={handleVerify}
          disabled={loading}
          className="w-full !bg-black text-white py-2 rounded mb-2"
        >
          {loading ? "Verifying..." : "Confirm"}
        </button>
        <button
          onClick={handleResend}
          className="w-full text-sm !bg-black text-blue-500 underline"
        >
          Resend OTP
        </button>
      </div>
    </div>
  );
}
