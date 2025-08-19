import { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { register } from "../../api/auth";
import { Link, useNavigate } from "react-router-dom";
import Select from "react-select";
import { toast } from "react-hot-toast";
import CongratsModal from "../../Components/CongratsModal";
import Banner from "../../assets/images/login-banner.jpg";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import indiaData from "../../Constant/location.json";

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
        className={`w-full p-3 rounded-lg border ${
          formik.touched.name && formik.errors.name
            ? "border-red-500"
            : "border-gray-300"
        } focus:outline-none focus:ring-2 focus:ring-blue-400`}
      />
      {formik.touched.name && formik.errors.name && (
        <p className="text-red-500 text-sm">{formik.errors.name}</p>
      )}
    </div>

    <div>
      <input
        type="email"
        name="email"
        placeholder="Email ID (Gmail only)"
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        value={formik.values.email}
        className={`w-full p-3 rounded-lg border ${
          formik.touched.email && formik.errors.email
            ? "border-red-500"
            : "border-gray-300"
        } focus:outline-none focus:ring-2 focus:ring-blue-400`}
      />
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
        className={`w-full p-3 rounded-lg border ${
          formik.touched.password && formik.errors.password
            ? "border-red-500"
            : "border-gray-300"
        } focus:outline-none focus:ring-2 focus:ring-blue-400`}
      />
      <div
        className="absolute top-3 right-3 text-gray-600 cursor-pointer"
        onClick={() => togglePassword(prev => !prev)}
      >
        {showPassword ? <FaEye /> : <FaEyeSlash />}
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
        className={`w-full p-3 rounded-lg border ${
          formik.touched.mobile && formik.errors.mobile
            ? "border-red-500"
            : "border-gray-300"
        } focus:outline-none focus:ring-2 focus:ring-blue-400`}
      />
      {formik.touched.mobile && formik.errors.mobile && (
        <p className="text-red-500 text-sm">{formik.errors.mobile}</p>
      )}
    </div>
  </div>
);

const StepTwo = ({ formik }) => {
  const [districtOptions, setDistrictOptions] = useState([]);

  useEffect(() => {
    if (formik.values.state) {
      const state = indiaData.states.find(
        s => s.state === formik.values.state
      );
      if (state) {
        setDistrictOptions(state.districts.map(d => ({ value: d, label: d })));
        formik.setFieldValue("district", "");
      }
    } else {
      setDistrictOptions([]);
      formik.setFieldValue("district", "");
    }
  }, [formik.values.state]);

  return (
    <div className="space-y-4 text-black">
      <Select
        options={indiaData.states.map(s => ({ value: s.state, label: s.state }))}
        onChange={opt => formik.setFieldValue("state", opt.value)}
        placeholder="Select State"
        value={{ value: formik.values.state, label: formik.values.state }}
      />
      {formik.errors.state && <p className="text-red-500 text-sm">{formik.errors.state}</p>}

      <Select
        options={districtOptions}
        onChange={opt => formik.setFieldValue("district", opt.value)}
        placeholder="Select District"
        value={districtOptions.find(d => d.value === formik.values.district) || null}
      />
      {formik.errors.district && <p className="text-red-500 text-sm">{formik.errors.district}</p>}

      <input
        type="text"
        name="taluka"
        placeholder="Taluka (Typeable)"
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        value={formik.values.taluka}
        className={`w-full p-3 rounded-lg border ${
          formik.errors.taluka ? "border-red-500" : "border-gray-300"
        } focus:outline-none focus:ring-2 focus:ring-blue-400`}
      />
      {formik.errors.taluka && <p className="text-red-500 text-sm">{formik.errors.taluka}</p>}

      <input
        type="text"
        name="shopName"
        placeholder="Your Shop Name"
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        value={formik.values.shopName}
        className={`w-full p-3 rounded-lg border ${
          formik.errors.shopName ? "border-red-500" : "border-gray-300"
        } focus:outline-none focus:ring-2 focus:ring-blue-400`}
      />
      {formik.errors.shopName && <p className="text-red-500 text-sm">{formik.errors.shopName}</p>}

      <div>
        <label className="block text-sm mb-1">Upload Visiting Card (Optional)</label>
        <input
          type="file"
          name="visitingCard"
          onChange={e => formik.setFieldValue("visitingCard", e.target.files[0])}
          className="w-full p-2 border border-gray-300 rounded bg-gray-50 cursor-pointer"
        />
      </div>

      <input
        type="text"
        name="aadhaar"
        placeholder="Shop Owner Aadhaar Number"
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        value={formik.values.aadhaar}
        className={`w-full p-3 rounded-lg border ${
          formik.errors.aadhaar ? "border-red-500" : "border-gray-300"
        } focus:outline-none focus:ring-2 focus:ring-blue-400`}
      />
      {formik.errors.aadhaar && <p className="text-red-500 text-sm">{formik.errors.aadhaar}</p>}

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          name="terms"
          checked={formik.values.terms}
          onChange={formik.handleChange}
          className="h-4 w-4 rounded border-gray-400 focus:ring-yellow-500"
        />
        <label className="text-sm">I agree to Terms & Conditions</label>
      </div>
      {formik.errors.terms && <p className="text-red-500 text-sm">{formik.errors.terms}</p>}
    </div>
  );
};

export default function Register() {
  const [step, setStep] = useState(1);
  const [showCongrats, setShowCongrats] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

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
        .matches(/^[a-z0-9._%+-]+@gmail\.com$/, "Only lowercase Gmail addresses allowed")
        .required("Email is Required"),
      mobile: Yup.string().required("Phone Number is Required"),
      password: Yup.string()
        .required("Password is Required")
        .min(8, "Password must be at least 8 characters")
        .matches(
          /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/,
          "Password must contain one uppercase, one number & one special char"
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
        <img src={Banner} alt="Register Banner" className="w-full h-full object-cover" />
      </div>

      <div className="flex justify-center items-center bg-gray-100 p-4">
        <form
          onSubmit={formik.handleSubmit}
          className="bg-white shadow-lg p-8 rounded-2xl max-w-lg w-full space-y-6"
        >
          <h2 className="text-2xl font-bold text-center text-gray-800">
            Register to Grow Your Business
          </h2>

          {/* Step Progress */}
          <div className="flex items-center justify-center space-x-4 mt-4">
            <div className={`w-6 h-6 rounded-full ${step >= 1 ? "bg-blue-600" : "bg-gray-300"}`}></div>
            <div className="w-16 h-1 bg-gray-300">
              {step === 2 && <div className="w-full h-1 bg-blue-600 transition-all"></div>}
            </div>
            <div className={`w-6 h-6 rounded-full ${step >= 2 ? "bg-blue-600" : "bg-gray-300"}`}></div>
          </div>

          {step === 1 ? (
            <StepOne formik={formik} showPassword={showPassword} togglePassword={() => setShowPassword(prev => !prev)} />
          ) : (
            <StepTwo formik={formik} />
          )}

          {/* Buttons */}
          <div className="flex justify-between mt-6">
            {step === 2 && (
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-6 py-2 border border-gray-400 rounded hover:bg-gray-100 transition"
              >
                ← Back
              </button>
            )}
            <div className="flex-1 flex justify-end">
              {step === 1 ? (
                <button
                  type="button"
                  onClick={() => {
                    formik.validateForm().then(() => {
                      formik.setTouched({
                        name: true,
                        email: true,
                        mobile: true,
                        password: true,
                      });
                      const step1Errors = ["name","email","mobile","password"].filter(f => formik.errors[f]);
                      if (step1Errors.length === 0) setStep(2);
                    });
                  }}
                  className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                >
                  Next →
                </button>
              ) : (
                <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
                  Register
                </button>
              )}
            </div>
          </div>

          <div className="text-center mt-4">
            <Link to="/login" className="text-blue-500 hover:underline">
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
