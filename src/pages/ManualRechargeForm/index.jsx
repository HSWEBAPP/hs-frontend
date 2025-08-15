import React, { useState } from "react";
import { manualRecharge } from "../../api/auth";

const ManualRechargeForm = () => {
  const [email, setEmail] = useState("");
  const [amount, setAmount] = useState("");
  const [transactionId, setTransactionId] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    await manualRecharge({ email, amount, transactionId });
    alert("Manual recharge successful");
    setEmail(""); setAmount(""); setTransactionId("");
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Manual Recharge</h2>
      <input
        type="email"
        placeholder="User Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="Transaction ID"
        value={transactionId}
        onChange={(e) => setTransactionId(e.target.value)}
        required
      />
      <button type="submit">Recharge</button>
    </form>
  );
};

export default ManualRechargeForm;
