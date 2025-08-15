import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Sidebar from "../../Components/Sidebar";
import Header from "../../Components/Header";

export default function AdminQRCodePage() {
  const [amount, setAmount] = useState("");
  const [gst, setGst] = useState(18);
  const [file, setFile] = useState(null);
  const [qrCodes, setQrCodes] = useState([]);

  const fetchQRCodes = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/qrcode", {
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

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return toast.error("Upload a QR Code image");

    const formData = new FormData();
    formData.append("amount", amount);
    formData.append("gst", gst);
    formData.append("qrImage", file);

    try {
      await axios.post("http://localhost:5000/api/qrcode/create", formData, {
        headers: { 
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      toast.success("QR Code added successfully");
      setAmount("");
      setGst(18);
      setFile(null);
      fetchQRCodes();
    } catch {
      toast.error("Error uploading QR Code");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this QR Code?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/qrcode/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      toast.success("QR Code deleted successfully");
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
        <div className="p-6 max-w-4xl mx-auto">
          {/* Add QR Form */}
          <h2 className="text-xl font-bold mb-4">Add QR Code</h2>
          <form onSubmit={handleUpload} className="mb-6 bg-white p-6 rounded shadow">
            <input
              type="number"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="border text-black border-gray-300 p-2 w-full mb-3 rounded"
              required
            />
            <input
              type="number"
              placeholder="GST %"
              value={gst}
              onChange={(e) => setGst(e.target.value)}
              className="border text-black border-gray-300 p-2 w-full mb-3 rounded"
              required
            />
            <input
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              accept="image/*"
              className="mb-3 text-black"
              required
            />
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
              Upload QR Code
            </button>
          </form>

          {/* QR Codes List */}
          <h3 className="text-lg font-bold mb-3">All QR Codes</h3>
          {qrCodes.length > 0 ? (
            <table className="w-full border-collapse border border-gray-300 bg-white">
              <thead className="bg-gray-200">
                <tr>
                  <th className="border p-2 text-black">Amount</th>
                  <th className="border p-2 text-black">GST</th>
                  <th className="border p-2 text-black">Total</th>
                  <th className="border p-2 text-black">QR Image</th>
                  <th className="border p-2 text-black">Actions</th>
                </tr>
              </thead>
              <tbody>
                {qrCodes.map((qr) => (
                  <tr key={qr._id}>
                    <td className="border p-2 text-black">₹{qr.amount}</td>
                    <td className="border p-2 text-black">{qr.gst}%</td>
                    <td className="border p-2 text-black">₹{qr.totalAmount}</td>
                    <td className="border p-2 text-black">
                      <img src={`http://localhost:5000${qr.imageUrl}`} className="w-20 h-20 object-contain" />
                    </td>
                    <td className="border p-2 text-black">
                      <button
                        onClick={() => handleDelete(qr._id)}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
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
  );
}
