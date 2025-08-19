import { useState, useEffect } from "react";
import axios from "axios";
import { useFormik } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";
import Sidebar from "../../Components/Sidebar";
import Header from "../../Components/Header";
import Skeleton from "react-loading-skeleton";
import { UploadCloud } from "lucide-react";
import "react-loading-skeleton/dist/skeleton.css";

function DeleteModal({ show, onClose, onConfirm }) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white p-6 rounded shadow w-80">
        <h2 className="text-lg font-bold mb-4 text-black">Confirm Delete</h2>
        <p className="text-black mb-6">Are you sure you want to delete this QR Code?</p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded border !bg-white !border-gray-400 text-black hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminQRCodePage() {
  const [gst, setGst] = useState(18);
  const [qrCodes, setQrCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchQRCodes = async () => {
    try {
      setLoading(true);
      const res = await axios.get("https://hs-backend-2.onrender.com/api/qrcode", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setQrCodes(res.data);
    } catch {
      toast.error("Failed to fetch QR Codes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQRCodes();
  }, []);

  const formik = useFormik({
    initialValues: { amount: "", qrImage: null },
    validationSchema: Yup.object({
      amount: Yup.number()
        .typeError("Amount must be a number")
        .positive("Amount must be greater than 0")
        .required("Amount is required"),
      qrImage: Yup.mixed()
        .required("QR Code image is required")
        .test(
          "fileFormat",
          "Only PNG or JPG files are allowed",
          (value) => value && ["image/png", "image/jpeg", "image/jpg"].includes(value.type)
        ),
    }),
    onSubmit: async (values, { resetForm }) => {
      const formData = new FormData();
      formData.append("amount", values.amount);
      formData.append("gst", gst);
      formData.append("qrImage", values.qrImage);

      try {
        setSubmitting(true);
        await axios.post("https://hs-backend-2.onrender.com/api/qrcode/create", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        toast.success("QR Code added successfully");
        resetForm();
        fetchQRCodes();
      } catch {
        toast.error("Error uploading QR Code");
      } finally {
        setSubmitting(false);
      }
    },
  });

  const handleDelete = async () => {
    try {
      await axios.delete(`https://hs-backend-2.onrender.com/api/qrcode/${deleteId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      toast.success("QR Code deleted successfully");
      setShowDeleteModal(false);
      fetchQRCodes();
    } catch {
      toast.error("Failed to delete QR Code");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1">
        <Header />
        <div className="p-6 max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-black">QR Codes Management</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

            {/* Upload Form */}
            <form
              onSubmit={formik.handleSubmit}
              className="bg-white p-6 rounded-lg shadow space-y-4"
            >
              <h3 className="text-lg font-semibold text-black mb-2">Add New QR Code</h3>
              <input
                type="number"
                name="amount"
                placeholder="Amount"
                value={formik.values.amount}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="border text-black border-gray-300 p-2 w-full rounded"
              />
              {formik.touched.amount && formik.errors.amount && (
                <p className="text-red-500 text-sm">{formik.errors.amount}</p>
              )}
              <div>
                <label className="block mb-1 text-sm font-medium text-black">GST %</label>
                <input
                  type="number"
                  value={gst}
                  disabled
                  className="border text-black border-gray-300 bg-gray-200 p-2 w-full rounded"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-black">QR Code Image</label>
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
     < UploadCloud size={40} className="mb-2 text-gray-400" />

                  <p className="text-sm text-gray-500">Click to upload or drag and drop</p>
                  <p className="text-xs text-gray-400">
                    {formik.values.qrImage ? formik.values.qrImage.name : "No file selected"}
                  </p>
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => formik.setFieldValue("qrImage", e.currentTarget.files[0])}
                    accept=".png,.jpg,.jpeg"
                  />
                </label>
                {formik.touched.qrImage && formik.errors.qrImage && (
                  <p className="text-red-500 text-sm mt-1">{formik.errors.qrImage}</p>
                )}
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-300"
              >
                {submitting ? "Uploading..." : "Upload QR Code"}
              </button>
            </form>

            {/* QR Codes Table */}
            <div className="bg-white p-6 rounded-lg shadow space-y-4">
              <h3 className="text-lg font-semibold text-black mb-3">All QR Codes</h3>
         <div className="overflow-x-auto bg-white shadow-lg rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-3 py-3 text-left text-sm text-gray-600 font-semibold">Amount</th>
                      <th className="px-3 py-3 text-left text-sm text-gray-600 font-semibold">GST</th>
                      <th className="px-3 py-3 text-left text-sm text-gray-600 font-semibold">Total</th>
                      <th className="px-3 py-3 text-center text-sm text-gray-600 font-semibold">Actions</th>
                    </tr>
                  </thead>
                <tbody className="divide-y divide-gray-200">
                    {loading
                      ? Array.from({ length: 5 }).map((_, idx) => (
                          <tr key={idx} className={idx % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                            {Array.from({ length: 4 }).map((__, i) => (
                              <td key={i} className="px-3 py-3"><Skeleton height={20} /></td>
                            ))}
                          </tr>
                        ))
                      : qrCodes.length > 0
                      ? qrCodes.map((qr, idx) => (
                          <tr key={qr._id} className={`hover:bg-blue-50 ${idx % 2 === 0 ? "bg-gray-50" : "bg-white"}`}>
                            <td className="px-3 py-3 text-sm text-gray-600">₹{qr.amount}</td>
                            <td className="px-3 py-3 text-sm text-gray-600">{qr.gst}%</td>
                            <td className="px-3 py-3 text-sm text-gray-600">₹{qr.totalAmount}</td>
                            <td className="px-0 py-2 text-center">
                              <button
                                onClick={() => {
                                  setDeleteId(qr._id);
                                  setShowDeleteModal(true);
                                }}
                                className="!bg-red-500 text-white !px-2 !py-1 rounded !hover:bg-red-600"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))
                      : (
                          <tr>
                            <td colSpan="4" className="text-center py-6 text-gray-500 italic">
                              No QR Codes found 🚫
                            </td>
                          </tr>
                        )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>
      </div>

      <DeleteModal
        show={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
