import { useEffect, useState } from "react";
import { fetchUsers, updateUserStatus, updateUser } from "../../api/auth";
import Sidebar from "../../Components/Sidebar";
import Header from "../../Components/Header";
import DataTable from "../../Components/Table";
import { useWallet } from "../../contexts/WalletContext";
import { toast } from "react-hot-toast";
import { Filter } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({});
  const [filters, setFilters] = useState({
    from: "",
    to: "",
    mobile: "",
    email: "",
    state: "",
    district: "",
    taluka: "",
  });
  const [tempFilters, setTempFilters] = useState(filters);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const { balance } = useWallet();

  // Pagination logic
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredUsers.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(filteredUsers.length / rowsPerPage);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    fetchUsers()
      .then((res) => {
        setUsers(res.data);
        setFilteredUsers(res.data);
      })
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    let filtered = [...users];

    if (filters.from) {
      const fromDate = new Date(filters.from);
      fromDate.setHours(0, 0, 0, 0);
      filtered = filtered.filter((user) => new Date(user.createdAt) >= fromDate);
    }

    if (filters.to) {
      const toDate = new Date(filters.to);
      toDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter((user) => new Date(user.createdAt) <= toDate);
    }

    if (filters.mobile) filtered = filtered.filter((u) => u.mobile.includes(filters.mobile));
    if (filters.email)
      filtered = filtered.filter((u) =>
        u.email.toLowerCase().includes(filters.email.toLowerCase())
      );
    if (filters.state)
      filtered = filtered.filter((u) =>
        u.state?.toLowerCase().includes(filters.state.toLowerCase())
      );
    if (filters.district)
      filtered = filtered.filter((u) =>
        u.district?.toLowerCase().includes(filters.district.toLowerCase())
      );
    if (filters.taluka)
      filtered = filtered.filter((u) =>
        u.taluka?.toLowerCase().includes(filters.taluka.toLowerCase())
      );

    setFilteredUsers(filtered);
    setCurrentPage(1); // Reset page on filter change
  }, [filters, users]);

  const appliedFilterCount = Object.values(filters).filter((v) => v).length;

  const handleUpdate = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name || "",
      email: user.email || "",
      mobile: user.mobile || "",
      taluka: user.taluka || "",
      district: user.district || "",
      state: user.state || "",
      shopName: user.shopName || "",
      aadhaar: user.aadhaar || "",
      role: user.role || "user",
    });
  };

  const handleSave = async () => {
    try {
      await updateUser(editingUser._id, formData);
      setEditingUser(null);
      loadUsers();
      toast.success("User updated successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update user");
    }
  };

  const handleStatusChange = (id, newStatus) => {
    updateUserStatus(id, newStatus)
      .then(() => loadUsers())
      .catch((err) => console.error(err));
  };

  const columns = [
    { key: "sno", label: "S.No" },
    { key: "email", label: "Email" },
    { key: "mobile", label: "Mobile" },
    { key: "state", label: "State" },
    { key: "district", label: "District" },
    { key: "taluka", label: "Taluk" },
    {
      key: "createdAt",
      label: "Registration Date",
      render: (value) => new Date(value).toLocaleDateString(),
    },
    {
      key: "status",
      label: "Status",
      render: (value) => (
        <span
          className={`px-3 py-1 rounded text-white ${
            value === "active" ? "bg-green-500" : "bg-red-500"
          }`}
        >
          {value === "active" ? "Active" : "Deactive"}
        </span>
      ),
    },
  ];

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 w-[60%]">
        <Header />

        {/* Top bar with filter icon */}
        <div className="flex justify-between items-center px-4 py-2">
          <h3 className="text-xl font-bold mb-4 text-black">All Users</h3>
          <button
            onClick={() => setIsFilterOpen(true)}
            className="relative flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            <Filter size={18} />
            Filter
            {appliedFilterCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                {appliedFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Data Table */}
        <div className="px-4">
          <div className="max-w-full overflow-x-auto">
            <div className="max-h-[400px] overflow-y-auto">
              <DataTable
                columns={columns}
                data={currentRows} // only current page rows
                onUpdate={handleUpdate}
                onStatusChange={handleStatusChange}
              />
            </div>

            {/* Pagination Controls */}
            {filteredUsers.length > rowsPerPage && (
              <div className="flex justify-between items-center mt-4 px-1">
                <div>
                  Showing {indexOfFirstRow + 1} to{" "}
                  {Math.min(indexOfLastRow, filteredUsers.length)} of{" "}
                  {filteredUsers.length} entries
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className="px-2 py-1 bg-gray-800 text-white rounded disabled:opacity-50"
                  >
                    Prev
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`px-2 py-1 rounded ${
                        currentPage === i + 1
                          ? "bg-blue-600 text-white"
                          : "bg-gray-800 text-white"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() =>
                      setCurrentPage((prev) =>
                        Math.min(prev + 1, totalPages)
                      )
                    }
                    disabled={currentPage === totalPages}
                    className="px-2 py-1 bg-gray-800 text-white rounded disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Slide-out Filter Sidebar */}
        <div
          className={`fixed custom-filter-sidebar top-0 right-0 h-full w-80 bg-white shadow-lg transform transition-transform duration-300 z-50 ${
            isFilterOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="p-4 flex justify-between items-center border-b">
            <h2 className="font-bold text-lg text-black">Filters</h2>
            <button
              onClick={() => setIsFilterOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          <div className="p-4 space-y-4 text-black overflow-y-auto max-h-[calc(100vh-64px)]">
            <div>
              <label className="block mb-1 font-medium">From Date</label>
              <DatePicker
                selected={tempFilters.from ? new Date(tempFilters.from) : null}
                onChange={(date) =>
                  setTempFilters({
                    ...tempFilters,
                    from: date ? date.toISOString().split("T")[0] : "",
                  })
                }
                className="w-full border rounded px-3 py-2 text-black"
                placeholderText="Select From Date"
                dateFormat="yyyy-MM-dd"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">To Date</label>
              <DatePicker
                selected={tempFilters.to ? new Date(tempFilters.to) : null}
                onChange={(date) =>
                  setTempFilters({
                    ...tempFilters,
                    to: date ? date.toISOString().split("T")[0] : "",
                  })
                }
                className="w-full border rounded px-3 py-2 text-black"
                placeholderText="Select To Date"
                dateFormat="yyyy-MM-dd"
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">Mobile</label>
              <input
                type="text"
                value={tempFilters.mobile}
                onChange={(e) =>
                  setTempFilters({ ...tempFilters, mobile: e.target.value })
                }
                className="w-full border rounded px-3 py-2"
                placeholder="Mobile"
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">Email</label>
              <input
                type="text"
                value={tempFilters.email}
                onChange={(e) =>
                  setTempFilters({ ...tempFilters, email: e.target.value })
                }
                className="w-full border rounded px-3 py-2"
                placeholder="Email"
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">State</label>
              <input
                type="text"
                value={tempFilters.state}
                onChange={(e) =>
                  setTempFilters({ ...tempFilters, state: e.target.value })
                }
                className="w-full border rounded px-3 py-2"
                placeholder="State"
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">District</label>
              <input
                type="text"
                value={tempFilters.district}
                onChange={(e) =>
                  setTempFilters({ ...tempFilters, district: e.target.value })
                }
                className="w-full border rounded px-3 py-2"
                placeholder="District"
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">Taluk</label>
              <input
                type="text"
                value={tempFilters.taluka}
                onChange={(e) =>
                  setTempFilters({ ...tempFilters, taluka: e.target.value })
                }
                className="w-full border rounded px-3 py-2"
                placeholder="Taluk"
              />
            </div>

            <div className="flex justify-between mt-4">
              <button
                onClick={() => {
                  const resetFilters = {
                    from: "",
                    to: "",
                    mobile: "",
                    email: "",
                    state: "",
                    district: "",
                    taluka: "",
                  };
                  setTempFilters(resetFilters);
                  setFilters(resetFilters); // auto apply
                  setIsFilterOpen(false);
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded"
              >
                Clear
              </button>

              <button
                onClick={() => {
                  setFilters(tempFilters);
                  setIsFilterOpen(false);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                Apply
              </button>
            </div>
          </div>
        </div>

        {/* Edit User Modal */}
        {editingUser && (
          <div className="fixed inset-0 z-10 bg-black bg-opacity-40 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg w-[800px] max-h-[90vh] shadow-lg overflow-y-auto text-black">
              <h2 className="text-lg font-bold mb-4">Edit User</h2>

              {Object.keys(formData).map(
                (key) =>
                  key !== "role" && (
                    <div key={key} className="mb-3">
                      <label className="block text-sm font-medium mb-1 capitalize">
                        {key}
                      </label>
                      <input
                        type="text"
                        value={formData[key]}
                        onChange={(e) =>
                          setFormData({ ...formData, [key]: e.target.value })
                        }
                        className="w-full border rounded px-3 py-2 text-sm text-black"
                      />
                    </div>
                  )
              )}

              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">Role</label>
                <select
                  value={formData.role}
                  disabled
                  className="w-full border rounded px-3 py-2 text-sm text-gray-500 bg-gray-100 cursor-not-allowed"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 bg-gray-400 text-white rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
