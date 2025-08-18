"use client";
import React from "react";
import {
  Image as ImageIcon,
  Type,
  Wrench,
  Component,
  LayoutTemplate,
} from "lucide-react";

export type EditorMode = "templates" | "elements" | "text" | "tools" | null;

interface SidebarNavigationProps {
  editorMode: EditorMode;
  setEditorMode: (mode: EditorMode) => void;
  onImageUpload: () => void;
  hoveredMode: EditorMode;
  setHoveredMode: (mode: EditorMode) => void;
}

const SidebarNavigation: React.FC<SidebarNavigationProps> = ({
  editorMode,
  setEditorMode,
  onImageUpload,
  hoveredMode,
  setHoveredMode,
}) => {
  const handleMouseEnter = (mode: EditorMode) => {
    setHoveredMode(mode);
  };

  const handleClick = (mode: EditorMode) => {
    // If clicking on the currently hovered mode, toggle it
    if (editorMode === mode) {
      setEditorMode(null);
    } else {
      setEditorMode(mode);
    }
  };

  return (
    <aside className="w-full md:w-20 flex md:flex-col items-center p-2 md:py-4 flex-shrink-0 relative z-30">
      <div className="text-2xl font-bold mr-auto md:mr-0 md:mb-8">CG</div>
      <nav className="flex flex-row md:flex-col space-x-2 md:space-x-0 md:space-y-6">
        <div className="flex items-center justify-center flex-col">
          <button
            onClick={() => handleClick("templates")}
            onMouseEnter={() => handleMouseEnter("templates")}
            className={`p-2 rounded-lg hover:cursor-pointer transition-all duration-200 ${
              editorMode === "templates"
                ? "bg-blue-500 shadow-md"
                : hoveredMode === "templates"
                ? "bg-blue-400 shadow-sm"
                : "hover:bg-gray-700"
            }`}
            title="Templates"
          >
            <LayoutTemplate size={24} />
          </button>
          <span>Design</span>
        </div>
        <div className="flex items-center justify-center flex-col">
          <button
            onClick={() => handleClick("elements")}
            onMouseEnter={() => handleMouseEnter("elements")}
            className={`p-2 rounded-lg hover:cursor-pointer transition-all duration-200 ${
              editorMode === "elements"
                ? "bg-green-500 shadow-md"
                : hoveredMode === "elements"
                ? "bg-green-400 shadow-sm"
                : "hover:bg-gray-700"
            }`}
            title="Elements"
          >
            <Component size={24} />
          </button>

          <span>Elements</span>
        </div>
        <div className="flex items-center justify-center flex-col">
          <button
            onClick={() => handleClick("text")}
            onMouseEnter={() => handleMouseEnter("text")}
            className={`p-2 rounded-lg hover:cursor-pointer transition-all duration-200 ${
              editorMode === "text"
                ? "bg-yellow-500 shadow-md"
                : hoveredMode === "text"
                ? "bg-yellow-400 shadow-sm"
                : "hover:bg-gray-700"
            }`}
            title="Add Text"
          >
            <Type size={24} />
          </button>
          <span>Text</span>
        </div>
        <div className="flex items-center justify-center flex-col">
          <button
            onClick={() => handleClick("tools")}
            onMouseEnter={() => handleMouseEnter("tools")}
            className={`p-2 rounded-lg hover:cursor-pointer transition-all duration-200 ${
              editorMode === "tools"
                ? "bg-indigo-500 shadow-md"
                : hoveredMode === "tools"
                ? "bg-indigo-400 shadow-sm"
                : "hover:bg-gray-700"
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
            className={`p-2 rounded-lg hover:cursor-pointer hover:bg-gray-700 transition-all duration-200`}
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
