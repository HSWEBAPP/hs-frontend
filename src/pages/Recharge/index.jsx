// src/pages/user/RechargePage.jsx
import React, { useEffect, useState } from "react";
import { getWalletBalance, rechargeWallet, getWalletHistory } from "../../api/auth";
import { useWallet } from "../../contexts/WalletContext";

export default function RechargePage() {
  const { balance, setBalance } = useWallet();
  const [amount, setAmount] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  // Load balance + history on mount
  useEffect(() => {
    loadBalance();
    loadHistory();
  }, []);

  const loadBalance = async () => {
    try {
      const res = await getWalletBalance();
      setBalance(res.data.balance || 0);
    } catch (err) {
      console.error("Error fetching balance:", err);
    }
  };

  const loadHistory = async () => {
    try {
      const res = await getWalletHistory();
      setHistory(res.data.history || []);
    } catch (err) {
      console.error("Error fetching history:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || !file) {
      alert("Please enter amount and upload QR screenshot");
      return;
    }

    const formData = new FormData();
    formData.append("amount", amount);
    formData.append("qrImage", file);

    setLoading(true);
    try {
      await rechargeWallet(formData);
      alert("Recharge request submitted successfully ✅");
      setAmount("");
      setFile(null);
      loadHistory();
    } catch (err) {
      console.error("Error submitting recharge:", err);
      alert("Recharge failed ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Wallet Recharge</h2>

      {/* Current Balance */}
      <div className="mb-6">
        <p className="text-lg">
          💰 Current Balance:{" "}
          <span className="font-semibold text-green-600">₹{balance}</span>
        </p>
      </div>

      {/* Recharge Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded-lg p-4 mb-6 max-w-md"
      >
        <div className="mb-4">
          <label className="block mb-1 font-medium">Recharge Amount (₹)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full border p-2 rounded"
            placeholder="Enter amount"
          />
        </div>

        <div className="mb-4">
          <label className="block mb-1 font-medium">Upload QR Screenshot</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files[0])}
            className="w-full"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Submitting..." : "Submit Recharge"}
        </button>
      </form>

      {/* Recharge History */}
      <div>
        <h3 className="text-xl font-semibold mb-2">Recharge History</h3>
        {history.length === 0 ? (
          <p className="text-gray-500">No recharges yet.</p>
        ) : (
          <ul className="space-y-2">
            {history.map((item) => (
              <li
                key={item._id}
                className="border p-3 rounded flex justify-between items-center"
              >
                <div>
                  <p className="font-medium">₹{item.amount}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(item.createdAt).toLocaleString()}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded text-sm ${
                    item.status === "pending"
                      ? "bg-yellow-200 text-yellow-800"
                      : item.status === "approved"
                      ? "bg-green-200 text-green-800"
                      : "bg-red-200 text-red-800"
                  }`}
                >
                  {item.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
