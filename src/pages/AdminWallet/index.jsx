import { useEffect, useState } from "react";
import {
  fetchRechargeRequests,
  approveRecharge,
  rejectRechargeRequest,
} from "../../api/auth";
import Sidebar from "../../Components/Sidebar";
import Header from "../../Components/Header";
import toast from "react-hot-toast";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export default function ManageRecharge() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const res = await fetchRechargeRequests();
      setRequests(res.data);
    } catch (err) {
      console.error("Error loading recharge requests", err);
      toast.error("Failed to load recharge requests");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await approveRecharge(id);
      toast.success("Recharge approved successfully");
      loadRequests();
    } catch (err) {
      console.error("Error approving recharge", err);
      toast.error("Failed to approve recharge");
    }
  };

  const handleReject = async (id) => {
    try {
      await rejectRechargeRequest(id);
      toast.success("Recharge rejected successfully");
      loadRequests();
    } catch (err) {
      console.error("Error rejecting recharge", err);
      toast.error("Failed to reject recharge");
    }
  };

  // Pagination logic
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = requests.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(requests.length / rowsPerPage);

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />
   <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header title="Manage Recharge" />
          <div className="flex-1 overflow-y-auto p-6">
         <div className="overflow-x-auto bg-white shadow-lg rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-3 py-3 text-start text-gray-600">S.No</th>
                  <th className="px-3 py-3 text-start text-gray-600">Email</th>
                  <th className="px-3 py-3 text-start text-gray-600">Recharge ID</th>
                  <th className="px-3 py-3 text-start text-gray-600">App Used</th>
                  <th className="px-3 py-3 text-start text-gray-600">Amount</th>
                  <th className="px-3 py-3 text-center text-gray-600">Date & Time</th>
                  <th className="px-3 py-3  text-gray-600 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading
                  ? Array.from({ length: rowsPerPage }).map((_, idx) => (
                      <tr key={idx} className={idx % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                        {Array.from({ length: 7 }).map((_, i) => (
                          <td key={i} className="px-3 py-3">
                            <Skeleton height={20} />
                          </td>
                        ))}
                      </tr>
                    ))
                  : currentRows.length > 0
                  ? currentRows.map((row, index) => (
                      <tr
                        key={row._id}
                        className="hover:bg-gray-50 transition duration-200"
                      >
                        <td className="px-3 py-3 font-medium text-gray-600">
                          {indexOfFirstRow + index + 1}
                        </td>
                        <td className="px-3 py-3 text-gray-600">
                          {row.user?.email || "N/A"}
                        </td>
                        <td className="px-3 py-3 font-mono text-gray-600">
                          {row.transactionId}
                        </td>
                        <td className="px-3 py-3 text-gray-600">{row.appUsed || "N/A"}</td>
                        <td className="px-3 py-3 font-semibold text-green-600">
                          ₹{row.amount}
                        </td>
                        <td className="px-3 py-3 text-gray-600">
                          {new Date(row.createdAt).toLocaleString()}
                        </td>
                        <td className="px-3 py-3 text-center">
                          {row.status === "pending" ? (
                            <div className="flex justify-center gap-3">
                              <button
                                onClick={() => handleApprove(row._id)}
                                className="!bg-green-500 !hover:bg-green-600 text-white !px-2 !py-1 rounded-full shadow-md transition"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleReject(row._id)}
                                className="!bg-red-500 !hover:bg-red-600 text-white !px-2 !py-1 rounded-full shadow-md transition"
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span
                              className={`px-4 py-1 rounded-full text-xs font-semibold shadow-md ${
                                row.status === "approved"
                                  ? "bg-green-100 text-green-700"
                                  : row.status === "rejected"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-gray-200 text-gray-600"
                              }`}
                            >
                              {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  : (
                      <tr>
                        <td
                          colSpan="7"
                          className="text-center py-6 text-gray-500 italic"
                        >
                          No recharge requests found 🚫
                        </td>
                      </tr>
                    )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {!loading && requests.length > rowsPerPage && (
            <div className="flex justify-between items-center mt-4 !px-1">
              <div>
                Showing {indexOfFirstRow + 1} to{" "}
                {Math.min(indexOfLastRow, requests.length)} of {requests.length} entries
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="!px-2 !py-1 !bg-[#232834]  rounded disabled:opacity-50"
                >
                  Prev
                </button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`!px-2 !py-1 rounded ${
                      currentPage === i + 1 ? "!bg-blue-600 !text-white" : "!bg-[#232834]"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="!px-2 !py-1 !bg-[#232834] !text-white rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
