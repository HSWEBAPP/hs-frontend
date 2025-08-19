import { useState } from "react";
import { motion } from "framer-motion";
import { Edit2, CheckCircle, XCircle } from "lucide-react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const DataTable = ({ columns, data, onDelete, onUpdate, onStatusChange, loading }) => {
  const [selected, setSelected] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  // Sorting Logic
  const sortedData = [...data].sort((a, b) => {
    if (!sortConfig.key) return 0;
    const valA = a[sortConfig.key]?.toString().toLowerCase();
    const valB = b[sortConfig.key]?.toString().toLowerCase();
    if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
    if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  const toggleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  // Select / Deselect Logic
  const toggleSelectAll = () => {
    if (selected.length === data.length) setSelected([]);
    else setSelected(data.map((item) => item._id));
  };

  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };

  return (
    <div className="bg-white shadow-lg rounded-2xl overflow-hidden h-[calc(100vh-150px)]">
      <div className="overflow-x-auto h-full">
        <div className="overflow-y-auto h-full">
          <table className="w-full min-w-[900px] border-collapse">
            <thead className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white sticky top-0 z-10">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className="px-3 py-3 text-sm font-semibold tracking-wide text-center cursor-pointer select-none"
                    onClick={() => toggleSort(col.key)}
                  >
                    {col.label}
                    {sortConfig.key === col.key &&
                      (sortConfig.direction === "asc" ? " ▲" : " ▼")}
                  </th>
                ))}
                <th className="px-3 py-3 text-sm font-semibold text-center">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {loading
                ? Array.from({ length: 6 }).map((_, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                      {columns.map((col) => (
                        <td key={col.key} className="!py-3 text-center">
                          <Skeleton height={20} />
                        </td>
                      ))}
                      <td className="!py-3 text-center">
                        <Skeleton height={20} width={60} />
                      </td>
                    </tr>
                  ))
                : sortedData.length > 0
                ? sortedData.map((row, index) => (
                    <motion.tr
                      key={row._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.02 }}
                      className={`transition-colors duration-200 ${
                        index % 2 === 0 ? "bg-gray-50" : "bg-white"
                      } hover:bg-blue-50`}
                    >
                      {columns.map((col) => (
                        <td
                          key={col.key}
                          className="!py-3 text-sm text-center text-gray-800 whitespace-nowrap"
                        >
                          {col.key === "sno"
                            ? index + 1
                            : col.key === "status"
                            ? row.role === "admin"
                              ? "-"
                              : (
                                <button
                                  onClick={() =>
                                    onStatusChange && onStatusChange(row._id, row.isActive)
                                  }
                                  className={`flex items-center gap-1 justify-center !px-2 !py-1 rounded-lg text-xs text-white ${
                                    row.isActive
                                      ? "!bg-green-500 !hover:bg-green-600"
                                      : "!bg-red-500 !hover:bg-red-600"
                                  }`}
                                >
                                  {row.isActive ? (
                                    <>
                                      <CheckCircle size={14} /> Active
                                    </>
                                  ) : (
                                    <>
                                      <XCircle size={14} /> Deactive
                                    </>
                                  )}
                                </button>
                              )
                            : col.render
                            ? col.render(row[col.key], row)
                            : row[col.key]}
                        </td>
                      ))}

                      <td className="!px-2 !py-1 text-center whitespace-nowrap">
                        {row.role === "admin" ? (
                          "-"
                        ) : (
                          <button
                            onClick={() => onUpdate && onUpdate(row)}
                            className="flex items-center gap-1 !px-2 !py-1 rounded-lg !bg-indigo-500 text-white text-xs hover:bg-indigo-600 transition"
                          >
                            <Edit2 size={14} /> Edit
                          </button>
                        )}
                      </td>
                    </motion.tr>
                  ))
                : (
                  <tr>
                    <td
                      colSpan={columns.length + 1}
                      className="text-center py-6 text-gray-500"
                    >
                      🚀 No records found
                    </td>
                  </tr>
                )}
            </tbody>
          </table>
        </div>
      </div>

      {selected.length > 0 && (
        <div className="p-3 bg-gray-50 border-t flex justify-between items-center">
          <span className="text-gray-700 text-sm">
            {selected.length} selected
          </span>
          <div>
            <button
              onClick={() => onDelete && onDelete(selected)}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded-lg text-sm"
            >
              Delete Selected
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
