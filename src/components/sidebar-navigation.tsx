"use client";
import React from "react";
import {
  Image as ImageIcon,
  Type,
  Wrench,
  Component,
  LayoutTemplate,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useResponsive } from "@/hooks/useResponsive";

export type EditorMode =
  | "templates"
  | "elements"
  | "text"
  | "tools"
  | "advanced-settings"
  | "position"
  | "effects"
  | "context-menu"
  | null;

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
  const { isMobile } = useResponsive();

  const handleMouseEnter = (mode: EditorMode) => {
    // Disable hover on mobile
    if (!isMobile) {
      setHoveredMode(mode);
    }
  };

  const handleClick = (mode: EditorMode) => {
    // If clicking on the currently hovered mode, toggle it
    if (editorMode === mode) {
      setEditorMode(null);
    } else {
      setEditorMode(mode);
    }
  };

  // Hide sidebar on mobile - will be replaced by bottom toolbar
  if (isMobile) {
    return null;
  }

  return (
    <aside
      className="w-full md:w-20 flex md:flex-col items-center p-2 md:py-4 flex-shrink-0 relative z-30"
      data-sidebar-nav
    >
      <div className="text-2xl font-bold mr-auto md:mr-0 md:mb-8">CG</div>
      <nav className="flex flex-row md:flex-col space-x-2 md:space-x-0 md:space-y-6">
        <div className="flex items-center justify-center flex-col">
          <Button
            onClick={() => handleClick("templates")}
            onMouseEnter={() => handleMouseEnter("templates")}
            variant="ghost"
            size="icon"
            className={`p-2 rounded-lg hover:cursor-pointer transition-all duration-200 ${
              editorMode === "templates"
                ? "bg-blue-500 shadow-md text-white hover:bg-blue-500"
                : hoveredMode === "templates"
                ? "bg-blue-400 shadow-sm text-white hover:bg-blue-400"
                : "hover:bg-gray-700 text-white"
            }`}
            title="Templates"
          >
            <LayoutTemplate size={24} />
          </Button>
          <span>Design</span>
        </div>
        <div className="flex items-center justify-center flex-col">
          <Button
            onClick={() => handleClick("elements")}
            onMouseEnter={() => handleMouseEnter("elements")}
            variant="ghost"
            size="icon"
            className={`p-2 rounded-lg hover:cursor-pointer transition-all duration-200 ${
              editorMode === "elements"
                ? "bg-green-500 shadow-md text-white hover:bg-green-500"
                : hoveredMode === "elements"
                ? "bg-green-400 shadow-sm text-white hover:bg-green-400"
                : "hover:bg-gray-700 text-white"
            }`}
            title="Elements"
          >
            <Component size={24} />
          </Button>

          <span>Elements</span>
        </div>
        <div className="flex items-center justify-center flex-col">
          <Button
            onClick={() => handleClick("text")}
            onMouseEnter={() => handleMouseEnter("text")}
            variant="ghost"
            size="icon"
            className={`p-2 rounded-lg hover:cursor-pointer transition-all duration-200 ${
              editorMode === "text"
                ? "bg-yellow-500 shadow-md text-white hover:bg-yellow-500"
                : hoveredMode === "text"
                ? "bg-yellow-400 shadow-sm text-white hover:bg-yellow-400"
                : "hover:bg-gray-700 text-white"
            }`}
            title="Add Text"
          >
            <Type size={24} />
          </Button>
          <span>Text</span>
        </div>
        <div className="flex items-center justify-center flex-col">
          <Button
            onClick={() => handleClick("tools")}
            onMouseEnter={() => handleMouseEnter("tools")}
            variant="ghost"
            size="icon"
            className={`p-2 rounded-lg hover:cursor-pointer transition-all duration-200 ${
              editorMode === "tools"
                ? "bg-indigo-500 shadow-md text-white hover:bg-indigo-500"
                : hoveredMode === "tools"
                ? "bg-indigo-400 shadow-sm text-white hover:bg-indigo-400"
                : "hover:bg-gray-700 text-white"
            }`}
            title="Tools"
          >
            <Wrench size={24} />
          </Button>
          <span>Tools</span>
        </div>
        <div className="flex items-center justify-center flex-col">
          <Button
            onClick={onImageUpload}
            variant="ghost"
            size="icon"
            className="p-2 rounded-lg hover:cursor-pointer hover:bg-gray-700 transition-all duration-200 text-white"
            title="Add Image"
          >
            <ImageIcon size={24} />
          </Button>
          <span>Uploads</span>
        </div>
      </nav>
    </aside>
  );
};

export default SidebarNavigation;
