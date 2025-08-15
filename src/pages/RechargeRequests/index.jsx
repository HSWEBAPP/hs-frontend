import React, { useEffect, useState } from "react";
import { fetchRechargeRequests, approveRecharge } from "../../api/auth";

const RechargeRequests = () => {
  const [recharges, setRecharges] = useState([]);

  const loadRecharges = async () => {
    const res = await fetchRechargeRequests();
    setRecharges(res.data);
  };

  const handleApprove = async (id) => {
    await approveRecharge(id);
    alert("Recharge approved");
    loadRecharges(); // refresh list
  };

  useEffect(() => {
    loadRecharges();
  }, []);

  return (
    <div>
      <h2>Recharge Requests</h2>
      <table border="1" cellPadding="10">
        <thead>
          <tr>
            <th>User</th>
            <th>Email</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {recharges.map((r) => (
            <tr key={r._id}>
              <td>{r.user.name}</td>
              <td>{r.user.email}</td>
              <td>{r.amount}</td>
              <td>{r.status}</td>
              <td>
                {r.status !== "Approved" && (
                  <button onClick={() => handleApprove(r._id)}>Approve</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RechargeRequests;
