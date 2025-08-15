import { deductWallet, rechargeWallet, getWalletBalance } from "../api/auth";
import { toast } from "react-hot-toast";

export const handleWalletDeduction = async (feature, fetchBalance) => {
  try {
    const res = await deductWallet(feature); // ✅ pass feature
    toast.success(res.data.message); // will now show: ₹10 deducted for Passport Photo
    fetchBalance(); // refresh wallet
    return true;
  } catch (err) {
    toast.error(err.response?.data?.message || "Failed to deduct");
    return false;
  }
};

export const handleWalletRecharge = async (amount, fetchBalance) => {
  try {
    const res = await rechargeWallet(amount);
    toast.success(res.data.message);
    fetchBalance();
  } catch (err) {
    toast.error(err.response?.data?.message || "Recharge failed");
  }
};
