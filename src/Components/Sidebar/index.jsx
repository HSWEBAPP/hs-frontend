import React from "react";
import { Link, useLocation } from "react-router-dom";
import Logo from "../../assets/images/Logo.png";
import { jwtDecode } from "jwt-decode";
import {
  LayoutDashboard,
  Wallet,
  History,
  Users,
  QrCode,
  BookOpen,
  Settings,
  FileText,
} from "lucide-react";

export default function Sidebar() {
  const token = localStorage.getItem("token");
  let role = null;
  if (token) {
    const decoded = jwtDecode(token);
    role = decoded.role;
  }

  const location = useLocation();

  // helper to check active link
  const isActive = (path) =>
    location.pathname === path ? "underline font-semibold" : "";

  return (
    <div className="w-60 bg-[#232834] h-screen p-4 flex flex-col">
      {/* Logo */}
      <div className="flex items-center justify-center mb-8">
        <img src={Logo} alt="Logo" className="h-12" />
      </div>

      {/* Menu */}
      <ul className="space-y-4 text-sm flex-1 text-white">
        <li>
          <Link to="/dashboard" className="flex items-center gap-2 !text-white">
            <LayoutDashboard size={18} />
            <span className={`${isActive("/dashboard")} hover:underline`}>
              Dashboard
            </span>
          </Link>
        </li>

        {role === "admin" ? (
          <li>
            <Link to="/admin-wallet" className="flex items-center !text-white gap-2">
              <Wallet size={18} />
              <span className={`${isActive("/admin-wallet")} hover:underline`}>
                Manage Recharge
              </span>
            </Link>
          </li>
        ) : (
          <li>
            <Link to="/wallet" className="flex items-center !text-white gap-2">
              <Wallet size={18} />
              <span className={`${isActive("/wallet")} hover:underline`}>
                Wallet
              </span>
            </Link>
          </li>
        )}

        {role !== "admin" && (
          <li>
            <Link to="/recharge-history" className="flex items-center !text-white gap-2">
              <History size={18} />
              <span className={`${isActive("/recharge-history")} hover:underline`}>
                Recharge History
              </span>
            </Link>
          </li>
        )}

        {role === "admin" && (
          <>
            <li>
              <Link to="/user" className="flex items-center !text-white gap-2">
                <Users size={18} />
                <span className={`${isActive("/user")} hover:underline`}>
                  Manage Users
                </span>
              </Link>
            </li>
            <li>
              <Link to="/QR" className="flex items-center !text-white gap-2">
                <QrCode size={18} />
                <span className={`${isActive("/QR")} hover:underline`}>
                  Manage QR Codes
                </span>
              </Link>
            </li>
          </>
        )}
      </ul>

      {/* <hr className="border-gray-600 my-4" /> */}

      {/* Settings */}
      {/* <ul className="space-y-4 text-sm text-white">
        <li>
          <Link to="/service-catalog" className="flex !text-white items-center gap-2">
            <BookOpen size={18} />
            <span className={`${isActive("/service-catalog")} hover:underline`}>
              Service Catalog
            </span>
          </Link>
        </li>
        <li>
          <Link to="/fields" className="flex !text-white items-center gap-2">
            <FileText size={18} />
            <span className={`${isActive("/fields")} hover:underline`}>Fields</span>
          </Link>
        </li>
        <li>
          <Link to="/payment-settings" className="flex !text-white items-center gap-2">
            <Settings size={18} />
            <span className={`${isActive("/payment-settings")} hover:underline`}>
              Payment Settings
            </span>
          </Link>
        </li>
      </ul> */}
    </div>
  );
}
