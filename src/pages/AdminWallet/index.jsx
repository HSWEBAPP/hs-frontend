import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import Sidebar from "../../Components/Sidebar";
import Header from "../../Components/Header";
import { useWallet } from '../../contexts/WalletContext';
const AdminWalletPage = () => {
  const [activeTab, setActiveTab] = useState("recharge"); // default tab
  const [rechargeHistory, setRechargeHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const { fetchBalance, setBalance } = useWallet();
  useEffect(() => {
    if (activeTab === "recharge") fetchRechargeHistory();
  }, [activeTab]);

  // Fetch pending & processed QR recharges
  const fetchRechargeHistory = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        "http://localhost:5000/api/admin/wallet/recharges",
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}`,  "Cache-Control": "no-cache" },
        }
      );
      setRechargeHistory(data);
      setLoading(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch recharge history");
      setLoading(false);
    }
  };

  // Approve a recharge request
const handleApprove = async (id) => {
  try {
    const { data } = await axios.put(
      `http://localhost:5000/api/admin/wallet/recharges/${id}/approve`,
      {},
      { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
    );

    toast.success(data.message);
      // ✅ Update wallet balance globally
      setBalance(data.walletBalance);


    // Refresh recharge list
    fetchRechargeHistory();
  } catch (error) {
    console.error(error);
    toast.error(error.response?.data?.message || "Failed to approve recharge");
  }
};


  // Reject a recharge request
  const handleReject = async (id) => {
    try {
      await axios.put(
        `http://localhost:5000/api/admin/wallet/recharges/${id}/reject`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      toast.success("Recharge rejected successfully");
      fetchRechargeHistory();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to reject recharge");
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <div className="flex-1">
        {/* Top header */}
        <Header />
        <div className="p-4">
          {/* <h1 className="text-2xl font-bold mb-4 text-black">Admin Wallet</h1> */}

          {/* Tabs */}
          <div className="flex gap-2 mb-4">
            <button
              className={`px-4 py-2 rounded ${
                activeTab === "recharge"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200"
              }`}
              onClick={() => setActiveTab("recharge")}
            >
              Recharge History
            </button>
            <button
              className={`px-4 py-2 rounded ${
                activeTab === "transaction"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200"
              }`}
              onClick={() => setActiveTab("transaction")}
            >
              Transaction History
            </button>
            <button className="px-4 py-2 rounded bg-gray-200" disabled>
              Manual Credit
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === "recharge" && (
            <>
              {loading ? (
                <p>Loading...</p>
              ) : rechargeHistory.length === 0 ? (
                <p>No recharge requests found.</p>
              ) : (
                <table className="w-full border">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="p-2 border text-black">User</th>
                      <th className="p-2 border text-black">Email</th>
                      <th className="p-2 border text-black">Amount</th>
                      <th className="p-2 border text-black">Transaction ID</th>
                      <th className="p-2 border text-black">App Used</th>
                      <th className="p-2 border text-black">Status</th>
                      <th className="p-2 border text-black">Date</th>
                      <th className="p-2 border text-black">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rechargeHistory.map((item) => (
                      <tr key={item._id} className="text-center">
                        <td className="p-2 border text-black">
                          {item.user?.name || "N/A"}
                        </td>
                        <td className="p-2 border text-black">{item.user?.email}</td>
                        <td className="p-2 border text-black">₹{item.amount}</td>
                        <td className="p-2 border text-black">{item.transactionId}</td>
                        <td className="p-2 border text-black">{item.appUsed}</td>
                        <td className="p-2 border text-black capitalize">{item.status}</td>
                        <td className="p-2 border text-black">
                          {new Date(item.createdAt).toLocaleString()}
                        </td>
                        <td className="p-2 border flex gap-2 justify-center text-black">
                          {item.status === "pending" && (
                            <>
                              <button
                                className="px-2 py-1 bg-green-500 text-white rounded"
                                onClick={() => handleApprove(item._id)}
                              >
                                Approve
                              </button>
                              <button
                                className="px-2 py-1 bg-red-500 text-white rounded"
                                onClick={() => handleReject(item._id)}
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {item.status !== "pending" && <span>N/A</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </>
          )}

          {activeTab === "transaction" && (
            <p>Transaction History tab coming soon</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminWalletPage;
