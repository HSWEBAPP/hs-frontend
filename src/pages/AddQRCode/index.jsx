import { useState, useEffect } from "react";
import axios from "axios";
import { useFormik } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";
import Sidebar from "../../Components/Sidebar";
import Header from "../../Components/Header";

function DeleteModal({ show, onClose, onConfirm }) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white p-6 rounded shadow w-80">
        <h2 className="text-lg font-bold mb-4 text-black">Confirm Delete</h2>
        <p className="text-black mb-6">
          Are you sure you want to delete this QR Code?
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded border border-gray-400 text-white hover:bg-gray-100"
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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const fetchQRCodes = async () => {
    try {
      const res = await axios.get("https://hs-backend-2.onrender.com/api/qrcode", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setQrCodes(res.data);
    } catch {
      toast.error("Failed to fetch QR Codes");
    }
  };

  useEffect(() => {
    fetchQRCodes();
  }, []);

  const formik = useFormik({
    initialValues: {
      amount: "",
      qrImage: null,
    },
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
          (value) =>
            value &&
            ["image/png", "image/jpeg", "image/jpg"].includes(value.type)
        ),
    }),
    onSubmit: async (values, { resetForm }) => {
      const formData = new FormData();
      formData.append("amount", values.amount);
      formData.append("gst", gst);
      formData.append("qrImage", values.qrImage);

      try {
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
        <div className="p-4">
          <h2 className="text-xl font-bold mb-4 text-black">QR Code</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
            <div>
              <form
                onSubmit={formik.handleSubmit}
                className="mb-6 bg-white p-6 rounded shadow"
              >
                <input
                  type="number"
                  name="amount"
                  placeholder="Amount"
                  value={formik.values.amount}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="border text-black border-gray-300 p-2 w-full mb-1 rounded"
                />
                {formik.touched.amount && formik.errors.amount && (
                  <p className="text-red-500 text-sm mb-2">
                    {formik.errors.amount}
                  </p>
                )}
                {/* GST Field */}
                <div className="mb-3">
                  <label className="block mb-2 text-sm font-medium text-black">
                    GST %
                  </label>
                  <input
                    type="number"
                    name="gst"
                    value={gst}
                    disabled
                    className="border text-black border-gray-300 bg-gray-200 p-2 w-full rounded"
                  />
                </div>

                <div className="mb-3">
                  <label className="block mb-2 text-sm font-medium text-black">
                    QR Code Image
                  </label>
                  <div className="flex items-center justify-center w-full">
                    <label
                      htmlFor="qrImage"
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                    >
                      <svg
                        className="w-10 h-10 mb-2 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M7 16v-4m0 0l4-4m-4 4h12"
                        />
                      </svg>
                      <p className="text-sm text-gray-500">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-gray-400">
                        {formik.values.qrImage
                          ? formik.values.qrImage.name
                          : "No file selected"}
                      </p>
                      <input
                        id="qrImage"
                        name="qrImage"
                        type="file"
                        className="hidden"
                        onChange={(event) =>
                          formik.setFieldValue(
                            "qrImage",
                            event.currentTarget.files[0]
                          )
                        }
                        accept=".png,.jpg,.jpeg"
                      />
                    </label>
                  </div>
                  {formik.touched.qrImage && formik.errors.qrImage && (
                    <p className="text-red-500 text-sm mt-1">
                      {formik.errors.qrImage}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition duration-300"
                >
                  Upload QR Code
                </button>
              </form>
            </div>

            <div>
              {/* QR Codes List */}
              <h3 className="text-lg font-bold mb-3 text-black">
                All QR Codes
              </h3>
              {qrCodes.length > 0 ? (
                <table className="w-full border-collapse border border-gray-300 bg-white">
                  <thead className="bg-gray-200">
                    <tr>
                      <th className="border p-2 text-black">Amount</th>
                      <th className="border p-2 text-black">GST</th>
                      <th className="border p-2 text-black">Total</th>
                      <th className="border p-2 text-black">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {qrCodes.map((qr) => (
                      <tr key={qr._id}>
                        <td className="border p-2 text-black">₹{qr.amount}</td>
                        <td className="border p-2 text-black">{qr.gst}%</td>
                        <td className="border p-2 text-black">
                          ₹{qr.totalAmount}
                        </td>
                        <td className="border p-2 text-black text-center">
                          <button
                            onClick={() => {
                              setDeleteId(qr._id);
                              setShowDeleteModal(true);
                            }}
                            className="bg-red-500 text-white !pt-1 !pb-1 rounded hover:bg-red-600"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-gray-500">No QR Codes found.</p>
              )}
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
