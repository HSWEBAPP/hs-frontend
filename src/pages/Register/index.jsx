import { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { register } from "../../api/auth";
import { Link, useNavigate } from "react-router-dom";
import Select from "react-select";
import { toast } from "react-hot-toast";
import CongratsModal from "../../Components/CongratsModal";
import Banner from "../../assets/images/login-banner.jpg";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const talukaOptions = [
  { value: "KumaranKovil", label: "KumaranKovil" },
  { value: "Theni", label: "Theni" },
  { value: "Oddanchatram", label: "Oddanchatram" },
];

const districtOptions = [
  { value: "Dindigul", label: "Dindigul" },
  { value: "Madurai", label: "Madurai" },
  { value: "Theni", label: "Theni" },
];

const stateOptions = [
  { value: "Tamil Nadu", label: "Tamil Nadu" },
  { value: "Kerala", label: "Kerala" },
  { value: "Karnataka", label: "Karnataka" },
];

const StepOne = ({ formik, showPassword, togglePassword }) => (
  <div className="space-y-4 text-black">
    <div>
      <input
        type="text"
        name="name"
        placeholder="Your Name"
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        value={formik.values.name}
        className="w-full p-2 border border-[#A9A8A8] text-black rounded"
      />
      {formik.touched.name && formik.errors.name && (
        <p className="text-red-500 text-sm">{formik.errors.name}</p>
      )}
    </div>

    <div>
      <input
        type="email"
        name="email"
        placeholder="Email ID"
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        value={formik.values.email}
        className="w-full p-2 border border-[#A9A8A8] text-black rounded"
      />
      <p className="text-xs text-gray-500 mt-1 italic">Only accept gmail</p>
      {formik.touched.email && formik.errors.email && (
        <p className="text-red-500 text-sm">{formik.errors.email}</p>
      )}
    </div>

    <div className="relative">
      <input
        type={showPassword ? "text" : "password"}
        name="password"
        placeholder="Password"
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        value={formik.values.password}
        className="w-full p-2 border border-[#A9A8A8] text-black rounded"
      />
   <div className="absolute top-[15px] right-[15px]">
              {showPassword ? (
                 <FaEye
                  color="black"
                  className="cursor-pointer"
                  onClick={() => togglePassword((prev) => !prev)}
                />
              ) : (

                <FaEyeSlash
                  color="black"
                  className="cursor-pointer"
                  onClick={() => togglePassword((prev) => !prev)}
                />
               
              )}
            </div>
      {formik.touched.password && formik.errors.password && (
        <p className="text-red-500 text-sm">{formik.errors.password}</p>
      )}
    </div>

    <div>
      <input
        type="text"
        name="mobile"
        placeholder="Phone Number"
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        value={formik.values.mobile}
        className="w-full p-2 border border-[#A9A8A8] text-black rounded"
      />
      {formik.touched.mobile && formik.errors.mobile && (
        <p className="text-red-500 text-sm">{formik.errors.mobile}</p>
      )}
    </div>
  </div>
);

const StepTwo = ({ formik }) => (
  <div className="space-y-4 text-black">
    <div>
      <Select
        options={stateOptions}
        onChange={(opt) => formik.setFieldValue("state", opt.value)}
        placeholder="State"
        value={stateOptions.find((s) => s.value === formik.values.state)}
      />
      {formik.errors.state && (
        <p className="text-red-500 text-sm">{formik.errors.state}</p>
      )}
    </div>

    <div>
      <Select
        options={districtOptions}
        onChange={(opt) => formik.setFieldValue("district", opt.value)}
        placeholder="District"
        value={districtOptions.find((d) => d.value === formik.values.district)}
      />
      {formik.errors.district && (
        <p className="text-red-500 text-sm">{formik.errors.district}</p>
      )}
    </div>

    <div>
      <Select
        options={talukaOptions}
        onChange={(opt) => formik.setFieldValue("taluka", opt.value)}
        placeholder="Taluka"
        value={talukaOptions.find((t) => t.value === formik.values.taluka)}
      />
      {formik.errors.taluka && (
        <p className="text-red-500 text-sm">{formik.errors.taluka}</p>
      )}
    </div>

    <div>
      <input
        type="text"
        name="shopName"
        placeholder="Your Shop Name"
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        value={formik.values.shopName}
        className="w-full p-2 border border-[#A9A8A8] text-black rounded"
      />
      {formik.touched.shopName && formik.errors.shopName && (
        <p className="text-red-500 text-sm">{formik.errors.shopName}</p>
      )}
    </div>

    <div>
      <input
        type="file"
        name="visitingCard"
        onChange={(e) =>
          formik.setFieldValue("visitingCard", e.target.files[0])
        }
        className="w-full p-2 border border-[#A9A8A8] text-black rounded bg-white"
      />
    </div>

    <div>
      <input
        type="text"
        name="aadhaar"
        placeholder="Shop Owner Aadhaar Number"
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        value={formik.values.aadhaar}
        className="w-full p-2 border border-[#A9A8A8] text-black rounded"
      />
      {formik.touched.aadhaar && formik.errors.aadhaar && (
        <p className="text-red-500 text-sm">{formik.errors.aadhaar}</p>
      )}
    </div>

    <div className="flex items-start space-x-2">
      <input
        type="checkbox"
        name="terms"
        onChange={formik.handleChange}
        checked={formik.values.terms}
        className="mt-1 h-4 w-4 rounded-sm border-gray-400 text-yellow-500 focus:ring-yellow-500"
      />
      <label htmlFor="terms" className="text-sm">
        I agree to Terms & Conditions
      </label>
    </div>

    {formik.touched.terms && formik.errors.terms && (
      <p className="text-red-500 text-sm">{formik.errors.terms}</p>
    )}
  </div>
);

export default function Register() {
  const [step, setStep] = useState(1);
  const [showCongrats, setShowCongrats] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const togglePassword = () => setShowPassword((prev) => !prev);

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      mobile: "",
      password: "",
      taluka: "",
      district: "",
      state: "",
      shopName: "",
      visitingCard: null,
      aadhaar: "",
      terms: false,
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Name is Required"),
      email: Yup.string()
        .matches(
          /^[a-z0-9._%+-]+@gmail\.com$/,
          "Only lowercase Gmail addresses allowed"
        )
        .required("Email is Required"),
      mobile: Yup.string().required("Phone Number is Required"),
      password: Yup.string()
  .required("Password is Required")
  .min(8, "Password must be at least 8 characters")
  .matches(
    /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/,
    "Password must contain at least one uppercase letter, one number, and one special character"
  ),

      state: Yup.string().required("State is Required"),
      district: Yup.string().required("District is Required"),
      taluka: Yup.string().required("Taluka is Required"),
      shopName: Yup.string().required("Shop Name is Required"),
      aadhaar: Yup.string().required("Aadhaar is Required"),
      terms: Yup.bool().oneOf([true], "Please Accept Terms & Conditions"),
      visitingCard: Yup.mixed().nullable(),
    }),
    onSubmit: async (values) => {
      try {
        const response = await register(values);
        setRegisteredEmail(values.email);
        toast.success(response.data.message || "Registration successful");
        setShowCongrats(true);
      } catch (err) {
        toast.error(err.response?.data?.message || "Registration failed");
      }
    },
  });

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      <div className="hidden md:block">
        <img
          src={Banner}
          alt="Register Banner"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="flex justify-center items-center bg-gray-100 p-4">
        <form
          onSubmit={formik.handleSubmit}
          className="bg-white shadow-md p-8 rounded max-w-lg w-full space-y-6 text-black"
        >
          <h2 className="text-2xl font-bold text-center">
            Register to Grow Your Business
          </h2>

          {/* Step Indicator */}
          <div className="flex justify-center items-center mt-6 relative">
            <div
              className={`absolute top-2 left-1/2 transform -translate-x-1/2 w-[53px] h-0.5 ${
                step === 2 ? "bg-black" : "bg-gray-300"
              } z-0`}
            ></div>
            <div className="flex flex-col items-center z-10">
              <div
                className={`w-4 h-4 rounded-full ${
                  step >= 1 ? "bg-black" : "bg-gray-300"
                }`}
              ></div>
              <span className="text-xs mt-1">Step 1</span>
            </div>
            <div className="w-8"></div>
            <div className="flex flex-col items-center z-10">
              <div
                className={`w-4 h-4 rounded-full ${
                  step >= 2 ? "bg-black" : "bg-gray-300"
                }`}
              ></div>
              <span className="text-xs mt-1">Step 2</span>
            </div>
          </div>

          {step === 1 ? (
            <StepOne
              formik={formik}
              showPassword={showPassword}
              togglePassword={togglePassword}
            />
          ) : (
            <StepTwo formik={formik} />
          )}

          <div className="text-center">
            {step === 1 ? (
              <button
                type="button"
                onClick={async () => {
                  const errors = await formik.validateForm();
                  formik.setTouched({
                    name: true,
                    email: true,
                    mobile: true,
                    password: true,
                  });
                  if (Object.keys(errors).length === 0) {
                    setStep(2);
                  }
                }}
                className="bg-black text-white py-2 px-6 rounded"
              >
                Next →
              </button>
            ) : (
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="!bg-white text-black py-2 px-6 rounded border !border-gray-400"
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  className="bg-black text-white py-2 px-6 rounded"
                >
                  Register
                </button>
              </div>
            )}
          </div>

          <div className="text-center">
            <Link
              to="/login"
              className="text-blue-500 text-center hover:underline"
            >
              Back to Login
            </Link>
          </div>
        </form>

        {showCongrats && (
          <CongratsModal
            email={registeredEmail}
            onVerified={() => {
              setShowCongrats(false);
              navigate("/dashboard");
            }}
          />
        )}
      </div>
    </div>
  );
}
