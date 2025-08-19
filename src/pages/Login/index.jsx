import { useFormik } from "formik";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import Banner from "../../assets/images/login-banner.jpg";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { toast } from "react-hot-toast";
import { useState } from "react";
import * as Yup from 'yup';
import { useWallet } from "../../contexts/WalletContext";

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { fetchBalance } = useWallet();

  const validationSchema = Yup.object({
    emailOrMobile: Yup.string()
      .required("Email or Mobile is required")
      .test("email-or-mobile", "Enter a valid email or mobile number", function (value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const mobileRegex = /^[0-9]{10}$/;
        return emailRegex.test(value) || mobileRegex.test(value);
      }),
    password: Yup.string()
      .required("Password is required")
      .min(6, "Password must be at least 6 characters"),
  });

  const formik = useFormik({
    initialValues: { emailOrMobile: "", password: "" },
    validationSchema, 
    onSubmit: async (values, { setSubmitting }) => {
      try {
        setLoading(true);
        const res = await axios.post(
          "https://hs-backend-2.onrender.com/api/auth/login",
          values,
          { withCredentials: true }
        );
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("userName", values.emailOrMobile);
        toast.success("Login successful");
        fetchBalance();
        navigate("/dashboard");
      } catch (err) {
        toast.error(err.response?.data?.message || "Login failed.");
      } finally {
        setLoading(false);
        setSubmitting(false);
      }
    },
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 h-screen">
      {/* Left Banner */}
      <div className="hidden lg:block">
        <img
          src={Banner}
          alt="Banner"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Right Login Form */}
      <div className="flex items-center justify-center bg-gray-100 px-6 py-12">
        <form
          onSubmit={formik.handleSubmit}
          className="bg-white p-10 rounded-2xl shadow-lg w-full max-w-md space-y-6 transition-all"
        >
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-4">
            Welcome Back
          </h2>
          <p className="text-center text-gray-500 mb-6">
            Login to your account to continue
          </p>

          {/* Email or Mobile */}
          <div className="relative">
            <input
              type="text"
              name="emailOrMobile"
              placeholder="Email or Mobile"
              value={formik.values.emailOrMobile}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800 ${
                formik.touched.emailOrMobile && formik.errors.emailOrMobile
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
            />
            {formik.touched.emailOrMobile && formik.errors.emailOrMobile && (
              <p className="text-red-500 text-sm mt-1">{formik.errors.emailOrMobile}</p>
            )}
          </div>

          {/* Password */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={`w-full p-3 pr-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800 ${
                formik.touched.password && formik.errors.password
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
            />
            <div
              className="absolute top-4 right-3 text-gray-600 cursor-pointer"
              onClick={() => setShowPassword(prev => !prev)}
            >
              {showPassword ? <FaEye /> : <FaEyeSlash />}
            </div>
            {formik.touched.password && formik.errors.password && (
              <p className="text-red-500 text-sm mt-1">{formik.errors.password}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg text-white font-semibold transition ${
              loading ? "bg-gray-400 cursor-not-allowed" : "bg-black hover:bg-gray-900"
            }`}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          {/* Links */}
          <div className="flex justify-between text-sm text-gray-600">
            <Link to="/forgot-password" className="text-blue-500 hover:underline">
              Forgot Password?
            </Link>
            <span>
              Don't have an account?{" "}
              <Link to="/register" className="text-blue-500 hover:underline">
                Register
              </Link>
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}
