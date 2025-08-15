import React, { useEffect, useState } from "react";
import { fetchTransactions } from "../../api/auth";

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const loadTransactions = async () => {
      const res = await fetchTransactions();
      setTransactions(res.data);
    };
    loadTransactions();
  }, []);

  return (
    <div>
      <h2>Transaction History</h2>
      <table border="1" cellPadding="10">
        <thead>
          <tr>
            <th>User</th>
            <th>Transaction ID</th>
            <th>Amount</th>
            <th>Type</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((t) => (
            <tr key={t._id}>
              <td>{t.user.name}</td>
              <td>{t.transactionId}</td>
              <td>{t.amount}</td>
              <td>{t.type}</td>
              <td>{t.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Transactions;
