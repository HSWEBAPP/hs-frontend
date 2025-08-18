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
    .min(6, "Password must be at minimum 6 characters"),
});
  const { fetchBalance } = useWallet();
const formik = useFormik({
  initialValues: {
    emailOrMobile: "",
    password: "",
  },
 validationSchema, 
  onSubmit: async (values, { setSubmitting }) => {
    try {
      setLoading(true);
      const res = await axios.post(
        "https://hs-backend-2.onrender.com/api/auth/login",
        values
      );
      setLoading(false);
      toast.success("Login is success");
      localStorage.setItem("token", res.data.token);
      setTimeout(() => {
        setLoading(false);
        navigate("/dashboard");
      }, 5000);
      fetchBalance();
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed.");
      setLoading(false);
    } finally {
      setSubmitting(false);
      setLoading(false);
    }
  },
});


  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 h-screen ">
      {/* Left Banner Image (Visible only on large screens) */}
      <div className="hidden lg:block h-full">
        <img src={Banner} alt="Banner" className="w-full h-full object-cover" />
      </div>

      {/* Right Login Form */}
      <div className="flex items-center justify-center bg-gray-200 px-4 py-8">
        <form
          onSubmit={formik.handleSubmit}
          className="bg-white p-8 rounded shadow-md w-full max-w-md space-y-4"
        >
          <h2 className="text-2xl font-bold text-center text-black">Login</h2>
          {/* <label className="text-black">Your Mai</label> */}
          <input
            type="text"
            name="emailOrMobile"
            placeholder="Email"
            onChange={formik.handleChange}
            value={formik.values.emailOrMobile}
            className="w-full p-2 border border-[#A9A8A8] rounded text-black mb-2"
          />
          {formik.errors.emailOrMobile ? (
            <p className="text-red-500 text-sm mb-0">
              {formik.errors.emailOrMobile}
            </p>
          ) : (
            <p className=" h-[20px] mb-0"></p>
          )}
          {/* <label className="text-black">Your Name</label> */}
          <div className="relative mb-0">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              onChange={formik.handleChange}
              value={formik.values.password}
              className="w-full p-2 pr-10 border rounded border-[#A9A8A8] text-black mt-4 mb-2"
            />
            <div className="absolute top-[30px] right-[15px]">
              {showPassword ? (
                 <FaEye
                  color="black"
                  className="cursor-pointer"
                  onClick={() => setShowPassword((prev) => !prev)}
                />
              ) : (

                <FaEyeSlash
                  color="black"
                  className="cursor-pointer"
                  onClick={() => setShowPassword((prev) => !prev)}
                />
               
              )}
            </div>
          </div>

          {formik.errors.password ? (
            <p className="text-red-500 text-sm mb-2">
              {formik.errors.password}
            </p>
          ) : (
            <p className=" h-[20px] mb-2"></p>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-blue-600 text-white py-2 rounded ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Loggingin..." : " Login"}
          </button>

          {/* Forgot Password + Register link */}
          <div className="flex justify-between text-sm">
            <Link
              to="/forgot-password"
              className="text-blue-500 hover:underline"
            >
              Forgot Password?
            </Link>
            <span className="text-black">
              Don’t have an account?{" "}
              <Link to="/register" className="text-blue-500 hover:underline">
                Register Now
              </Link>
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}
