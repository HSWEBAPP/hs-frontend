import React, { useEffect, useState } from "react";
import { useWallet } from "../../contexts/WalletContext";
import { useNavigate, useLocation, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { jwtDecode } from "jwt-decode";

const WalletHeader = ({ user }) => {
  const { balance, fetchBalance } = useWallet();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [logoutConfirm, setLogoutConfirm] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token");
  let role = null;
  if (token) {
    const decoded = jwtDecode(token);
    role = decoded.role;
  }
  console.log(role, 8989);

  useEffect(() => {
    fetchBalance();
  }, []);

  // Generate dynamic breadcrumbs from pathname
  const pathnames = location.pathname.split("/").filter(Boolean);

  const handleLogout = () => {
    setLogoutConfirm(false);
    localStorage.removeItem("token");
    navigate("/login");
    toast.success("Logged out successfully");
  };
  // Get user name from localStorage
  const userName = localStorage.getItem("userName") || "?";

  // User first letter avatar
  const firstLetter = userName?.charAt(0).toUpperCase() || "?";
  const avatarBg =
    "#" + ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, "0");

  return (
    <div className="bg-gray-100 p-2 flex flex-col md:flex-row md:items-center md:justify-between">
      {/* Breadcrumbs */}
      <div className="text-sm text-gray-600 mb-2 md:mb-0">
        <span
          className="cursor-pointer hover:underline"
          onClick={() => navigate("/")}
        >
          Home
        </span>
        {pathnames.map((name, idx) => (
          <span key={idx}>
            {" / "}
            <span
              className="capitalize cursor-pointer hover:underline"
              onClick={() =>
                navigate("/" + pathnames.slice(0, idx + 1).join("/"))
              }
            >
              {name}
            </span>
          </span>
        ))}
      </div>

      {/* Wallet & Profile */}
      <div className="flex items-center space-x-4">
        {/* Wallet Balance */}
       
        {role === "user" && (
          <>
          <p
            className={`font-bold me-1 ${
              balance > 50
                ? "text-green-500"
                : balance > 10
                ? "text-orange-500"
                : "text-red-500"
            }`}
          >
            Wallet Balance: ₹{Number(balance).toLocaleString()}
          </p> <Link to="/wallet" className="!underline">(Recharge)</Link>
          </>
        )}

        {/* Profile Avatar */}
        <div className="relative">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold cursor-pointer"
            style={{ backgroundColor: avatarBg }}
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            {firstLetter}
          </div>

          {/* Dropdown */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white shadow-lg rounded border border-gray-200 z-50">
              <button
                className="block w-full !bg-black text-left px-4 py-2 hover:bg-gray-100"
                onClick={() => {
                  setDropdownOpen(false);
                  navigate("/settings");
                }}
              >
                Settings
              </button>
              <button
                className="block w-full text-left px-4 py-2 !bg-black hover:bg-gray-100 text-red-500"
                onClick={() => {
                  setLogoutConfirm(true);
                  setDropdownOpen(false);
                }}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Logout confirmation modal */}
      {logoutConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded p-6 shadow-lg w-80">
            <p className="mb-4 text-gray-700 font-medium">
              Are you sure you want to logout?
            </p>
            <div className="flex justify-end space-x-4">
              <button
                className="px-4 py-2 !bg-gray-200 rounded text-black hover:bg-gray-300"
                onClick={() => setLogoutConfirm(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 !bg-red-500 text-white rounded hover:bg-red-600"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletHeader;
