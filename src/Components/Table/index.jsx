import { useState } from "react";

export default function DataTable({
  columns,
  data,
  onDelete,
  onUpdate,
  onStatusChange,
}) {
  const [selected, setSelected] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  // ✅ Sorting Logic
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

  // ✅ Select / Deselect Logic
  const toggleSelectAll = () => {
    if (selected.length === data.length) {
      setSelected([]);
    } else {
      setSelected(data.map((item) => item._id));
    }
  };

  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };

  return (
    <div className="bg-white shadow-md rounded-lg ">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] border-collapse border border-gray-300 text-sm">
          <thead className="bg-gray-100">
            <tr>
              {/* <th className="p-3 border text-center text-black">
                <input
                  type="checkbox"
                  checked={selected.length === data.length && data.length > 0}
                  onChange={toggleSelectAll}
                />
              </th> */}
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="p-3 border cursor-pointer text-gray-700 font-semibold text-center whitespace-nowrap"
                  onClick={() => toggleSort(col.key)}
                >
                  {col.label}
                  {sortConfig.key === col.key &&
                    (sortConfig.direction === "asc" ? " ▲" : " ▼")}
                </th>
              ))}
              <th className="p-3 border text-gray-700 font-semibold text-center">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((row, index) => (
              <tr
                key={row._id}
                className={`transition-colors duration-150 ${
                  row.role === "admin"
                    ? "bg-gray-100 cursor-not-allowed"
                    : "hover:bg-gray-50"
                }`}
              >
                {/* <td className="p-3 border text-center text-black">
                  <input
                    type="checkbox"
                    checked={selected.includes(row._id)}
                    onChange={() => toggleSelect(row._id)}
                    disabled={row.role === "admin"}
                  />
                </td> */}

                {/* Render table cells */}
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className="p-3 border text-center text-black"
                  >
                    {col.key === "sno" ? (
                      index + 1
                    ) : col.key === "status" ? (
                        row?.role==="admin"?"-":
                      <button
                        onClick={() =>
                          row.role !== "admin" &&
                          onStatusChange(row._id, row.isActive)
                        }
                        disabled={row.role === "admin"}
                        className={`px-3 py-1 rounded text-white ${
                          row.isActive
                            ? "!bg-green-500 !hover:bg-green-600"
                            : "!bg-red-500 !hover:bg-red-600"
                        } `}
                      >
                        {row.isActive ? "Active" : "Deactive"}
                      </button>
                    ) : col.render ? (
                      col.render(row[col.key], row)
                    ) : (
                      row[col.key]
                    )}
                  </td>
                ))}

                {/* Action Buttons */}
                <td className="p-3 border text-center text-black whitespace-nowrap">
                    {row?.role==="admin"?"-":
                  <button
                    onClick={() => onUpdate(row)}
                   
                    className={`px-3 py-1 rounded mr-2 text-sm text-white ${
                      "bg-blue-500 hover:bg-blue-600"
                    }`}
                  >
                    Edit
                  </button>
                }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ✅ Bulk Actions */}
      {selected.length > 0 && (
        <div className="p-3 bg-gray-50 border-t flex justify-between items-center">
          <span className="text-gray-700 text-sm">
            {selected.length} selected
          </span>
          <div>
            <button
              onClick={() => alert(`Bulk delete: ${selected}`)}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded text-sm"
            >
              Delete Selected
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
