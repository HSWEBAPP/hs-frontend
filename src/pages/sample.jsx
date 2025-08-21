// src/components/ToolButton.jsx
import { useWallet } from "../contexts/WalletContext";
import { deductWallet } from "../api/auth";
import { toast } from "react-hot-toast";

export default function ToolButton({ feature = "Unknown Tool", onUseTool }) {
  const { balance, setBalance, fetchBalance } = useWallet();

  const handleClick = async () => {
    try {
      // Deduct ₹10 from wallet for this feature
      const res = await deductWallet(feature);
      console.log("Deduction Response:", res);

      // Update wallet balance in context
      if (res.data.balance !== undefined) {
        setBalance(res.data.balance);
      } else {
        await fetchBalance();
      }

      toast.success(`₹10 deducted for ${feature}. Remaining: ₹${res.data.balance}`);

      if (onUseTool) onUseTool();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to use tool");
    }
  };

  return (
    <button
      onClick={handleClick}
      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow"
    >
      Use {feature}
    </button>
  );
}
