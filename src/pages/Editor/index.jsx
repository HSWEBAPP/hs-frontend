// pages/user/PhotoEditorPage.jsx
import React from "react";
import Sidebar from "../../Components/Sidebar";
import Header from "../../Components/Header";
import PhotoEdit from "../../Components/PhotoEditor";
import ToolButton  from "../sample"

const PhotoEditorPage = () => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <Header title="Photo Editor" />
 <ToolButton
                feature="Photo"
                onUseTool={() => console.log("Photo tool started")}
              />
              <ToolButton
                feature="ID Card"
                onUseTool={() => console.log("ID Card tool started")}
              />
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
