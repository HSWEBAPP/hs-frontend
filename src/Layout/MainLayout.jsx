import React from 'react';
import Sidebar from '../Components/Sidebar';

export default function MainLayout({ children }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 p-6 bg-white">
        {children}
      </div>
    </div>
  );
}
