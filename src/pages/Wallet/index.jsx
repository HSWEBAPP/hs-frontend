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

  // ✅ Formik setup
  const formik = useFormik({
    initialValues: {
      transactionId: "",
      paymentApp: "",
    },
    validationSchema: Yup.object({
      transactionId: Yup.string()
        .required("Transaction number is required")
        .matches(/^[0-9a-zA-Z]+$/, "Only numbers & letters allowed"),
      paymentApp: Yup.string().required("Select a payment app"),
    }),
    onSubmit: async (values, { resetForm }) => {
      try {
        await axios.post(
          "https://hs-backend-2.onrender.com/api/wallet/user/recharge/qr",
          {
            amount: selectedQR.amount,
            transactionId: values.transactionId,
            appUsed: values.paymentApp,
            paymentMethod: "QR",
          },
          {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          }
        );
        toast.success("Payment request submitted");
        setShowForm(false);
        resetForm();
      } catch {
        toast.error("Failed to submit payment");
      }
    },
  });

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1">
        <Header />

        <div className="p-6">
          <h2 className="text-xl font-bold mb-4 text-black">Recharge Wallet</h2>

          <label className="block mb-2 text-black">Enter Amount to Recharge</label>
          <select
            value={selectedQR?._id || ""}
            onChange={(e) => {
              const qr = qrCodes.find((q) => q._id === e.target.value);
              setSelectedQR(qr);
            }}
            className="border w-[50%] p-2 mb-4 text-black border-black"
          >
            {qrCodes.map((qr) => (
              <option key={qr._id} value={qr._id}>
                {qr.amount} (Total with GST: ₹{qr.totalAmount})
              </option>
            ))}
          </select>

          {selectedQR && (
            <div className="mb-4">
              <p className="text-gray-500 text-sm italic">Total: {selectedQR.amount}</p>
              <p className="text-gray-500 text-sm italic">GST: {selectedQR.gst}</p>
              <p className="text-gray-500 text-sm italic">To Pay: {selectedQR.totalAmount}</p>
            </div>
          )}

          {selectedQR && (
            <div className="flex flex-col items-center w-[50%] mb-4">
              <img
                src={`https://hs-backend-2.onrender.com${selectedQR.imageUrl}`}
                alt="QR Code"
                className="w-48 h-48"
              />
              <button
                className="bg-black text-white px-6 py-2 mt-4"
                onClick={() => setShowForm(true)}
              >
                I sent payment
              </button>
            </div>
          )}

          {showForm && (
            <form
              onSubmit={formik.handleSubmit}
              className="mt-4 border p-4 rounded"
            >
              <label className="block mb-2 text-black">Enter Transaction Number</label>
              <input
                name="transactionId"
                value={formik.values.transactionId}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="border border-black text-black p-2 w-full mb-2"
              />
              {formik.touched.transactionId && formik.errors.transactionId && (
                <p className="text-red-500 text-sm">{formik.errors.transactionId}</p>
              )}

              <label className="block mb-2 mt-4 text-black">I paid using</label>
              <select
                name="paymentApp"
                value={formik.values.paymentApp}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="border border-black text-black p-2 w-full mb-2"
              >
                <option value="">Select App</option>
                <option value="GPay">GPay</option>
                <option value="PhonePe">PhonePe</option>
                <option value="Paytm">Paytm</option>
              </select>
              {formik.touched.paymentApp && formik.errors.paymentApp && (
                <p className="text-red-500 text-sm">{formik.errors.paymentApp}</p>
              )}

              <button
                type="submit"
                className="bg-green-500 text-white px-6 py-2 w-full mt-4"
              >
                Yes, I Completed Payment
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
