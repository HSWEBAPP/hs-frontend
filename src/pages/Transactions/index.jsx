// pages/admin/TransactionsPage.jsx
import React, { useEffect, useState } from "react";
import Sidebar from "../../Components/Sidebar";
import Header from "../../Components/Header";
import { fetchUserTransactions, fetchAdminTransactions } from "../../api/auth";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import toast from "react-hot-toast";
import { jwtDecode } from "jwt-decode";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // 👉 detect role from token
  const token = localStorage.getItem("token");
  let role = null;
  if (token) {
    try {
      role = jwtDecode(token).role;
    } catch (e) {
      console.error("Invalid token", e);
    }
  }

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      setLoading(true);

      let data;
      if (role === "admin") {
        ({ data } = await fetchAdminTransactions());
      } else {
        ({ data } = await fetchUserTransactions());
      }

      setTransactions(data || []);
    } catch (error) {
      console.error(error.response?.data || error.message);
      toast.error("Failed to fetch transactions");
    } finally {
      setLoading(false);
    }
  };

  // Pagination
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = transactions.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(transactions.length / rowsPerPage);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1">
        <Header title="Transaction History" />
        <div className="p-6">
          <div className="overflow-x-auto bg-white shadow-lg rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-3 py-3 text-gray-600 text-center">S.No</th>
                  {role === "admin" && (
                    <>
                      <th className="px-3 py-3 text-gray-600 text-center">
                        User
                      </th>
                      <th className="px-3 py-3 text-gray-600 text-center">
                        Email
                      </th>
                    </>
                  )}
                  <th className="px-3 py-3 text-gray-600 text-center">
                    Description
                  </th>
                  <th className="px-3 py-3 text-gray-600 text-center">
                    Amount
                  </th>
                  <th className="px-3 py-3 text-gray-600 text-center">Type</th>
                  <th className="px-3 py-3 text-gray-600 text-center">
                    Date & Time
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  Array.from({ length: rowsPerPage }).map((_, idx) => (
                    <tr
                      key={idx}
                      className={idx % 2 === 0 ? "bg-gray-50" : "bg-white"}
                    >
                      {Array.from({ length: role === "admin" ? 6 : 5 }).map(
                        (_, i) => (
                          <td key={i} className="px-3 py-3">
                            <Skeleton height={20} />
                          </td>
                        )
                      )}
                    </tr>
                  ))
                ) : currentRows.length > 0 ? (
                  currentRows.map((t, index) => (
                    <tr
                      key={t._id}
                      className="hover:bg-gray-50 transition duration-200"
                    >
                      <td className="px-3 py-2.5 text-center font-medium text-gray-600">
                        {indexOfFirstRow + index + 1}
                      </td>
                      {role === "admin" && (
                        <>
                          <td className="px-3 py-2.5 text-gray-600 text-center">
                            {t.user?.name || "N/A"}
                          </td>
                          <td className="px-3 py-2.5 text-gray-600 text-center">
                            {t.user?.email || "N/A"}
                          </td>
                        </>
                      )}
                      <td className="px-3 py-2.5 font-mono text-center text-gray-600">
                        {t.description || "-"}
                      </td>
                      <td className="px-3 py-2.5 font-semibold text-center !text-green-600">
                        ₹{t.amount}
                      </td>
                      <td className="px-3 py-2.5 text-gray-600 text-center">
                        {t.type}
                      </td>
                      <td className="px-3 py-2.5 text-gray-600 text-center">
                        {new Date(t.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={role === "admin" ? 6 : 5}
                      className="text-center py-6 text-gray-500 italic"
                    >
                      No transactions found 🚫
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {!loading && transactions.length > rowsPerPage && (
            <div className="flex justify-between items-center mt-4 !px-1">
              <div>
                Showing {indexOfFirstRow + 1} to{" "}
                {Math.min(indexOfLastRow, transactions.length)} of{" "}
                {transactions.length} entries
              </div>
              <div className="flex gap-2 items-center">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="!px-2 !py-1 !bg-[#232834] rounded disabled:opacity-50"
                >
                  Prev
                </button>

                {/* Show max 5 pages */}
                {(() => {
                  let startPage = Math.max(1, currentPage - 2);
                  let endPage = Math.min(totalPages, startPage + 4);

                  // Adjust start if less than 5 pages
                  if (endPage - startPage < 4) {
                    startPage = Math.max(1, endPage - 4);
                  }

                  return Array.from(
                    { length: endPage - startPage + 1 },
                    (_, i) => startPage + i
                  ).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`!px-2 !py-1 rounded ${
                        currentPage === page
                          ? "!bg-blue-600 !text-white"
                          : "!bg-[#232834]"
                      }`}
                    >
                      {page}
                    </button>
                  ));
                })()}

                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
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
