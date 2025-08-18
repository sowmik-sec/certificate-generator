"use client";
import React from "react";
import {
  Image as ImageIcon,
  Type,
  Wrench,
  Component,
  LayoutTemplate,
} from "lucide-react";

export type EditorMode = "templates" | "elements" | "text" | "tools";

interface SidebarNavigationProps {
  editorMode: EditorMode;
  setEditorMode: (mode: EditorMode) => void;
  onImageUpload: () => void;
}

const SidebarNavigation: React.FC<SidebarNavigationProps> = ({
  editorMode,
  setEditorMode,
  onImageUpload,
}) => {
  return (
    <aside className="w-full md:w-20 bg-gray-800 text-white flex md:flex-col items-center p-2 md:py-4 flex-shrink-0">
      <div className="text-2xl font-bold mr-auto md:mr-0 md:mb-8">CG</div>
      <nav className="flex flex-row md:flex-col space-x-2 md:space-x-0 md:space-y-6">
        <div className="flex items-center justify-center flex-col">
          <button
            onClick={() => setEditorMode("templates")}
            className={`p-2 rounded-lg transition-colors ${
              editorMode === "templates" ? "bg-blue-500" : "hover:bg-gray-700"
            }`}
            title="Templates"
          >
            <LayoutTemplate size={24} />
          </button>
          <span>Design</span>
        </div>
        <div className="flex items-center justify-center flex-col">
          <button
            onClick={() => setEditorMode("elements")}
            className={`p-2 rounded-lg transition-colors ${
              editorMode === "elements" ? "bg-green-500" : "hover:bg-gray-700"
            }`}
            title="Elements"
          >
            <Component size={24} />
          </button>

          <span>Elements</span>
        </div>
        <div className="flex items-center justify-center flex-col">
          <button
            onClick={() => setEditorMode("text")}
            className={`p-2 rounded-lg transition-colors ${
              editorMode === "text" ? "bg-yellow-500" : "hover:bg-gray-700"
            }`}
            title="Add Text"
          >
            <Type size={24} />
          </button>
          <span>Text</span>
        </div>
        <div className="flex items-center justify-center flex-col">
          <button
            onClick={() => setEditorMode("tools")}
            className={`p-2 rounded-lg transition-colors ${
              editorMode === "tools" ? "bg-indigo-500" : "hover:bg-gray-700"
            }`}
            title="Tools"
          >
            <Wrench size={24} />
          </button>
          <span>Tools</span>
        </div>
        <div className="flex items-center justify-center flex-col">
          <button
            onClick={onImageUpload}
            className={`p-2 rounded-lg hover:bg-gray-700 transition-colors`}
            title="Add Image"
          >
            <ImageIcon size={24} />
          </button>
          <span>Uploads</span>
        </div>
      </nav>
    </aside>
  );
};

export default SidebarNavigation;
