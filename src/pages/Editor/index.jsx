// pages/user/PhotoEditorPage.jsx
import React, { useEffect } from "react";
import Sidebar from "../../Components/Sidebar";
import Header from "../../Components/Header";
import PhotoEdit from "../../Components/PhotoEditor";
import ToolButton from "../sample";

const PhotoEditorPage = () => {
  // useEffect(() => {
  //   // Disable right click
  //   const disableContextMenu = (e) => e.preventDefault();
  //   document.addEventListener("contextmenu", disableContextMenu);

  //   // Disable shortcut keys
  //   const disableShortcuts = (e) => {
  //     if (
  //       e.key === "F12" ||
  //       (e.ctrlKey && e.shiftKey && ["I", "J", "C"].includes(e.key)) ||
  //       (e.ctrlKey && e.key === "U")
  //     ) {
  //       e.preventDefault();
  //       alert("Inspect/DevTools is disabled on this page 🚫");
  //     }
  //   };
  //   document.addEventListener("keydown", disableShortcuts);

  //   // Detect if DevTools is open
  //   const checkDevTools = setInterval(() => {
  //     const threshold = 160;
  //     if (
  //       window.outerWidth - window.innerWidth > threshold ||
  //       window.outerHeight - window.innerHeight > threshold
  //     ) {
  //       alert("Developer tools are not allowed here 🚫");
  //       window.location.href = "/"; // redirect to home page
  //     }
  //   }, 1000);

  //   // Cleanup
  //   return () => {
  //     document.removeEventListener("contextmenu", disableContextMenu);
  //     document.removeEventListener("keydown", disableShortcuts);
  //     clearInterval(checkDevTools);
  //   };
  // }, []);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <Header title="Photo Editor" />

      

        {/* Page content */}
        <div className="p-6">
          <div className="bg-white rounded-2xl shadow">
            <PhotoEdit />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhotoEditorPage;
