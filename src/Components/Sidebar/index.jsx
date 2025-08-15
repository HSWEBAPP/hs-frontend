import React from "react";
import { Link } from "react-router-dom";
import Logo from "../../assets/images/Logo.png";
import { jwtDecode } from "jwt-decode";
export default function Sidebar() {
  const token = localStorage.getItem("token");
  let role = null;
  if (token) {
    const decoded = jwtDecode(token);
    role = decoded.role;
  }
  console.log(role, 576778);

  return (
    <div className="w-60 bg-[#232834] h-screen p-4 border-r">
      <img src={Logo} />

      {/* Management Section */}
      <div className="py-5">
        {/* <h2 className="text-sm font-bold text-black mb-3">Management</h2> */}
        <ul className="space-y-2 text-sm">
          <li className="mb-3">
            <Link
              to="/dashboard"
              className="!text-white font-semib  hover:underline"
            >
              Dashboard
            </Link>
          </li>
          {/* <li className="mb-3">
            <Link
              to="/recharge"
              className="!text-white font-semib  hover:underline"
            >
              Manage Recharge
            </Link>
          </li>
          <li>
            <Link to="/transactions" className="!text-white hover:underline">
              Manage Transactions
            </Link>
          </li> */}
          {role === "admin" ? (
            <li>
              <Link to="/admin-wallet" className="!text-white hover:underline">
                Wallet
              </Link>
            </li>
          ) : (
            <li>
              <Link to="/wallet" className="!text-white hover:underline">
                Wallet
              </Link>
            </li>
          )}

          {role === "admin" ? (
            <>
              <li>
                <Link to="/user" className="!text-white hover:underline">
                  User
                </Link>
              </li>
              <li>
                <Link to="/QR" className="!text-white hover:underline">
                  QR-code
                </Link>
              </li>
            </>
          ) : null}
        </ul>
      </div>
      <hr className="text-black" />
      {/* Settings Section */}
      <div className="py-5">
        {/* <h2 className="text-sm font-bold text-black mb-3">
          Settings & Customization
        </h2> */}
        <ul className="space-y-2 text-sm">
          <li className="mb-3">
            <Link to="/service-catalog" className="!text-white hover:underline">
              Service Catalog
            </Link>
          </li>
          <li>
            <Link to="/fields" className="!text-white hover:underline">
              Fields
            </Link>
          </li>
          <li>
            <Link
              to="/payment-settings"
              className="!text-white hover:underline"
            >
              Payment Settings
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}
