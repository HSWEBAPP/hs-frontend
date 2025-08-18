// pages/user/RechargeHistoryPage.jsx
import { useEffect, useState } from "react";
import Sidebar from "../../Components/Sidebar";
import Header from "../../Components/Header";
import axios from "axios";
import toast from "react-hot-toast";

export default function RechargeHistoryPage() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const { data } = await axios.get(
        "https://hs-backend-2.onrender.com/api/wallet/user/recharge/history",
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setHistory(data.history || []);
    } catch (error) {
      console.log(error.response?.data || error.message);
      toast.error("Failed to fetch history");
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1">
        <Header />
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4 text-black">Recharge History</h2>

          <table className="w-full border-collapse border border-gray-300">
            <thead className="bg-gray-200">
              <tr>
                <th className="border p-2 text-black">S.No</th>
                <th className="border p-2 text-black">Recharge ID</th>
                <th className="border p-2 text-black">App Used</th>
                <th className="border p-2 text-black">Amount</th>
                <th className="border p-2 text-black">Date</th>
                <th className="border p-2 text-black">Time</th>
                <th className="border p-2 text-black">Status</th>
              </tr>
            </thead>
            <tbody>
              {history.length > 0 ? (
                history.map((h, index) => (
                  <tr key={h._id}>
                    <td className="border p-2 text-black text-center">{index + 1}</td>
                    <td className="border p-2 text-black">{h._id}</td>
                    <td className="border p-2 text-black">{h.appUsed}</td>
                    <td className="border p-2 text-black">₹{h.amount}</td>
                    <td className="border p-2 text-black">
                      {new Date(h.createdAt).toLocaleDateString()}
                    </td>
                    <td className="border p-2 text-black">
                      {new Date(h.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td
                      className={`border border-black p-2 text-white font-medium text-center capitalize ${
                        h.status === "approved"
                          ? "bg-green-500"
                          : h.status === "rejected"
                          ? "bg-red-500"
                          : "bg-yellow-500"
                      }`}
                    >
                      {h.status}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center p-4 text-gray-500">
                    No recharge history found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
