import { useEffect, useState } from "react";
import Sidebar from "../../Components/Sidebar";
import Header from "../../Components/Header";
import { getQRCodes } from "../../api/auth";
import axios from "axios";
import toast from "react-hot-toast";
import { useFormik } from "formik";
import * as Yup from "yup";

export default function RechargePage() {
  const [qrCodes, setQrCodes] = useState([]);
  const [selectedQR, setSelectedQR] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchQRCodes();
  }, []);

  const fetchQRCodes = async () => {
    try {
      const res = await getQRCodes();
      setQrCodes(res.data);
      if (res.data.length > 0) setSelectedQR(res.data[0]);
    } catch {
      toast.error("Failed to load QR Codes");
    }
  };

  const formik = useFormik({
    initialValues: { transactionId: "", paymentApp: "" },
    validationSchema: Yup.object({
      transactionId: Yup.string()
        .required("Transaction number is required")
        .matches(/^[0-9a-zA-Z]+$/, "Only numbers & letters allowed"),
      paymentApp: Yup.string().required("Select a payment app"),
    }),
    onSubmit: async (values, { resetForm }) => {
      try {
        setSubmitting(true);
        await axios.post(
          "https://hs-backend-2.onrender.com/api/wallet/user/recharge/qr",
          {
            amount: selectedQR.amount,
            transactionId: values.transactionId,
            appUsed: values.paymentApp,
            paymentMethod: "QR",
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        toast.success("Payment request submitted");
        setShowForm(false);
        resetForm();
      } catch {
        toast.error("Failed to submit payment");
      } finally {
        setSubmitting(false); // re-enable button after response
      }
    },
  });

  // check if the submit button should be enabled
  const isSubmitEnabled =
    formik.values.transactionId.trim() !== "" &&
    formik.values.paymentApp.trim() !== "" &&
    !formik.errors.transactionId &&
    !formik.errors.paymentApp;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1">
        <Header />
        <div className="p-6 max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-black">
            Recharge Wallet
          </h2>

          {selectedQR && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Left Column */}
              <div className="md:col-span-6 bg-white p-6 rounded-xl shadow-lg">
                <label className="block mb-2 font-medium text-black">
                  Select Amount
                </label>
                <select
                  value={selectedQR._id || ""}
                  onChange={(e) => {
                    const qr = qrCodes.find((q) => q._id === e.target.value);
                    setSelectedQR(qr);
                  }}
                  className="border border-gray-300 rounded-lg p-2 mb-2 w-full text-black hover:border-black transition"
                >
                  {qrCodes.map((qr) => (
                    <option key={qr._id} value={qr._id}>
                      ₹{qr.amount} (Total with GST: ₹{qr.totalAmount})
                    </option>
                  ))}
                </select>

                <div className="text-gray-700 space-y-1 text-sm mb-4">
                  <p>Amount: ₹{selectedQR.amount}</p>
                  <p>GST: {selectedQR.gst}%</p>
                  <p className="font-semibold">
                    To Pay: ₹{selectedQR.totalAmount}
                  </p>
                </div>

                <div className="flex flex-col items-center">
                  <img
                    src={`https://hs-backend-2.onrender.com${selectedQR.imageUrl}`}
                    alt="QR Code"
                    className="w-48 h-48 object-contain border rounded-lg shadow-md mb-4"
                  />

                  <>
                    <p className="text-gray-500 text-sm italic mb-2 text-center">
                      Click "I sent payment" only after you complete the payment
                    </p>
                    <button
                      className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition"
                      onClick={() => setShowForm(true)}
                    >
                      I sent payment
                    </button>
                  </>
                </div>
              </div>

              {/* Right Column */}

              <div className="md:col-span-6 bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-lg font-semibold mb-4 text-black">
                  Confirm Payment
                </h3>
                <form onSubmit={formik.handleSubmit} className="space-y-4">
                  <div>
                    <label className="block mb-1 text-black">
                      Transaction Number
                    </label>
                    <input
                      name="transactionId"
                      value={formik.values.transactionId}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      disabled={!showForm} // <-- disabled until "I sent payment" clicked
                      className={`border border-gray-300 rounded-lg p-2 w-full text-black ${
                        !showForm ? "bg-gray-100 cursor-not-allowed" : ""
                      }`}
                    />
                    {formik.touched.transactionId &&
                      formik.errors.transactionId && (
                        <p className="text-red-500 text-sm">
                          {formik.errors.transactionId}
                        </p>
                      )}
                  </div>

                  <div>
                    <label className="block mb-1 text-black">Payment App</label>
                    <select
                      name="paymentApp"
                      value={formik.values.paymentApp}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      disabled={!showForm} // <-- disabled until "I sent payment" clicked
                      className={`border border-gray-300 rounded-lg p-2 w-full text-black ${
                        !showForm ? "bg-gray-100 cursor-not-allowed" : ""
                      }`}
                    >
                      <option value="">Select App</option>
                      <option value="GPay">GPay</option>
                      <option value="PhonePe">PhonePe</option>
                      <option value="Paytm">Paytm</option>
                    </select>
                    {formik.touched.paymentApp && formik.errors.paymentApp && (
                      <p className="text-red-500 text-sm">
                        {formik.errors.paymentApp}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={submitting || !isSubmitEnabled}
                    className={`w-full py-2 rounded-lg transition ${
                      !isSubmitEnabled || submitting
                        ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                        : "bg-green-500 text-white hover:bg-green-600"
                    }`}
                  >
                    {submitting ? "Submitting..." : "Yes, I Completed Payment"}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
