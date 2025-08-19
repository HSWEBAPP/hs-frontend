import { useState } from "react";
import { toast } from "react-hot-toast";
import { verifyOtp, sendOtp } from "../api/auth";
import { useWallet } from "../contexts/WalletContext";
import { useNavigate } from "react-router-dom";

export default function CongratsModal({ email, onVerified }) {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const { fetchBalance } = useWallet();
const navigate =useNavigate()
  const handleOtpVerify = async () => {
    if (!otp) {
      toast.error("Please enter OTP");
      return;
    }
    try {
      setLoading(true);
      const res = await verifyOtp({ email, otp, context: "register" });
console.log(res, 787898);

      // ✅ Store token from OTP verification
      localStorage.setItem("token", res.data.token);
  localStorage.setItem("userName", res.data.emailOrMobile);
      // ✅ Fetch updated wallet balance
      await fetchBalance();

      toast.success(res.data.message);

      // ✅ Call parent callback and navigate to dashboard
      onVerified();
      // navigate("/dashboard");

    } catch (err) {
      toast.error(err.response?.data?.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      setResending(true);
      await sendOtp({ email });
      
      toast.success("OTP resent successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to resend OTP");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-bold mb-4 text-center">
          🎉 Congratulations!
        </h2>
        <p className="text-center text-gray-700 mb-4">
          ₹50 has been added to your wallet.<br />
          Go and use our services for free up to ₹50.
        </p>

        <input
          type="text"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          placeholder="Enter OTP"
          className="w-full p-2 border rounded mb-4 text-black"
        />

        <button
          onClick={handleOtpVerify}
          disabled={loading}
          className="!bg-black text-white w-full py-2 rounded mb-2"
        >
          {loading ? "Verifying..." : "Verify OTP"}
        </button>

        <button
          onClick={handleResendOtp}
          disabled={resending}
          className="!text-blue-500 text-sm w-full"
        >
          {resending ? "Resending..." : "Resend OTP"}
        </button>
      </div>
    </div>
  );
}
