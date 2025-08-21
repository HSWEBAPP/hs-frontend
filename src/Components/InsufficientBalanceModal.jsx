import React from "react";
import { useNavigate } from "react-router-dom";

export default function InsufficientBalanceModal({ show, onClose }) {
  const navigate = useNavigate();
  if (!show) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-6 rounded-2xl shadow-lg w-96 text-center">
        <h2 className="text-lg font-semibold mb-3">Insufficient Balance</h2>
        <p className="mb-6">
          Your wallet doesn’t have enough funds to continue.  
          Please recharge to use this feature.
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded-lg"
          >
            Close
          </button>
          <button
            onClick={() => navigate("/recharge")}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
          >
            Recharge Now
          </button>
        </div>
      </div>
    </div>
  );
}
