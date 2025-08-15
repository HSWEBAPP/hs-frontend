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
      <button onClick={handleClick} className="bg-blue-500 text-white px-4 py-2 rounded">
        Use {feature}
      </button>

      {/* Confirm Modal */}
      {showConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50">
          <div className="bg-white p-6 rounded shadow-lg text-center">
            <p>This will cost ₹10 from your wallet. Continue?</p>
            <div className="mt-4 flex gap-4 justify-center">
              <button onClick={confirmDeduction} className="bg-green-500 text-white px-4 py-2 rounded">Yes</button>
              <button onClick={() => setShowConfirm(false)} className="bg-gray-300 px-4 py-2 rounded">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Low Balance Modal */}
      {showLowBalance && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50">
          <div className="bg-white p-6 rounded shadow-lg text-center">
            <p>Insufficient balance. Please recharge.</p>
            <button className="bg-red-500 text-white px-4 py-2 rounded mt-4"
              onClick={() => window.location.href = "/recharge"}>
              Recharge Now
            </button>
          </div>
        </div>
      )}
    </>
  );
}
