import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Logo from "../../assets/images/Logo.png";
import { jwtDecode } from "jwt-decode";
import {
  LayoutDashboard,
  Wallet,
  History,
  Users,
  QrCode,
  ChevronLeft,
  ChevronRight,
   Receipt
} from "lucide-react";

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const token = localStorage.getItem("token");
  let role = null;
  if (token) {
    const decoded = jwtDecode(token);
    role = decoded.role;
  }

  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const menuItems = [
    {
      role: "all",
      path: "/dashboard",
      name: "Dashboard",
      icon: <LayoutDashboard size={20} />,
    },
    {
      role: "user",
      path: "/wallet",
      name: "Wallet",
      icon: <Wallet size={20} />,
    },
    {
      role: "admin",
      path: "/admin-wallet",
      name: "Manage Recharge",
      icon: <Wallet size={20} />,
    },
      {
      role: "all",
      path: "/editor",
      name: "Editor",
      icon: <LayoutDashboard size={20} />,
    },
     {
    role: "all",
    path: "/recharge-history",
    name: "Recharge History",
    icon: <History size={20} />,  // <-- Make sure this icon is imported
  },
    {
      role: "all",
      path: "/transaction-history",
      name: "Transaction History",
      icon: <Receipt size={20} />,
    },
    {
      role: "admin",
      path: "/user",
      name: "Manage Users",
      icon: <Users size={20} />,
    },
    {
      role: "admin",
      path: "/QR",
      name: "Manage QR Codes",
      icon: <QrCode size={20} />,
    },
  ];

  return (
    <div
      className={`h-screen bg-[#232834] text-white flex flex-col transition-all duration-300 ${
        isCollapsed ? "w-16" : "w-60"
      } shadow-xl`}
    >
      {/* Logo + Toggle */}
      <div
        className={`flex items-center ${
          isCollapsed ? "justify-center" : "justify-between"
        }  p-2 border-b !border-gray-700`}
      >
        {!isCollapsed && (
          <img src={Logo} alt="Logo" className="h-10 transition-opacity" />
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="!text-gray-400 hover:text-white !p-3"
        >
          {isCollapsed ? (
            <ChevronRight size={20} color="white" />
          ) : (
            <ChevronLeft size={20} color="white" />
          )}
        </button>
      </div>

      {/* Menu */}
      <ul className="flex-1 mt-3 space-y-2">
        {menuItems.map((item, index) => {
          if (item.role !== "all" && item.role !== role) return null;

          return (
            <li key={index} className="mb-0">
              <Link
                to={item.path}
                className={`flex items-center !gap-3 ${
                  isCollapsed ? "justify-center" : ""
                }  !px-4 !py-2 !rounded-md transition-colors duration-200 group 
                ${
                  isActive(item.path)
                    ? "!bg-gray-700 !text-blue-400 font-semibold"
                    : "!text-gray-300 hover:bg-gray-700 hover:text-white"
                }`}
              >
                <div className="relative flex items-center">
                  {item.icon}
                  {isCollapsed && (
                    <span className="absolute  left-10 z-20 bg-gray-800 text-white text-xs px-2 py-3  rounded-r-sm opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity">
                      {item.name}
                    </span>
                  )}
                </div>
                {!isCollapsed && <span>{item.name}</span>}
              </Link>
            </li>
          );
        })}
      </ul>

      {/* Footer */}
      {!isCollapsed && (
        <div className="p-4 text-xs text-gray-400 border-t border-gray-700">
          © 2025 HS Admin
        </div>
      )}
    </div>
  );
}
