import { useEffect, useState } from "react";
import {
  fetchRechargeRequests,
  approveRecharge,
  rejectRechargeRequest,
} from "../../api/auth";
import Sidebar from "../../Components/Sidebar";
import Header from "../../Components/Header";

export default function ManageRecharge() {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      const res = await fetchRechargeRequests();
      setRequests(res.data);
    } catch (err) {
      console.error("Error loading recharge requests", err);
    }
  };

  const handleApprove = async (id) => {
    try {
      await approveRecharge(id);
      loadRequests();
    } catch (err) {
      console.error("Error approving recharge", err);
    }
  };

  const handleReject = async (id) => {
    try {
      await rejectRechargeRequest(id);
      loadRequests();
    } catch (err) {
      console.error("Error rejecting recharge", err);
    }
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1">
        <Header title="Manage Recharge" />
        <div className="p-4 overflow-x-auto">
          <table className="w-full border border-gray-300 text-sm">
            <thead className="bg-gray-200">
              <tr>
                <th className="border px-4 py-2 text-black">S.No</th>
                <th className="border px-4 py-2 text-black">Email</th>
                {/* <th className="border px-4 py-2 text-black">Mobile</th> */}
                <th className="border px-4 py-2 text-black">Recharge ID</th>
                <th className="border px-4 py-2 text-black">App Used</th>
                <th className="border px-4 py-2 text-black">Amount</th>
                <th className="border px-4 py-2 text-black">Date & Time</th>
                <th className="border px-4 py-2 text-black">Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.length > 0 ? (
                requests.map((row, index) => (
                  <tr key={row._id}>
                    <td className="border px-4 py-2 text-black">
                      {index + 1}
                    </td>
                    <td className="border px-4 py-2 text-black">
                      {row.user?.email || "N/A"}
                    </td>
                    {/* <td className="border px-4 py-2 text-black">
                      {row.user?.mobile || "N/A"}
                    </td> */}
                    <td className="border px-4 py-2 text-black">
                      {row.transactionId}
                    </td>
                    <td className="border px-4 py-2 text-black">
                      {row.appUsed || "N/A"}
                    </td>
                    <td className="border px-4 py-2 text-black">₹{row.amount}</td>
                    <td className="border px-4 py-2 text-black">
                      {new Date(row.createdAt).toLocaleString()}
                    </td>
                    <td className="border px-4 py-2 text-black">
                      {row.status === "pending" ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApprove(row._id)}
                            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(row._id)}
                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span
                          className={`px-3 py-1 rounded text-white ${
                            row.status === "approved"
                              ? "bg-green-500"
                              : row.status === "rejected"
                              ? "bg-red-500"
                              : "bg-gray-400"
                          }`}
                        >
                          {row.status.charAt(0).toUpperCase() +
                            row.status.slice(1)}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center py-4">
                    No recharge requests found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
