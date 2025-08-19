// pages/user/RechargeHistoryPage.jsx
import { useEffect, useState } from "react";
import Sidebar from "../../Components/Sidebar";
import Header from "../../Components/Header";
import axios from "axios";
import toast from "react-hot-toast";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export default function RechargeHistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true); // Loading state
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        "https://hs-backend-2.onrender.com/api/wallet/recharge/history",
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setHistory(data.history || []);
    } catch (error) {
      console.log(error.response?.data || error.message);
      toast.error("Failed to fetch history");
    } finally {
      setLoading(false);
    }
  };

  // Pagination logic
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = history.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(history.length / rowsPerPage);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1">
        <Header title="Recharge History" />
        <div className="p-6">
  <div className="overflow-x-auto bg-white shadow-lg rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-3 py-3 text-gray-600 text-center">S.No</th>
                  <th className="px-3 py-3 text-gray-600 text-center">Recharge ID</th>
                  <th className="px-3 py-3 text-gray-600 text-center">App Used</th>
                  <th className="px-3 py-3 text-gray-600 text-center">Amount</th>
                  <th className="px-3 py-3 text-gray-600 text-center">Date & Time</th>
                  <th className="px-3 py-3 text-gray-600 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading
                  ? Array.from({ length: rowsPerPage }).map((_, idx) => (
                      <tr key={idx} className={idx % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                        {Array.from({ length: 6 }).map((_, i) => (
                          <td key={i} className="px-3 py-3">
                            <Skeleton height={20} />
                          </td>
                        ))}
                      </tr>
                    ))
                  : currentRows.length > 0
                  ? currentRows.map((h, index) => (
                      <tr key={h._id} className="hover:bg-gray-50 transition duration-200">
                        <td className="px-3 py-3 text-center font-medium text-gray-600">
                          {indexOfFirstRow + index + 1}
                        </td>
                        <td className="px-3 py-3 font-mono text-center text-gray-600">{h._id}</td>
                        <td className="px-3 py-3 text-gray-600 text-center">{h.appUsed || "N/A"}</td>
                        <td className="px-3 py-3 font-semibold text-center !text-green-600">₹{h.amount}</td>
                        <td className="px-3 py-3 text-gray-600 text-center">
                          {new Date(h.createdAt).toLocaleString()}
                        </td>
                        <td className="px-3 py-3 text-center">
                          <span
                            className={`px-4 py-1 rounded-full text-xs font-semibold shadow-md capitalize ${
                              h.status === "approved"
                                ? "bg-green-100 text-green-700"
                                : h.status === "rejected"
                                ? "bg-red-100 text-red-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {h.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  : (
                      <tr>
                        <td
                          colSpan="6"
                          className="text-center py-6 text-gray-500 italic"
                        >
                          No recharge history found 🚫
                        </td>
                      </tr>
                    )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {!loading && history.length > rowsPerPage && (
            <div className="flex justify-between items-center mt-4 !px-1">
              <div>
                Showing {indexOfFirstRow + 1} to{" "}
                {Math.min(indexOfLastRow, history.length)} of {history.length} entries
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="!px-2 !py-1 !bg-[#232834] rounded disabled:opacity-50"
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
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="!px-2 !py-1 !bg-[#232834] rounded disabled:opacity-50"
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
