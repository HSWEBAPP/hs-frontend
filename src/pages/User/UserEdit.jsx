import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchUsers, updateUser } from "../../api/auth";
import Sidebar from "../../Components/Sidebar";
import Header from "../../Components/Header";
import { toast } from "react-hot-toast";
import { Pencil } from "lucide-react";

export default function UserProfile() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  // Get user name from localStorage
  const userName = localStorage.getItem("userName") || "?";

  // User first letter avatar
  const firstLetter = userName?.charAt(0).toUpperCase() || "?";
  const avatarBg =
    "#" + ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, "0");
  // Separate edit modes for sections
  const [personalEditing, setPersonalEditing] = useState(false);
  const [addressEditing, setAddressEditing] = useState(false);

  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchUsers()
      .then((res) => {
        const foundUser = res.data.find((u) => u._id === id);
        if (foundUser) {
          setUser(foundUser);
          setFormData(foundUser);
        }
      })
      .catch((err) => console.error(err));
  }, [id]);

  const handleSave = async (section) => {
    try {
      await updateUser(id, formData);
      setUser(formData);

      if (section === "personal") setPersonalEditing(false);
      if (section === "address") setAddressEditing(false);

      toast.success("User updated successfully!");
    } catch (err) {
      toast.error("Failed to update user");
      console.error(err);
    }
  };

  if (!user) return <div className="p-6 text-gray-500">Loading...</div>;

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header />

        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-5xl mx-auto space-y-6">
            {/* Profile Card */}
            <div className="bg-white shadow-lg rounded-lg p-6 flex items-center gap-6 border border-gray-300">
              <div
                style={{ backgroundColor: avatarBg }}
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold cursor-pointer"
              >
                {firstLetter}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">{user.name}</h2>
                <div className="flex">

                <p className="text-gray-600 capitalize">{user.role} &nbsp;&nbsp;|</p>&nbsp;&nbsp;&nbsp;
                <p className="text-gray-500">
                  {user.district}, {user.state}
                </p>
                </div>
              </div>
            </div>

            {/* Personal Information */}
            <div className="bg-white shadow-lg rounded-lg p-6 border border-gray-300">
              <div className="flex justify-between items-center border-b pb-3 mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  Personal Information
                </h3>
                {!personalEditing && (
                  <button
                    onClick={() => setPersonalEditing(true)}
                    className="flex !text-sm items-center gap-2 border !border-gray-300 !px-3 !text-black !bg-white !rounded-full"
                  >
                    <Pencil size={14} /> Edit
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoField
                  label="Full Name"
                  value={formData.name}
                  editing={personalEditing}
                  onChange={(val) => setFormData({ ...formData, name: val })}
                />

                <InfoField
                  label="Email address"
                  value={formData.email}
                  editing={personalEditing}
                  onChange={(val) => setFormData({ ...formData, email: val })}
                />
                <InfoField
                  label="Phone"
                  value={formData.mobile}
                  editing={personalEditing}
                  onChange={(val) => setFormData({ ...formData, mobile: val })}
                />
                <InfoField
                  disabled={true}
                  label="Bio"
                  value={formData.role}
                  editing={personalEditing}
                  onChange={(val) => setFormData({ ...formData, role: val })}
                />
              </div>

              {/* Buttons inside section */}

              {personalEditing && (
                <div className="flex justify-end gap-3 mt-4">
                  <button
                    onClick={() => {
                      setFormData(user); // 👈 reset to original
                      setPersonalEditing(false);
                    }}
                    className="px-4 py-2 !bg-gray-400 text-white rounded"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleSave("personal")}
                    className="px-4 py-2 !bg-blue-600 text-white rounded"
                  >
                    Save
                  </button>
                </div>
              )}
            </div>

            {/* Address Section */}
            <div className="bg-white shadow-lg rounded-lg p-6 border border-gray-300">
              <div className="flex justify-between items-center border-b pb-3 mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Address</h3>
                {!addressEditing && (
                  <button
                    onClick={() => setAddressEditing(true)}
                    className="flex !text-sm items-center gap-2 border !border-gray-300 !px-3 !text-black !bg-white !rounded-full"
                  >
                    <Pencil size={14} /> Edit
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoField
                  label="District"
                  value={formData.district}
                  editing={addressEditing}
                  onChange={(val) =>
                    setFormData({ ...formData, district: val })
                  }
                />
                <InfoField
                  label="City/State"
                  value={formData.state}
                  editing={addressEditing}
                  onChange={(val) => setFormData({ ...formData, state: val })}
                />
                <InfoField
                  label="Taluks"
                  value={formData.taluka}
                  editing={addressEditing}
                  onChange={(val) => setFormData({ ...formData, taluka: val })}
                />
                <InfoField
                  label="Shop Name"
                  value={formData.shopName}
                  editing={addressEditing}
                  onChange={(val) =>
                    setFormData({ ...formData, shopName: val })
                  }
                />
              </div>

              {/* Buttons inside section */}
              {addressEditing && (
                <div className="flex justify-end gap-3 mt-4">
                  <button
                    onClick={() => {
                      setFormData(user); // 👈 reset to original
                      setAddressEditing(false);
                    }}
                    className="px-4 py-2 !bg-gray-400 !text-white rounded"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleSave("address")}
                    className="px-4 py-2 !bg-blue-600 !text-white rounded"
                  >
                    Save
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* Reusable InfoField Component */
function InfoField({ label, value, editing, onChange, disabled = false }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-600 mb-1">
        {label}
      </label>
      {editing ? (
        <input
          type="text"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled} // 👈 actual HTML disabled attribute
          className={`w-full !border !rounded !px-3 !py-2 text-sm 
            ${
              disabled
                ? "!bg-gray-100 !text-gray-400 cursor-not-allowed"
                : "!text-gray-600"
            }`}
        />
      ) : (
        <p className="!text-gray-800">{value || "--"}</p>
      )}
    </div>
  );
}
