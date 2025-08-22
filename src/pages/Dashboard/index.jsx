import React from "react";
import Sidebar from "../../Components/Sidebar";
import { useWallet } from "../../contexts/WalletContext";
import Header from "../../Components/Header";
import Aadhar from "../../assets/images/aadhar.png";
import Photo from "../../assets/images/photo.png";
import { Link } from "react-router-dom";


export default function Dashboard() {
  const { balance } = useWallet();

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <div className="flex-1">
        {/* Top header */}
        <Header />
        <div className="p-6">
          {/* Printing Tools */}
          <h2 className="text-lg font-semibold text-black mb-4">
            Printing Tools
          </h2>
          <hr className="text-black" />
          <div className="grid grid-cols-3 gap-4 mb-8 mt-4">
          <Link to="/editor">
  <div className="bg-[#FFF4D7] text-black p-4 rounded shadow cursor-pointer transform transition duration-200 hover:scale-105 hover:shadow-xl hover:bg-[#FFE7A1]">
    ID Card Printing
    <div className="mt-4">
      <img src={Aadhar} alt="ID Card" />
    </div>
  </div>
</Link>

            <div className="!bg-[#FFF4D7] text-black p-4 rounded shadow">
              Passport Photo
              <div className="mt-4">
                <img src={Photo} />
              </div>
            </div>
            <div className="!bg-gray-100 p-4 rounded shadow text-black">
              Baby Names
              <div className="mt-4">
                <img src={Photo} />
              </div>
            </div>
          </div>

          {/* Astrology Tools */}
          <h2 className="text-lg font-semibold mb-4  text-black ">Astrology</h2>
          <hr className="text-black" />
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="bg-gray-100 p-4 rounded shadow text-center">
              <div className="text-black">Astrology</div>
              <div className="text-sm text-gray-500">Coming soon...</div>
            </div>
            <div className="bg-gray-100 p-4 rounded shadow text-center">
              <div className="text-black">Marriage Matchmaking</div>
              <div className="text-sm text-gray-500">Coming soon...</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
