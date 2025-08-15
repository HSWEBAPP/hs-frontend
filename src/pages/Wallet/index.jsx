// pages/user/RechargePage.jsx
import { useEffect, useState } from "react";
import Sidebar from "../../Components/Sidebar";
import Header from "../../Components/Header";
import { getQRCodes } from "../../api/auth";
import axios from "axios";
import toast from "react-hot-toast";

export default function RechargePage() {
  const [activeTab, setActiveTab] = useState("recharge");
  const [qrCodes, setQrCodes] = useState([]);
  const [selectedQR, setSelectedQR] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [transactionId, setTransactionId] = useState("");
  const [paymentApp, setPaymentApp] = useState("");
  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetchQRCodes();
    fetchHistory();
  }, []);
  console.log(qrCodes, selectedQR, 7878);

  const fetchQRCodes = async () => {
    try {
      const res = await getQRCodes();
      setQrCodes(res.data);
      if (res.data.length > 0) setSelectedQR(res.data[0]);
    } catch {
      toast.error("Failed to load QR Codes");
    }
  };

const fetchHistory = async () => {
  try {
    const { data } = await axios.get(
      "http://localhost:5000/api/wallet/user/recharge/history",
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }
    );

    console.log(data); // check what you get
    setHistory(data.history || []); // make sure it's always an array
  } catch (error) {
    console.log(error.response?.data || error.message);
    toast.error("Failed to fetch history");
  }
};


  const handleSubmitPayment = async () => {
    if (!transactionId || !paymentApp) {
      return toast.error("Fill all payment details");
    }

    try {
      await axios.post(
       "http://localhost:5000/api/wallet/user/recharge/qr", 
        {
          amount: selectedQR.amount,
          transactionId,
          appUsed:paymentApp,
          paymentMethod: "QR"
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      toast.success("Payment request submitted");
      setShowForm(false);
      setTransactionId("");
      setPaymentApp("");
      fetchHistory();
    } catch {
      toast.error("Failed to submit payment");
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1">
        <Header />

        <div className="p-6">
          {/* Tabs */}
          <div className="flex border-b mb-4">
            <button
              className={`px-4 py-2 ${
                activeTab === "recharge" ? "bg-black text-white" : "bg-gray-200"
              }`}
              onClick={() => setActiveTab("recharge")}
            >
              Recharges
            </button>
            <button
              className={`px-4 py-2 ${
                activeTab === "history" ? "bg-black text-white" : "bg-gray-200"
              }`}
              onClick={() => setActiveTab("history")}
            >
              History
            </button>
          </div>

          {activeTab === "recharge" && (
            <div className="w-full">
              <label className="block mb-2 text-black">
                Enter Amount to Recharge
              </label>
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
              <div>
                <p className="text-gray-500 text-sm italic">
                  Total:{selectedQR?.amount}
                </p>
                <p className="text-gray-500 text-sm italic">
                  GST:{selectedQR?.gst}
                </p>
                <p className="text-gray-500 text-sm italic">
                  To Pay:{selectedQR?.totalAmount}
                </p>
              </div>
              {selectedQR && (
                <div className="flex flex-col items-center w-[50%] mb-4">
                  <img
                    src={`http://localhost:5000${selectedQR.imageUrl}`}
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

              {!showForm && (
                <div className="mt-4 border p-4 rounded">
                  <label className="block mb-2">Enter Transaction Number</label>
                  <input
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    className="border border-black text-black p-2 w-full mb-4"
                  />

                  <label className="block mb-2">I paid using</label>
                  <select
                    value={paymentApp}
                    onChange={(e) => setPaymentApp(e.target.value)}
                    className="border border-black text-black  p-2 w-full mb-4"
                  >
                    <option value="">Select App</option>
                    <option value="GPay">GPay</option>
                    <option value="PhonePe">PhonePe</option>
                    <option value="Paytm">Paytm</option>
                  </select>

                  <button
                    onClick={handleSubmitPayment}
                    className="bg-green-500 text-white px-6 py-2 w-full"
                  >
                    Yes, I Completed Payment
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === "history" && (
            <table className="w-full border-collapse border border-gray-300">
              <thead className="bg-gray-200">
                <tr>
                  <th className="border p-2 text-black">Amount</th>
                  <th className="border p-2 text-black">App Used</th>
                  <th className="border p-2 text-black">Transaction ID</th>
                  <th className="border p-2 text-black">Date</th>
                  <th className="border p-2 text-black">Status</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h) => (
                  <tr key={h._id}>
                    <td className="border p-2 text-black">₹{h.amount}</td>
                    <td className="border p-2 text-black">{h.appUsed}</td>
                    <td className="border p-2 text-black">{h.transactionId}</td>
                    <td className="border p-2 text-black">
                      {new Date(h.createdAt).toLocaleDateString()}
                    </td>
                    <td className="border p-2 text-black">{h.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
