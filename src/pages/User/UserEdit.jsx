import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchUsers, updateUser, updateUserStatus } from "../../api/auth";
import Sidebar from "../../Components/Sidebar";
import Header from "../../Components/Header";
import { toast } from "react-hot-toast";

export default function UserProfile() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({});
  const [editing, setEditing] = useState(false);

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

  const handleSave = async () => {
    try {
      await updateUser(id, formData);
      setUser(formData);
      setEditing(false);
      toast.success("User updated successfully!");
    } catch (err) {
      toast.error("Failed to update user");
      console.error(err);
    }
  };

  if (!user) return <div className="p-6 text-gray-500">Loading...</div>;

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className="flex-1">
        <Header />

        <div className="p-6">
          <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-6">
            {/* Profile Header */}
            <div className="flex items-center gap-6 border-b pb-6 mb-6">
              <img
                src="https://i.pravatar.cc/100"
                alt="profile"
                className="w-24 h-24 rounded-full border"
              />
              <div>
                <h2 className="text-2xl font-bold text-gray-800">{user.name}</h2>
                <p className="text-gray-600">{user.email}</p>
                <p className="text-gray-500">{user.mobile}</p>
                <p className="text-gray-500">{user.role}</p>
              </div>
            </div>

            {/* Details Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.keys(formData).map(
                (key) =>
                  key !== "_id" && key !== "__v" && key !== "role" && (
                    <div key={key}>
                      <label className="block text-sm font-medium text-gray-600 mb-1 capitalize">
                        {key}
                      </label>
                      <input
                        type="text"
                        value={formData[key] || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, [key]: e.target.value })
                        }
                        className="w-full border rounded px-3 py-2 text-sm  text-gray-600"
                        disabled={!editing}
                      />
                    </div>
                  )
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 mt-6">
              {editing ? (
                <>
                  <button
                    onClick={() => setEditing(false)}
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
                </>
              ) : (
                <button
                  onClick={() => setEditing(true)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded"
                >
                  Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
