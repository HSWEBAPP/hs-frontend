import { useWallet } from "../context/WalletContext";
import { handleWalletDeduction } from "../utils/walletActions";
import { useState } from "react";

export default function ToolButton({ feature, onUse }) {
  const { balance, fetchBalance } = useWallet();
  const [showConfirm, setShowConfirm] = useState(false);
  const [showLowBalance, setShowLowBalance] = useState(false);

  const handleClick = () => {
    if (balance < 10) {
      setShowLowBalance(true);
    } else {
      setShowConfirm(true);
    }
  };

  const confirmDeduction = async () => {
    const success = await handleWalletDeduction(feature, fetchBalance);
    if (success) {
      setShowConfirm(false);
      onUse(); // call the actual tool function
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        className="bg-black text-white px-5 py-2 rounded-xl shadow hover:bg-gray-800 transition"
      >
        Use {feature}
      </button>

      {/* Confirm Deduction Modal */}
      {showConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50">
          <div className="bg-white rounded-2xl p-6 shadow-2xl w-80 transform transition-all">
            <p className="text-gray-800 font-semibold text-lg text-center">
              This will cost <span className="text-red-500">₹10</span> from your wallet.
              <br /> Do you want to continue?
            </p>
            <div className="mt-6 flex justify-center gap-4">
              <button
                onClick={confirmDeduction}
                className="px-5 py-2 rounded-xl bg-green-500 text-white font-medium hover:bg-green-600 transition"
              >
                Yes
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="px-5 py-2 rounded-xl bg-gray-200 text-gray-700 font-medium hover:bg-gray-300 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Low Balance Modal */}
      {showLowBalance && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50">
          <div className="bg-white rounded-2xl p-6 shadow-2xl w-80 text-center transform transition-all">
            <p className="text-gray-800 font-semibold text-lg">
              ⚠️ Insufficient Balance
            </p>
            <p className="mt-2 text-gray-600">
              You don’t have enough funds. Please recharge to continue.
            </p>
            <button
              className="mt-5 px-5 py-2 rounded-xl !bg-red-500 !text-white font-medium hover:bg-red-600 transition"
              onClick={() => (window.location.href = "/recharge")}
            >
              Recharge Now
            </button>
            <button
              className="mt-3 px-4 py-2 rounded-xl !bg-gray-200 !text-gray-700 font-medium hover:bg-gray-300 transition"
              onClick={() => setShowLowBalance(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
